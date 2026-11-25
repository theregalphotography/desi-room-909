
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Desi Room 909 — agent context

Marketing and ticketing site for Desi Room 909, a ticketed South Asian nightlife pop-up brand (Charlotte, NC). Production domain: **https://www.desiroom909.com**. Pages are mostly server-rendered and read from two headless sources:
- **Ticket Tailor:** events and tickets. It replaced Eventbrite; past Eventbrite events survive as a static snapshot.
- **Contentful:** galleries, About copy, teasers and poster overrides.

There is no database, no auth, no first-party payments and no analytics.

## 1. Tech stack

- **Next.js 16.3 (App Router)**, React 19.2, TypeScript 5.9 (`strict`). Only runtime deps: `next`, `react`, `react-dom`. There is no CSS framework and no data SDK; both APIs are called with raw `fetch`.
- Path alias `@/*` → repo root (`tsconfig.json`).
- **Styling:** mostly inline `style={{}}` objects. Design tokens and hover/responsive classes live in `app/globals.css`:
  - tokens: `--color-*`, `--font-*`, `--page-px`
  - classes: `.btn-solid`, `.btn-outline`, `.home-hero-*`, `.responsive-cols` (driven by a `--cols` CSS var), `.ticket-dialog*`
  - No Tailwind, no CSS modules.
- **Fonts** (`app/fonts.ts`):
  - Google, via `next/font/google`: Big Shoulders (display), Fredoka (brand/"909"), Sora (body), Raleway 100 (labels/nav).
  - Local, via `next/font/local`: "A Box For" and "Striker" from `public/fonts/`.
- **Hosting:** no deploy config in the repo (no `vercel.json`, no Dockerfile). The host must be a Node runtime that supports ISR, `revalidateTag` and `next/og` (Vercel is the natural fit).
- **Repo:** GitHub org `theregalphotography`; PRs go into `main`.

## 2. Directory & architecture map

```
app/
  layout.tsx            Root layout: font CSS vars, metadata (metadataBase from NEXT_PUBLIC_SITE_URL), noise overlay
  page.tsx              Home: hero, marquee, "Happening Next" (1 or 2 events), teasers, CTAs        [ISR 300s + TT tag]
  events/page.tsx       Upcoming grid + "More On The Way" teasers + past ("Rooms We Left Behind")    [ISR 300s + TT tag]
  gallery/page.tsx      Contentful eventGallery albums → <GalleryAlbums> (client lightbox)              [tag-cached]
  about/page.tsx        Contentful aboutPage singleton, with hardcoded FALLBACK_ABOUT                   [tag-cached]
  contact/page.tsx      Static: hardcoded email/phone/IG/WhatsApp + house rules
  icon.tsx              Generated favicon ("909") via next/og ImageResponse; reads font from disk
  api/revalidate/contentful/route.ts     POST: Contentful webhook → revalidateTag per content type
  api/revalidate/tickettailor/route.ts   POST: Ticket Tailor webhook (HMAC-verified) → revalidateTag
lib/
  events.ts             Provider-neutral TicketEvent type, getUpcomingEvents/getPastEvents (TT + legacy merge), date formatters
  tickettailor.ts       Ticket Tailor REST client + raw→TicketEvent mapping; TICKET_TAILOR_EVENTS_CACHE_TAG
  contentful.ts         Contentful CDA client, 4 content-type fetchers, cache tags, CONTENTFUL_TAGS_BY_CONTENT_TYPE
components/
  Header.tsx            "use client": nav + mobile toggle; `active` prop typed from NAV_ITEMS
  Footer.tsx, HomeFooter.tsx, Logo.tsx, ComingSoonCard.tsx
  tickets/TicketButton.tsx   "use client": button + <dialog> popup with the TT checkout in an iframe
  tickets/EventPoster.tsx    next/image fill wrapper (null src → dark placeholder)
  tickets/HeroPairCard.tsx   One card of Home's two-event layout
  gallery/GalleryAlbums.tsx  "use client": paging (8/album), lightbox, keyboard nav, blob download
data/legacy-events.json      One-time snapshot of past Eventbrite events (TicketEvent[]); posters in public/legacy-events/
scripts/snapshot-eventbrite.mjs  Generates the snapshot above (read-only against Eventbrite)
contentful/migrations/       001–005 contentful-migration scripts (source of truth for content models)
docs/contentful-content-guide.md  Client-facing ownership/workflow guide
```

- Server components fetch the data. Only Header, TicketButton and GalleryAlbums are client components.
- Page loaders catch fetch errors. They **log via `console.error`** (Home and Events) and return empty values or fallbacks, so pages never throw.
- **UI code imports only `lib/events.ts`.** Never import provider-specific fields into components; map them in `lib/tickettailor.ts` instead.

## 3. Third-party integrations

### Ticket Tailor: events and checkout (REST API v1)
- **Files:** `lib/tickettailor.ts` (fetch and mapping), `lib/events.ts` (upcoming/past logic), `components/tickets/*`, `app/api/revalidate/tickettailor/route.ts`. Images are allowed from `**.tickettailor.com` (`next.config.ts`).
- **Env:** `TICKETTAILOR_API_KEY` (HTTP Basic, the key as username with an empty password), `TICKETTAILOR_WEBHOOK_SECRET`, and optional `TICKETTAILOR_CHECKOUT_DOMAIN` (see Checkout).
- **Fetch:** `GET https://api.tickettailor.com/v1/events?limit=100`, cursor-paginated with `starting_after=<last id>` until a short page (capped at 50 pages).
  - Uses `fetch` with `next: { revalidate: 300, tags: ["tickettailor-events"] }`.
  - Excludes `hidden` events and `draft`/`cancelled` statuses.
- **Mapping** (`mapEvent`):
  - `start.iso`/`end.iso` (falling back to `unix`) → UTC ISO strings
  - `timezone` (fallback `America/New_York`)
  - `venue.name` plus the joined address parts
  - `images.header` → `posterUrl`, only when the host is `*.tickettailor.com` (otherwise null, which renders the placeholder)
  - `checkout_url` (fallback `url`), passed through `toCheckoutUrl()`
  - `tickets_available` / `unavailable` → `hasAvailableTickets`, accepting `"true"`/`"false"` strings or booleans and defaulting to bookable
  - HTML `description` → a plain-text `summary` of ≤220 chars
- **Upcoming vs past:** `endUtc > now` means upcoming. `getPastEvents()` merges ended TT events with `data/legacy-events.json` (IDs prefixed `eb_`). If TT is down, the legacy history still renders.
- **Checkout:** `TicketButton` opens a native `<dialog>` with the TT checkout in an `<iframe allow="fullscreen; payment">`.
  - It loads the URL the way TT's official `widget.js` does: adds `widget=true`, `minimal`, `show_logo`, `bg_fill` and `ref` parameters, and posts `tt-widget-frame-init` on load.
  - It handles TT's `postMessage` protocol (checkout-open and overlay-close messages), accepting messages only from its own iframe's origin.
  - The iframe mounts only while open, so each open starts a fresh session. An "open in a new tab" fallback link sits in the bar. It's safe to render any number of times per page.
- **Why the custom domain matters:** the whole purchase stays in the popup only because checkout is served from the box office custom domain **`tickets.desiroom909.com`** (a paid TT add-on; CNAME → `custom.tickettailor.com`).
  - On `www.tickettailor.com`, a cross-site framed checkout always calls `TTCheckout.WidgetPopOut.enable()` and continues in a **new tab** after ticket selection.
  - On the custom domain, TT instead runs a real `SameSite=None` cookie test. That passes because the frame is same-site with `www.desiroom909.com`.
  - The API already returns custom-domain `checkout_url`s. `toCheckoutUrl()` rewrites `www.tickettailor.com` hosts to `TICKETTAILOR_CHECKOUT_DOMAIN` only as a safety net.
  - **Consequence: in-popup checkout can only be verified on the production domain.** On `localhost` (cross-site) checkout still pops out to a new tab.
- **Webhook:** `POST /api/revalidate/tickettailor`, registered in TT under Settings → API → Webhooks as `https://www.desiroom909.com/api/revalidate/tickettailor`.
  - Subscribed topics: Event created/updated/deleted, Order created/updated.
  - Header `Tickettailor-Webhook-Signature: t=<unix>,v1=<hex>`. The HMAC-SHA256 is computed over `timestamp + rawBody`, with 5-minute tolerance and a timing-safe compare.
  - Missing secret → 500; bad or stale signature → 401.
  - `EVENT.*` → `revalidateTag(tag, { expire: 0 })`, which shows up immediately.
  - `ORDER.*` → `revalidateTag(tag, "max")`, stale-while-revalidate, so a burst of sales doesn't make every view a blocking API call.
- **Rate limit:** 5000 requests per 30 minutes. Responses carry `X-Rate-Limit-*` headers and `Retry-After` on a 429.

### Eventbrite: legacy only
- There is no runtime Eventbrite code. `npm run snapshot:eventbrite` (`scripts/snapshot-eventbrite.mjs`) reads `EVENTBRITE_PRIVATE_TOKEN` and `EVENTBRITE_ORG_ID` from `.env.local`. It writes ended events to `data/legacy-events.json` and downloads posters to `public/legacy-events/`. It is GET-only and idempotent. Commit its outputs.

### Contentful: CMS (Content Delivery API)
- **Files:** `lib/contentful.ts`, `contentful/migrations/*.js`, `app/api/revalidate/contentful/route.ts`. Images are allowed from `images.ctfassets.net` and `downloads.ctfassets.net`.
- **Env:** `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` (a CDA token, so published content only), `CONTENTFUL_WEBHOOK_SECRET`. Migrations need a separate **CMA** token, passed on the CLI and never stored in env.
- **Flow:** `GET https://cdn.contentful.com/spaces/{space}/environments/master/entries?content_type=…`. Linked assets are resolved manually from `includes.Asset` (`mapAsset`, which turns `//` URLs into `https:`). Fetches use `cache: "force-cache"` plus `next.tags`, so they are cached until a tag is busted.

| Content type | Fetcher | Cache tag | Used on |
|---|---|---|---|
| `eventGallery` | `getEventGalleries()` (limit 100, include 2, `-fields.eventDate`) | `gallery` | /gallery |
| `aboutPage` (singleton) | `getAboutPage()` (`items[0]`) | `about-page` | /about |
| `upcomingTeaser` | `getUpcomingTeasers()` (limit 50, sorted by `order`, unset sorts last) | `upcoming-teasers` | Home (first 2), /events |
| `heroEventPoster` | `getHeroEventPosters()` (limit 10) returns `{ [TT eventId or "default"]: url }` | `hero-event-poster` | Home hero, /events soonest tile |

- **Webhook:** `POST /api/revalidate/contentful`. It requires header `X-Webhook-Secret` to equal `CONTENTFUL_WEBHOOK_SECRET`. It maps `sys.contentType.sys.id` to a tag and calls `revalidateTag(tag, { expire: 0 })`.
- **Adding a content type:** write a numbered migration, add the fetcher, add a tag constant **and** a `CONTENTFUL_TAGS_BY_CONTENT_TYPE` entry, and keep field IDs identical between the migration and the `fields.*` reads.

### Other external links (hardcoded, no API)
- Instagram `instagram.com/desiroom909`, WhatsApp `wa.me/<number>`, `tel:` and `mailto:` links. They are duplicated across `app/page.tsx`, `app/events/page.tsx`, `app/contact/page.tsx`, `components/Footer.tsx` and `components/HomeFooter.tsx`, so update all of them together.
- `images.unsplash.com` is allowed in `next.config.ts` but currently unused.

## 4. Data & state

- **No database.** Persistent state lives in Ticket Tailor, Contentful and the committed `data/legacy-events.json`.
- **Caching = Next data cache:**
  - Ticket Tailor: tag `tickettailor-events`, busted by the webhook, with a 300s ISR fallback.
  - Contentful: indefinite `force-cache` plus webhook tag invalidation.
- Domain types: `TicketEvent` (`lib/events.ts`); `EventGallery`, `GalleryPhoto`, `AboutPage`, `UpcomingTeaser` (`lib/contentful.ts`).
- Client state is local `useState` only. There is no global store.
- **Poster resolution order:**
  1. `heroPosters[event.id]`
  2. `heroPosters["default"]`, applied **only to the first/soonest event**
  3. the TT `posterUrl`
  4. the placeholder

## 5. Commands

```
npm run dev                  # next dev (also regenerates the nextjs-agent-rules block above)
npm run build                # the only full verification step
npm run start
npm run typecheck            # tsc --noEmit
npm run snapshot:eventbrite  # one-time legacy export; needs EVENTBRITE_* in .env.local
```
- **No lint script, no test framework, no CI config.** Verify with `typecheck` and `build`.
- **Webhook smoke test:** start the server with `TICKETTAILOR_WEBHOOK_SECRET=x`, then POST a body with header `t=<now>,v1=<hex HMAC-SHA256 of now+body>`.
- **Local env:** copy `.env.example` to `.env.local`. Without credentials, pages render empty or fallback states and log the missing key.
- **Contentful migration:** `npx contentful-migration --space-id <ID> --environment-id master --access-token <CMA_TOKEN> --yes contentful/migrations/00X-*.js` (the script path is positional).

## 6. Gotchas & technical debt

- **The TT field mapping is unverified against a live response.** The official schema renders client-side and couldn't be read when this was built. Check `lib/tickettailor.ts` → `RawTicketTailorEvent` against a real `GET /v1/events` response. The fields that matter most are `tickets_available`, `status`, `hidden`, `images` and `checkout_url`.
- **TT image host:** if posters render as placeholders and the logs show "Poster host … is not in next.config.ts remotePatterns", add that host in **both** `next.config.ts` and `toPosterUrl()`. next/image throws for unknown hosts, which is why the guard exists.
- **Checkout iframe:** this depends on the TT custom domain staying active and being a subdomain of the site's domain. If the add-on lapses, or the site moves to a different registrable domain, checkout falls back to opening a new tab after ticket selection. If the site's domain changes, the custom domain must move with it.
- **Errors are mostly invisible to visitors.** Failed fetches show as empty states ("NO DOORS OPEN RIGHT NOW"). Home and Events log to `console.error`; Contentful loaders still swallow errors silently. An empty ISR result can be cached for up to 5 minutes, or until the next webhook.
- **Upcoming is keyed on end time**, so events in progress still show as upcoming. `/events` calls `fetchAllTicketTailorEvents` twice (upcoming and past), relying on Next's fetch dedup, so keep the URL and options identical.
- **Webhooks:**
  - TT order webhooks fire per sale, which is why they use `"max"`, not `expire: 0`.
  - Contentful asset-only changes carry no `sys.contentType`, so republish the entry.
  - The Contentful secret check is a plain `!==` comparison (not timing-safe).
  - The Contentful environment is hardcoded to `master`.
- **Contentful limits:** galleries are capped at 100 with no pagination, teasers at 50, posters at 10. Duplicate `heroEventPoster.eventId` values resolve last-wins.
- **Manual editorial upkeep:**
  - Teasers are never deduped against real TT events.
  - Stale `heroEventPoster` entries are never detected.
  - Entries still holding **old Eventbrite IDs** match nothing; re-enter the TT `ev_…` ID.
- **Dates:** event formatters use the event's own `timezone`. `formatEventMeta()` (gallery month/year) uses the server's local timezone on a date-only string, so it can show the previous month when run in a US timezone. It is correct on UTC hosts.
- **Fonts/licensing:** "A Box For" (hero wordmark and favicon) and "Striker" are marked *preview-only*. A Box For needs a **paid license before production**. `app/icon.tsx` reads the TTF via `process.cwd()`.
- **Fragile asset path:** the Home brand-statement background uses the relative `url('hero/defines.jpeg')` (no leading `/`). It only works because it renders on `/`.
- **Dead code:** `TICKETS_URL` in `app/page.tsx` is only referenced by commented-out JSX.
- **Inline-style convention:** search the component first, then `globals.css`. Hover, focus and media-query behavior must go in `globals.css` classes.
- **Next 16 APIs:** `revalidateTag` needs its second argument (`"max"` or `{ expire: 0 }`); the one-argument form is deprecated. Check `node_modules/next/dist/docs/` before using any caching or routing API from memory.
- **Never commit secrets.** Real values live only in `.env.local`, which is gitignored. `.env.example` lists names only.
