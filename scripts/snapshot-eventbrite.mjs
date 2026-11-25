/**
 * One-time, read-only export of past Eventbrite events for the
 * "Rooms We Left Behind" section after the move to Ticket Tailor.
 *
 *   npm run snapshot:eventbrite
 *
 * Reads EVENTBRITE_PRIVATE_TOKEN + EVENTBRITE_ORG_ID from .env.local, then:
 *   - writes data/legacy-events.json (TicketEvent shape, see lib/events.ts)
 *   - downloads each poster to public/legacy-events/<id>.<ext>
 * Only GET requests are made; nothing in Eventbrite is changed. Safe to
 * re-run — it overwrites both outputs. Review the JSON, then commit both.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API_BASE = "https://www.eventbriteapi.com/v3";
const ROOT = process.cwd();
const JSON_PATH = join(ROOT, "data", "legacy-events.json");
const POSTER_DIR = join(ROOT, "public", "legacy-events");
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
const orgId = process.env.EVENTBRITE_ORG_ID;
if (!token || !orgId) {
  console.error("Missing EVENTBRITE_PRIVATE_TOKEN or EVENTBRITE_ORG_ID (add them to .env.local).");
  process.exit(1);
}

async function fetchPastEvents() {
  const events = [];
  let continuation;
  for (let page = 0; page < 100; page++) {
    const params = new URLSearchParams({
      order_by: "start_asc",
      expand: "logo,venue",
      status: "live,started,ended,completed",
    });
    if (continuation) params.set("continuation", continuation);
    const res = await fetch(`${API_BASE}/organizations/${orgId}/events/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Eventbrite request failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    events.push(...data.events);
    if (!data.pagination?.has_more_items || !data.pagination?.continuation) break;
    continuation = data.pagination.continuation;
  }
  const now = Date.now();
  return events.filter((event) => new Date(event.end.utc).getTime() <= now);
}

async function downloadPoster(event) {
  const url = event.logo?.original?.url ?? event.logo?.url;
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const ext = EXTENSIONS[type] ?? "jpg";
    const fileName = `${event.id}.${ext}`;
    await writeFile(join(POSTER_DIR, fileName), Buffer.from(await res.arrayBuffer()));
    return `/legacy-events/${fileName}`;
  } catch (error) {
    console.warn(`  ! poster download failed for "${event.name.text}" (${event.id}): ${error.message}`);
    return null;
  }
}

const past = await fetchPastEvents();
console.log(`Found ${past.length} past Eventbrite event(s).`);
await mkdir(POSTER_DIR, { recursive: true });
await mkdir(join(ROOT, "data"), { recursive: true });

const legacy = [];
for (const event of past) {
  console.log(`  - ${event.start.local?.slice(0, 10) ?? event.start.utc}  ${event.name.text}`);
  legacy.push({
    // Prefixed so legacy IDs can never collide with Ticket Tailor IDs.
    id: `eb_${event.id}`,
    name: event.name.text,
    summary: event.summary ?? "",
    startUtc: event.start.utc,
    endUtc: event.end.utc,
    timezone: event.start.timezone,
    venueName: event.venue?.name ?? "Location TBA",
    venueAddress: event.venue?.address?.localized_address_display ?? "",
    posterUrl: await downloadPoster(event),
    checkoutUrl: "",
    hasAvailableTickets: false,
  });
}

await writeFile(JSON_PATH, `${JSON.stringify(legacy, null, 2)}\n`);
console.log(`\nWrote ${legacy.length} event(s) to data/legacy-events.json and posters to public/legacy-events/.`);
console.log("Review both, then commit them.");
