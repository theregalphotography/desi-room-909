const CONTENTFUL_API_BASE = "https://cdn.contentful.com";
const EVENT_GALLERY_CONTENT_TYPE = "eventGallery";
const ABOUT_PAGE_CONTENT_TYPE = "aboutPage";
const UPCOMING_TEASER_CONTENT_TYPE = "upcomingTeaser";
const HERO_EVENT_POSTER_CONTENT_TYPE = "heroEventPoster";
export const GALLERY_CACHE_TAG = "gallery";
export const ABOUT_PAGE_CACHE_TAG = "about-page";
export const UPCOMING_TEASERS_CACHE_TAG = "upcoming-teasers";
export const HERO_EVENT_POSTER_CACHE_TAG = "hero-event-poster";

/** Maps a Contentful content type ID (from a webhook payload) to its cache tag. */
export const CONTENTFUL_TAGS_BY_CONTENT_TYPE: Record<string, string> = {
  [EVENT_GALLERY_CONTENT_TYPE]: GALLERY_CACHE_TAG,
  [ABOUT_PAGE_CONTENT_TYPE]: ABOUT_PAGE_CACHE_TAG,
  [UPCOMING_TEASER_CONTENT_TYPE]: UPCOMING_TEASERS_CACHE_TAG,
  [HERO_EVENT_POSTER_CONTENT_TYPE]: HERO_EVENT_POSTER_CACHE_TAG,
};

export interface GalleryPhoto {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  fileName: string;
}

export interface EventGallery {
  id: string;
  title: string;
  eventReference: string;
  eventDate: string;
  photos: GalleryPhoto[];
}

interface ContentfulAssetFile {
  url: string;
  fileName: string;
  details?: { image?: { width: number; height: number } };
}

interface ContentfulAsset {
  sys: { id: string };
  fields: { title?: string; file: ContentfulAssetFile };
}

interface ContentfulEntry {
  sys: { id: string };
  fields: {
    title?: string;
    eventReference?: string;
    eventDate?: string;
    photos?: Array<{ sys: { id: string } }>;
  };
}

interface ContentfulEntriesResponse {
  items: ContentfulEntry[];
  includes?: { Asset?: ContentfulAsset[] };
}

function getConfig() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !accessToken) {
    throw new Error(
      "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN environment variables"
    );
  }
  return { spaceId, accessToken };
}

function toAbsoluteAssetUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

function mapAsset(asset: ContentfulAsset | undefined, fallbackName: string): GalleryPhoto | null {
  if (!asset?.fields?.file) return null;
  const { file, title } = asset.fields;
  return {
    id: asset.sys.id,
    url: toAbsoluteAssetUrl(file.url),
    width: file.details?.image?.width ?? 1600,
    height: file.details?.image?.height ?? 1600,
    alt: title || fallbackName,
    fileName: file.fileName || fallbackName,
  };
}

function mapEntry(entry: ContentfulEntry, assetsById: Map<string, ContentfulAsset>): EventGallery {
  const { fields } = entry;
  const photoLinks = fields.photos ?? [];
  const photos = photoLinks
    .map((link, index) => mapAsset(assetsById.get(link.sys.id), `photo-${index + 1}`))
    .filter((photo): photo is GalleryPhoto => photo !== null);

  return {
    id: entry.sys.id,
    title: fields.title ?? "Untitled Night",
    eventReference: fields.eventReference ?? "",
    eventDate: fields.eventDate ?? "",
    photos,
  };
}

/**
 * Fetches all published event photo galleries from Contentful, most recent first.
 * Revalidated on-demand via the Contentful publish webhook (see app/api/revalidate/gallery).
 */
export async function getEventGalleries(): Promise<EventGallery[]> {
  const { spaceId, accessToken } = getConfig();
  const params = new URLSearchParams({
    content_type: EVENT_GALLERY_CONTENT_TYPE,
    order: "-fields.eventDate",
    include: "2",
    limit: "100",
  });

  const res = await fetch(
    `${CONTENTFUL_API_BASE}/spaces/${spaceId}/environments/master/entries?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "force-cache",
      next: { tags: [GALLERY_CACHE_TAG] },
    }
  );

  if (!res.ok) {
    throw new Error(`Contentful request failed: ${res.status} ${res.statusText}`);
  }

  const data: ContentfulEntriesResponse = await res.json();
  const assetsById = new Map((data.includes?.Asset ?? []).map((asset) => [asset.sys.id, asset]));

  return data.items
    .map((entry) => mapEntry(entry, assetsById))
    .filter((gallery) => gallery.photos.length > 0);
}

export interface AboutPage {
  heading: string;
  storyParagraphs: string[];
}

interface AboutPageEntry {
  fields: { heading?: string; story?: string };
}

/**
 * Fetches the singleton "About Page" entry (brand story heading + body text).
 * Falls back to null if no entry has been published yet, so the About page
 * can render sensible placeholder copy instead of erroring.
 */
export async function getAboutPage(): Promise<AboutPage | null> {
  const { spaceId, accessToken } = getConfig();
  const params = new URLSearchParams({
    content_type: ABOUT_PAGE_CONTENT_TYPE,
    limit: "1",
  });

  const res = await fetch(
    `${CONTENTFUL_API_BASE}/spaces/${spaceId}/environments/master/entries?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "force-cache",
      next: { tags: [ABOUT_PAGE_CACHE_TAG] },
    }
  );

  if (!res.ok) {
    throw new Error(`Contentful request failed: ${res.status} ${res.statusText}`);
  }

  const data: { items: AboutPageEntry[] } = await res.json();
  const entry = data.items[0];
  if (!entry) return null;

  const heading = entry.fields.heading ?? "";
  const story = entry.fields.story ?? "";

  return {
    heading,
    storyParagraphs: story
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  };
}

export interface UpcomingTeaser {
  id: string;
  title: string;
  timing: string;
  posterUrl: string | null;
}

interface UpcomingTeaserEntry {
  sys: { id: string };
  fields: {
    title?: string;
    timing?: string;
    order?: number;
    poster?: { sys: { id: string } };
  };
}

/**
 * Fetches "coming soon" room teasers — rooms without a confirmed Eventbrite
 * date/venue yet. No booking, no exact date; shown below the real Eventbrite
 * hero event on Home and alongside bookable events on the Events page.
 * Sorted by the optional `order` field (ascending); entries without one sort
 * after all ordered entries, in the order Contentful returned them.
 */
export async function getUpcomingTeasers(): Promise<UpcomingTeaser[]> {
  const { spaceId, accessToken } = getConfig();
  const params = new URLSearchParams({
    content_type: UPCOMING_TEASER_CONTENT_TYPE,
    include: "1",
    limit: "50",
  });

  const res = await fetch(
    `${CONTENTFUL_API_BASE}/spaces/${spaceId}/environments/master/entries?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "force-cache",
      next: { tags: [UPCOMING_TEASERS_CACHE_TAG] },
    }
  );

  if (!res.ok) {
    throw new Error(`Contentful request failed: ${res.status} ${res.statusText}`);
  }

  const data: { items: UpcomingTeaserEntry[]; includes?: { Asset?: ContentfulAsset[] } } = await res.json();
  const assetsById = new Map((data.includes?.Asset ?? []).map((asset) => [asset.sys.id, asset]));

  return data.items
    .map((entry, index) => {
      const poster = entry.fields.poster ? mapAsset(assetsById.get(entry.fields.poster.sys.id), "teaser") : null;
      return {
        teaser: {
          id: entry.sys.id,
          title: entry.fields.title ?? "Untitled Room",
          timing: entry.fields.timing ?? "",
          posterUrl: poster?.url ?? null,
        },
        // Entries without an explicit order sort after ordered ones, preserving fetch order.
        sortKey: entry.fields.order ?? 10_000 + index,
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ teaser }) => teaser);
}

/** Key used for a poster entry with no `eventId` set — applies to whichever
 * event the caller treats as primary (Home's first card, Events' soonest
 * event), so existing single-entry setups keep working unchanged. */
export const DEFAULT_HERO_POSTER_KEY = "default";

interface HeroEventPosterEntry {
  fields: {
    eventId?: string;
    poster?: { sys: { id: string } };
  };
}

/**
 * Fetches Home "Happening Next" poster overrides, keyed by Eventbrite event
 * ID (or `DEFAULT_HERO_POSTER_KEY` for an entry with no `eventId` set). All
 * other event details (name, date, venue, tickets) still come from
 * Eventbrite — this only swaps the image. Two published events need two
 * entries in Contentful: one with `eventId` matching the second event's
 * Eventbrite ID, so it doesn't collide with the default/primary poster.
 */
export async function getHeroEventPosters(): Promise<Record<string, string>> {
  const { spaceId, accessToken } = getConfig();
  const params = new URLSearchParams({
    content_type: HERO_EVENT_POSTER_CONTENT_TYPE,
    include: "1",
    limit: "10",
  });

  const res = await fetch(
    `${CONTENTFUL_API_BASE}/spaces/${spaceId}/environments/master/entries?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "force-cache",
      next: { tags: [HERO_EVENT_POSTER_CACHE_TAG] },
    }
  );

  if (!res.ok) {
    throw new Error(`Contentful request failed: ${res.status} ${res.statusText}`);
  }

  const data: { items: HeroEventPosterEntry[]; includes?: { Asset?: ContentfulAsset[] } } = await res.json();
  const assetsById = new Map((data.includes?.Asset ?? []).map((asset) => [asset.sys.id, asset]));

  const posters: Record<string, string> = {};
  for (const entry of data.items) {
    if (!entry.fields.poster) continue;
    const poster = mapAsset(assetsById.get(entry.fields.poster.sys.id), "hero-poster");
    if (!poster) continue;
    posters[entry.fields.eventId?.trim() || DEFAULT_HERO_POSTER_KEY] = poster.url;
  }
  return posters;
}

export function formatEventMeta(eventDate: string): string {
  if (!eventDate) return "";
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
    .format(date)
    .toUpperCase();
}
