
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Desi Room 909 — agent context

Marketing + ticketing site for Desi Room 909, a ticketed South Asian nightlife pop-up brand (Charlotte, NC). Mostly server-rendered pages reading two headless sources: **Eventbrite** (events and tickets) and **Contentful** (galleries, About copy, teasers, poster overrides). There is no database, no auth, no first-party payments, and no analytics.

## 1. Tech stack

- **Next.js 16.3 (App Router)**, React 19.2, TypeScript 5.9 (`strict`). Only runtime deps: `next`, `react`, `react-dom`. No CSS framework, no data SDKs; both APIs are called with raw `fetch`.
- Path alias `@/*` → repo root (`tsconfig.json`).
- Styling: mostly **inline `style={{}}` objects** plus design tokens and hover/responsive classes in `app/globals.css` (`--color-*`, `--font-*`, `--page-px`, `.btn-solid`, `.btn-outline`, `.home-hero-*`, `.responsive-cols` driven by a `--cols` CSS var). No Tailwind or CSS modules.
- Fonts (`app/fonts.ts`): Google fonts via `next/font/google` (Big Shoulders = display, Fredoka = brand/"909", Sora = body, Raleway 100 = labels/nav) and local fonts via `next/font/local` (`public/fonts/box/A Box For 2.ttf`, `public/fonts/striker/Striker.ttf`).
- Hosting: **no deploy config in the repo** (no `vercel.json`, no Dockerfile). The host must be a Node runtime that supports ISR, `revalidateTag` and `next/og` (Vercel is the natural fit). The GitHub org is `theregalphotography`; work goes through PRs into `main`.

## 2. Directory & architecture map

```
app/
  layout.tsx            Root layout: font CSS vars, metadata (metadataBase from NEXT_PUBLIC_SITE_URL), noise overlay
  page.tsx              Home: hero, marquee, "Happening Next" (1 or 2 Eventbrite events), teasers, CTAs   [ISR 300s]
  events/page.tsx       Upcoming grid + "More On The Way" teasers + past events ("Rooms We Left Behind") [ISR 300s]
  gallery/page.tsx      Contentful eventGallery albums → <GalleryAlbums> (client lightbox)              [tag-cached]
  about/page.tsx        Contentful aboutPage singleton, with hardcoded FALLBACK_ABOUT                   [tag-cached]
  contact/page.tsx      Static: hardcoded email/phone/IG/WhatsApp + house rules
  icon.tsx              Generated favicon ("909") via next/og ImageResponse; reads font from disk
  api/revalidate/contentful/route.ts   POST webhook → revalidateTag (the only API route)
  fonts.ts, globals.css
lib/
  eventbrite.ts         Eventbrite REST client, mapping, upcoming/past split, date formatters
  contentful.ts         Contentful CDA client, 4 content-type fetchers, cache tags, CONTENTFUL_TAGS_BY_CONTENT_TYPE
components/
  Header.tsx            "use client" — nav + mobile toggle; `active` prop typed from NAV_ITEMS
  Footer.tsx, HomeFooter.tsx, Logo.tsx, ComingSoonCard.tsx
  eventbrite/TicketWidget.tsx   "use client" — Eventbrite embedded checkout modal
  eventbrite/EventPoster.tsx    next/image fill wrapper (null src → dark placeholder)
  eventbrite/HeroPairCard.tsx   One card of Home's two-event layout
  gallery/GalleryAlbums.tsx     "use client" — paging (8/album), lightbox, keyboard nav, blob download
contentful/migrations/  001–004 contentful-migration scripts (source of truth for content models)
docs/contentful-content-guide.md   Client-facing ownership/workflow guide (partly stale, see §6)
public/hero/            Hero background images; public/fonts/ local font files
```

Server components fetch data. Every page wraps each fetch in a local `loadX()` that **catches all errors and returns an empty value or fallback**, so pages never throw. Only Header, TicketWidget and GalleryAlbums are client components.

## 3. Third-party integrations

### Eventbrite: events (REST API v3)
- **Files:** `lib/eventbrite.ts` (data), `components/eventbrite/*` (UI). Images are allowed from `cdn.evbuc.com` and `img.evbuc.com` in `next.config.ts`.
- **Env:** `EVENTBRITE_PRIVATE_TOKEN` (Bearer), `EVENTBRITE_ORG_ID`. `getConfig()` throws if either is missing, and the page loaders swallow that error.
- **Flow:** `fetchAllEvents()` → `GET /organizations/{orgId}/events/?order_by=start_asc&expand=logo,venue,ticket_availability&status=live,started,ended,completed`. It follows `continuation` pagination (capped at 100 pages) and uses `fetch` with `next: { revalidate: 300 }`. `mapEvent()` produces `EventbriteEvent`.
  - `getUpcomingEvents()`: `endUtc > now`, soonest first. `getPastEvents()`: ended, most recent first. `selectHeroEvent()` returns `upcoming[0]`.
  - Home shows `upcoming.slice(0, 2)`: two events render `HeroPairCard` ×2, one event renders the single hero grid.
- **No inbound Eventbrite webhook.** Freshness comes only from the 5-minute ISR window.
- **Checkout:** `TicketWidget` loads `https://www.eventbrite.com/static/widgets/eb_widgets.js` (`next/script`, `lazyOnload`) and calls `EBWidgets.createWidget({ widgetType: "checkout", modal: true, modalTriggerElementId })`. Payment happens entirely inside Eventbrite's modal. When `hasAvailableTickets` is false, a "SOLD OUT" or "AT CAPACITY" label renders instead.

### Contentful: CMS (Content Delivery API)
- **Files:** `lib/contentful.ts`, `contentful/migrations/*.js`, `app/api/revalidate/contentful/route.ts`. Images are allowed from `images.ctfassets.net` and `downloads.ctfassets.net`.
- **Env:** `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` (a CDA token, so published content only), `CONTENTFUL_WEBHOOK_SECRET`. Migrations need a separate **CMA** token, passed on the CLI and never stored in env.
- **Flow:** `GET https://cdn.contentful.com/spaces/{space}/environments/master/entries?content_type=…`. Linked assets are resolved manually from `includes.Asset` (`mapAsset`, which turns `//` URLs into `https:`). Fetches use `cache: "force-cache"` plus `next.tags`, so they are cached until a tag is busted.

| Content type | Fetcher | Cache tag | Used on |
|---|---|---|---|
| `eventGallery` | `getEventGalleries()` (limit 100, include 2, `-fields.eventDate`) | `gallery` | /gallery |
| `aboutPage` (singleton) | `getAboutPage()` (`items[0]`) | `about-page` | /about |
| `upcomingTeaser` | `getUpcomingTeasers()` (limit 50, sorted by `order`, unset sorts last) | `upcoming-teasers` | Home (first 2), /events |
| `heroEventPoster` | `getHeroEventPosters()` (limit 10) returns `{ [eventId or "default"]: url }` | `hero-event-poster` | Home hero, /events soonest tile |

- **Webhook:** `POST /api/revalidate/contentful`. It requires header `X-Webhook-Secret` to equal `CONTENTFUL_WEBHOOK_SECRET` (otherwise 401). It reads `sys.contentType.sys.id`, maps it through `CONTENTFUL_TAGS_BY_CONTENT_TYPE`, and calls `revalidateTag(tag, { expire: 0 })`. Unknown types return 200 with `revalidated: false`. One Contentful webhook (Entry publish/unpublish) covers all four types.
- **Adding a content type:** write a new numbered migration, add the fetcher, add a tag constant **and** a `CONTENTFUL_TAGS_BY_CONTENT_TYPE` entry (without that entry the webhook can't bust the tag), and keep field IDs identical between the migration and the `fields.*` reads.

### Other external links (hardcoded, no API)
- Instagram `instagram.com/desiroom909`, WhatsApp `wa.me/<number>`, `tel:` and `mailto:` links. They are duplicated across `app/page.tsx`, `app/events/page.tsx`, `app/contact/page.tsx`, `components/Footer.tsx` and `components/HomeFooter.tsx`, so update all of them together.
- `images.unsplash.com` is allowed in `next.config.ts` but currently unused.

### Not present
No database, ORM, auth, sessions, first-party payments (Stripe etc.), analytics or tracking, email service, or env-validated config layer.

## 4. Data & state

- **No database.** Eventbrite and Contentful are the only persistent state, and the content models live in `contentful/migrations/`.
- **Caching layer = Next data cache:**
  - Eventbrite: time-based, 300s (`export const revalidate = 300` on `/` and `/events`, plus `next.revalidate` on the fetch).
  - Contentful: indefinite `force-cache` plus tag invalidation via the webhook. `/gallery` and `/about` export no `revalidate`.
- Domain types: `EventbriteEvent` (`lib/eventbrite.ts`); `EventGallery`, `GalleryPhoto`, `AboutPage`, `UpcomingTeaser` (`lib/contentful.ts`).
- Client state is local `useState` only (nav toggle, gallery paging and lightbox). There is no global store.
- Poster override resolution: `heroPosters[event.id]` first, then `heroPosters["default"]` (applied **only to the first/soonest event**), then the Eventbrite `logoUrl`, then the placeholder.

## 5. Commands

```
npm run dev         # next dev (also regenerates the nextjs-agent-rules block above)
npm run build       # next build — the only full verification step
npm run start
npm run typecheck   # tsc --noEmit
```
- **No lint script, no test framework, no CI config.** Verify with `typecheck` and `build`.
- Local env: copy `.env.example` to `.env.local`. Without Eventbrite or Contentful creds the pages still render, but with empty or fallback states.
- Contentful migration: `npx contentful-migration --space-id <ID> --environment-id master --access-token <CMA_TOKEN> --yes contentful/migrations/00X-*.js` (the script path is positional).

## 6. Gotchas & technical debt

- **Errors are invisible.** Every loader swallows exceptions, so a bad token or API outage shows up as "NO DOORS OPEN RIGHT NOW", an empty gallery, or fallback About copy. Nothing is logged. On ISR pages that empty result can be cached for up to 5 minutes.
- **Eventbrite:**
  - `hasAvailableTickets` defaults to `true` when `ticket_availability` is missing.
  - Draft and canceled events are excluded by the `status` filter.
  - "Upcoming" is keyed on **end** time, so events in progress still show as upcoming.
  - `/events` calls `getUpcomingEvents` and `getPastEvents`, which each call `fetchAllEvents`. This relies on Next's fetch dedup and cache, so keep the fetch URL and options identical.
  - Eventbrite rate-limits per token. Don't add per-request or uncached calls.
- **TicketWidget:** the DOM id is `eventbrite-widget-modal-trigger-${eventId}`, so rendering the same event twice on one page creates duplicate IDs. A 150ms polling fallback exists because `onReady` can fire before `window.EBWidgets` is set when two widgets share the script (Home's two-event pair). Don't remove it.
- **Webhook:**
  - Only entry payloads carry `sys.contentType`, so **replacing an asset file in place does not bust any cache** (the entry must be republished).
  - The secret check is a plain `!==` comparison (not timing-safe).
  - The Contentful environment is hardcoded to `master` everywhere.
- **Contentful limits:** galleries are capped at 100 entries with no pagination (and a large `include=2` response could hit CDA response-size limits). Teasers are capped at 50 and posters at 10. Duplicate `heroEventPoster.eventId` values resolve last-wins, and entries without `eventId` all collapse into `"default"`.
- **Manual editorial upkeep:** teasers are never deduped against real Eventbrite events, and a stale `heroEventPoster` is never detected. The client has to unpublish both by hand.
- **Dates:** Eventbrite formatters use the event's own `timezone`. `formatEventMeta()` (gallery month/year) uses the **server's local timezone** on a date-only string, so it can show the previous month when run in a US timezone. It is correct on UTC hosts.
- **Fonts/licensing:** "A Box For" (hero wordmark and favicon) and "Striker" are marked *preview-only*. A Box For needs a **paid license before production**. `app/icon.tsx` reads the TTF via `process.cwd()`, so the font must exist at runtime on the host.
- **Fragile asset path:** the Home brand-statement background uses the relative `url('hero/defines.jpeg')` (no leading `/`). It only works because it renders on `/`.
- **Dead or stale code:**
  - `getEventBySlug()` and `EventbriteEvent.slug` are unused (there is no event detail route).
  - `TICKETS_URL` (`buytickets.at`) in `app/page.tsx` is only referenced by commented-out JSX.
  - The unsplash image domain is unused.
  - The `getEventGalleries` JSDoc points at a nonexistent `app/api/revalidate/gallery`.
  - `docs/contentful-content-guide.md` still calls `heroEventPoster` a singleton and lists only migrations 001–003 (004 added `eventId`).
- **Inline-style convention:** most styling lives in inline objects, so to restyle something, search the component first and `globals.css` second. Hover, focus and media-query behavior must go in `globals.css` classes because inline styles can't express it.
- **Next 16 APIs:** e.g. `revalidateTag(tag, { expire: 0 })` uses the two-argument form. Check `node_modules/next/dist/docs/` before using any caching or routing API from memory.
- **Never commit secrets.** Real values live only in `.env.local`, which is gitignored. `.env.example` lists names only.
