const EVENTBRITE_API_BASE = "https://www.eventbriteapi.com/v3";

export interface EventbriteEvent {
  id: string;
  slug: string;
  name: string;
  summary: string;
  startUtc: string;
  endUtc: string;
  timezone: string;
  venueName: string;
  venueAddress: string;
  logoUrl: string | null;
  ticketUrl: string;
  hasAvailableTickets: boolean;
}

interface RawEventbriteEvent {
  id: string;
  name: { text: string };
  summary: string | null;
  start: { utc: string; timezone: string };
  end: { utc: string; timezone: string };
  url: string;
  logo: { original?: { url: string }; url: string } | null;
  venue?: { name: string; address?: { localized_address_display?: string } } | null;
  ticket_availability?: { has_available_tickets: boolean } | null;
}

interface EventbriteEventsResponse {
  pagination: { has_more_items: boolean; continuation?: string };
  events: RawEventbriteEvent[];
}

function getConfig() {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const orgId = process.env.EVENTBRITE_ORG_ID;
  if (!token || !orgId) {
    throw new Error("Missing EVENTBRITE_PRIVATE_TOKEN or EVENTBRITE_ORG_ID environment variables");
  }
  return { token, orgId };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapEvent(raw: RawEventbriteEvent): EventbriteEvent {
  return {
    id: raw.id,
    slug: `${slugify(raw.name.text)}-${raw.id}`,
    name: raw.name.text,
    summary: raw.summary ?? "",
    startUtc: raw.start.utc,
    endUtc: raw.end.utc,
    timezone: raw.start.timezone,
    venueName: raw.venue?.name ?? "Location TBA",
    venueAddress: raw.venue?.address?.localized_address_display ?? "",
    logoUrl: raw.logo?.original?.url ?? raw.logo?.url ?? null,
    ticketUrl: raw.url,
    // Only present when `ticket_availability` is expanded; default to bookable
    // rather than hiding the CTA on events where the field wasn't returned.
    hasAvailableTickets: raw.ticket_availability?.has_available_tickets ?? true,
  };
}

/**
 * Fetches every event in the org, across pages. Filtering into
 * upcoming/past happens in getUpcomingEvents/getPastEvents below —
 * this function never runs on its own from a page or component.
 */
async function fetchAllEvents(): Promise<EventbriteEvent[]> {
  const { token, orgId } = getConfig();
  const events: RawEventbriteEvent[] = [];
  let continuation: string | undefined;
  // Safety cap: an org with more than ~100 pages of events almost certainly
  // indicates a bug elsewhere rather than a legitimate catalog size.
  for (let page = 0; page < 100; page++) {
    const params = new URLSearchParams({
      order_by: "start_asc",
      expand: "logo,venue,ticket_availability",
      status: "live,started,ended,completed",
    });
    if (continuation) params.set("continuation", continuation);

    const res = await fetch(`${EVENTBRITE_API_BASE}/organizations/${orgId}/events/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Eventbrite request failed: ${res.status} ${res.statusText}`);
    }

    const data: EventbriteEventsResponse = await res.json();
    events.push(...data.events);

    if (!data.pagination.has_more_items || !data.pagination.continuation) break;
    continuation = data.pagination.continuation;
  }

  return events.map(mapEvent);
}

function sortByStartAsc(events: EventbriteEvent[]): EventbriteEvent[] {
  return [...events].sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());
}

/** Upcoming = events whose end date/time is still in the future, soonest first. */
export async function getUpcomingEvents(): Promise<EventbriteEvent[]> {
  const now = Date.now();
  const events = await fetchAllEvents();
  return sortByStartAsc(events).filter((event) => new Date(event.endUtc).getTime() > now);
}

/** Past = events that have already ended, most recently ended first. */
export async function getPastEvents(): Promise<EventbriteEvent[]> {
  const now = Date.now();
  const events = await fetchAllEvents();
  return sortByStartAsc(events)
    .filter((event) => new Date(event.endUtc).getTime() <= now)
    .reverse();
}

export async function getEventBySlug(slug: string): Promise<EventbriteEvent | null> {
  const events = await fetchAllEvents();
  return events.find((event) => event.slug === slug) ?? null;
}

/** Pure selection helper over an already-fetched, sorted upcoming list. */
export function selectHeroEvent(upcoming: EventbriteEvent[]): EventbriteEvent | null {
  return upcoming[0] ?? null;
}

export function formatEventDateBadge(startIso: string, timeZone: string): string {
  const date = new Date(startIso);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date).toUpperCase();
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone })
    .format(date)
    .toUpperCase();
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", timeZone }).format(date).replace(" ", "");
  return `${weekday} · ${monthDay} · ${time}`;
}

export function formatShortEventDate(startIso: string, timeZone: string): string {
  const date = new Date(startIso);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date).toUpperCase();
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone })
    .format(date)
    .toUpperCase();
  return `${weekday} ${monthDay}`;
}

export function formatEventTimeRange(startIso: string, endIso: string, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone });
  return `${formatter.format(new Date(startIso))} – ${formatter.format(new Date(endIso))}`;
}

export function formatPastEventDate(endIso: string, timeZone: string): string {
  const date = new Date(endIso);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone })
    .format(date)
    .toUpperCase();
}
