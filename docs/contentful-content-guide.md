# Contentful content guide

Who's responsible for what, and how content gets from Contentful/Eventbrite onto the site.
A polished client-facing version of this same content is published as an Artifact — ask in
the Claude session that built this to regenerate/update it if needed.

## System overview

Two independent systems feed the site. Neither knows the other exists.

- **Eventbrite** — source of truth for real events (date, venue, poster, tickets). Read via
  `lib/eventbrite.ts`, polled on a 5-minute ISR revalidation (`export const revalidate = 300`
  on `app/page.tsx` and `app/events/page.tsx`).
- **Contentful** — source of truth for photo galleries, About page copy, and non-bookable
  "coming soon" teasers. Read via `lib/contentful.ts`, cached indefinitely and revalidated
  on-demand via the webhook at `app/api/revalidate/contentful/route.ts` (near-instant).

## Eventbrite — fully automatic, no manual step

Client manages events entirely inside Eventbrite as normal. The site derives everything else:

- Soonest published upcoming event → Home page "Happening Next" hero
  (`selectHeroEvent()` in `lib/eventbrite.ts`)
- All published upcoming events → Events page bookable grid (`getUpcomingEvents()`)
- Events past their end time → automatically move to "Rooms We Left Behind"
  (`getPastEvents()`)
- Ticket purchase stays on-site via Eventbrite's embedded checkout widget
  (`components/eventbrite/TicketWidget.tsx`)

No cross-reference to Contentful happens here.

## Contentful — three content types, client-managed

### `eventGallery` (Gallery page)

| Field | Type | Notes |
|---|---|---|
| `title` | Symbol | Displayed heading |
| `eventDate` | Date | Sort order + month/year label |
| `eventReference` | Symbol, optional | Editorial-only note; never displayed, never matched automatically |
| `photos` | Array<Link:Asset> | Full photo batch for that night |

**No automatic link to Eventbrite.** One entry = one event's whole album, created and matched
by the client manually. A wrong title/date won't error, it'll just display wrong.

### `aboutPage` (About page, singleton)

| Field | Type | Notes |
|---|---|---|
| `heading` | Text | Preserve `\n` for the line break, e.g. `"A ROOM,\nNOT A VENUE"` |
| `story` | Text | Paragraphs split on blank lines (`\n\s*\n`) |

Only one entry should ever be published — the app takes `data.items[0]`, first match wins.

### `upcomingTeaser` (Home "Next Editions" + Events "More On The Way")

| Field | Type | Notes |
|---|---|---|
| `title` | Symbol | Working room name |
| `timing` | Symbol | Fuzzy only — "COMING THIS FALL", never an exact date |
| `poster` | Link:Asset | Teaser image, rendered dimmed with a static "COMING SOON" badge |
| `order` | Integer, optional | Ascending sort; unset entries sort last, in fetch order |

No booking, no exact date — deliberately not wired to Eventbrite at all. **Client must manually
unpublish/delete the teaser once the real event goes live in Eventbrite** — the app does not
detect or dedupe this automatically, so both a teaser and the real event can show
simultaneously if forgotten.

## Migrations

Content types are created via versioned migration scripts (not manual UI setup), so field IDs
are guaranteed to match what the code reads:

- `contentful/migrations/001-initial-content-types.js` — `eventGallery`, `aboutPage`
- `contentful/migrations/002-upcoming-teaser.js` — `upcomingTeaser`

Run with `contentful-migration` (via `npx`), requires a Content Management API token
(write access, separate from the runtime `CONTENTFUL_ACCESS_TOKEN` Delivery token). The
script path is a positional argument, not a flag:

```
npx contentful-migration --space-id <SPACE_ID> --environment-id master \
  --access-token <CMA_TOKEN> --yes \
  contentful/migrations/00X-*.js
```

## Revalidation

- Eventbrite pages: time-based ISR, 5 minutes.
- Contentful pages: cached indefinitely (`cache: "force-cache"` + `next.tags`), busted
  on-demand by a Contentful webhook → `app/api/revalidate/contentful/route.ts`, which reads
  `sys.contentType.sys.id` from the webhook payload and calls
  `revalidateTag(tag, { expire: 0 })` for the matching content type.
- Configure **one** webhook in Contentful (Settings → Webhooks) covering all three content
  types — the route reads `sys.contentType.sys.id` from the payload itself and busts the
  matching tag, so a single webhook triggering on Entry publish/unpublish is enough. Point it
  at `https://<your-domain>/api/revalidate/contentful`, with header
  `X-Webhook-Secret: <CONTENTFUL_WEBHOOK_SECRET>` (the real value lives in `.env.local` only —
  never commit it here).
