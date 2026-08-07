const CONTENTFUL_API_BASE = "https://cdn.contentful.com";
const EVENT_GALLERY_CONTENT_TYPE = "eventGallery";
const ABOUT_PAGE_CONTENT_TYPE = "aboutPage";
export const GALLERY_CACHE_TAG = "gallery";
export const ABOUT_PAGE_CACHE_TAG = "about-page";

/** Maps a Contentful content type ID (from a webhook payload) to its cache tag. */
export const CONTENTFUL_TAGS_BY_CONTENT_TYPE: Record<string, string> = {
  [EVENT_GALLERY_CONTENT_TYPE]: GALLERY_CACHE_TAG,
  [ABOUT_PAGE_CONTENT_TYPE]: ABOUT_PAGE_CACHE_TAG,
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

export function formatEventMeta(eventDate: string): string {
  if (!eventDate) return "";
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
    .format(date)
    .toUpperCase();
}
