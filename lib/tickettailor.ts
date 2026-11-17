import type { TicketEvent } from "@/lib/events";

const TICKET_TAILOR_API_BASE = "https://api.tickettailor.com/v1";
const PAGE_LIMIT = 100;
const DEFAULT_TIMEZONE = "America/New_York";

/** Cache tag on every Ticket Tailor fetch; busted by app/api/revalidate/tickettailor. */
export const TICKET_TAILOR_EVENTS_CACHE_TAG = "tickettailor-events";

/**
 * Ticket Tailor returns many flags as the strings "true"/"false" rather than
 * JSON booleans; accept either so a format change can't flip availability.
 */
type Flag = boolean | "true" | "false" | null | undefined;

interface RawDateTime {
  iso?: string;
  unix?: number;
  timezone?: string;
}

/**
 * Only the fields this site reads, verified against a live `GET /v1/events`
 * response (Nov 2026). Flags arrive as the strings "true"/"false". Still read
 * defensively (every field optional) in case the API adds or drops fields.
 */
interface RawTicketTailorEvent {
  id: string;
  name?: string;
  description?: string | null;
  start?: RawDateTime;
  end?: RawDateTime;
  timezone?: string;
  venue?: {
    name?: string | null;
    address?: string | null;
    address_2?: string | null;
    city?: string | null;
    postal_code?: string | null;
  } | null;
  images?: { header?: string | null; thumbnail?: string | null } | null;
  url?: string;
  checkout_url?: string;
  status?: string;
  hidden?: Flag;
  private?: Flag;
  unavailable?: Flag;
  tickets_available?: Flag;
}

interface RawListResponse {
  data?: RawTicketTailorEvent[];
}

/** Statuses that must never appear on the public site. */
const EXCLUDED_STATUSES = new Set(["draft", "cancelled", "canceled"]);

function getApiKey(): string {
  const apiKey = process.env.TICKETTAILOR_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TICKETTAILOR_API_KEY environment variable");
  }
  return apiKey;
}

function isTrue(flag: Flag): boolean {
  return flag === true || flag === "true";
}

function isFalse(flag: Flag): boolean {
  return flag === false || flag === "false";
}

function toIso(value: RawDateTime | undefined): string | null {
  if (value?.iso) return new Date(value.iso).toISOString();
  if (typeof value?.unix === "number") return new Date(value.unix * 1000).toISOString();
  return null;
}

/** Description is HTML in Ticket Tailor; the UI shows a short plain-text summary. */
function toSummary(html: string | null | undefined, maxLength = 220): string {
  if (!html) return "";
  const text = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 0) || maxLength).trimEnd()}…`;
}

/**
 * Hosts Ticket Tailor serves event images from. Must match
 * `images.remotePatterns` in next.config.ts — next/image throws at render
 * time for unlisted hosts, which would take a whole page down, so anything
 * else falls back to the dark placeholder and is logged.
 */
const ALLOWED_IMAGE_DOMAINS = ["tickettailorassets.com", "tickettailor.com"];

function isAllowedImageHost(hostname: string): boolean {
  return ALLOWED_IMAGE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function toPosterUrl(images: RawTicketTailorEvent["images"]): string | null {
  const url = images?.header || images?.thumbnail;
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol === "https:" && isAllowedImageHost(hostname)) {
      return url;
    }
    console.warn(`[tickettailor] Poster host "${hostname}" is not in next.config.ts remotePatterns; using placeholder.`);
  } catch {
    // Malformed URL — fall through to placeholder.
  }
  return null;
}

/**
 * Ticket Tailor only keeps the whole purchase inside an embedded checkout
 * when it's served from the box office's custom domain (a subdomain of our
 * site, e.g. tickets.desiroom909.com). On www.tickettailor.com, a framed
 * checkout moves to a new tab after ticket selection because browsers block
 * its cookies. The API still returns www.tickettailor.com links, so rewrite
 * the host when TICKETTAILOR_CHECKOUT_DOMAIN is set. Unset = links unchanged.
 */
function toCheckoutUrl(url: string | undefined): string {
  if (!url) return "";
  const customDomain = process.env.TICKETTAILOR_CHECKOUT_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!customDomain) return url;
  try {
    const parsed = new URL(url);
    if (!/^(www\.)?tickettailor\.com$/i.test(parsed.hostname)) return url;
    parsed.protocol = "https:";
    parsed.host = customDomain;
    return parsed.toString();
  } catch {
    return url;
  }
}

function mapEvent(raw: RawTicketTailorEvent): TicketEvent | null {
  const startUtc = toIso(raw.start);
  const endUtc = toIso(raw.end) ?? startUtc;
  if (!startUtc || !endUtc) return null;

  const venue = raw.venue ?? {};
  const streetParts = [venue.address, venue.address_2, venue.city].map((part) => part?.trim()).filter(Boolean);
  // TT often returns only `name` + `postal_code` (the box office puts the
  // full address in the venue name), and a bare zip code reads as noise.
  const venueAddress = streetParts.length
    ? [...streetParts, venue.postal_code?.trim()].filter(Boolean).join(", ")
    : "";

  return {
    id: raw.id,
    name: raw.name?.trim() || "Untitled Room",
    summary: toSummary(raw.description),
    startUtc,
    endUtc,
    timezone: raw.timezone || raw.start?.timezone || DEFAULT_TIMEZONE,
    venueName: venue.name?.trim() || "Location TBA",
    venueAddress,
    posterUrl: toPosterUrl(raw.images),
    checkoutUrl: toCheckoutUrl(raw.checkout_url || raw.url),
    // Default to bookable when the flag is missing, matching previous
    // behavior: a missing field shouldn't hide the CTA on a real event.
    hasAvailableTickets: !isFalse(raw.tickets_available) && !isTrue(raw.unavailable),
  };
}

function isPublic(raw: RawTicketTailorEvent): boolean {
  if (isTrue(raw.hidden) || isTrue(raw.private)) return false;
  return !EXCLUDED_STATUSES.has((raw.status ?? "").toLowerCase());
}

/**
 * Fetches every event in the box office across cursor pages. Filtering into
 * upcoming/past happens in lib/events.ts. The URL/options must stay
 * identical across calls so Next dedupes the two calls /events makes
 * (upcoming + past) within one render.
 */
export async function fetchAllTicketTailorEvents(): Promise<TicketEvent[]> {
  const auth = `Basic ${Buffer.from(`${getApiKey()}:`).toString("base64")}`;
  const raw: RawTicketTailorEvent[] = [];
  let startingAfter: string | undefined;

  // Safety cap: 50 pages × 100 events is far beyond a real catalog.
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (startingAfter) params.set("starting_after", startingAfter);

    const res = await fetch(`${TICKET_TAILOR_API_BASE}/events?${params}`, {
      headers: { Authorization: auth, Accept: "application/json" },
      next: { revalidate: 300, tags: [TICKET_TAILOR_EVENTS_CACHE_TAG] },
    });

    if (!res.ok) {
      throw new Error(`Ticket Tailor request failed: ${res.status} ${res.statusText}`);
    }

    const body: RawListResponse | RawTicketTailorEvent[] = await res.json();
    const items = Array.isArray(body) ? body : body.data ?? [];
    raw.push(...items);

    if (items.length < PAGE_LIMIT) break;
    startingAfter = items[items.length - 1].id;
  }

  return raw
    .filter(isPublic)
    .map(mapEvent)
    .filter((event): event is TicketEvent => event !== null);
}
