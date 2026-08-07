import Link from "next/link";
import Header from "@/components/Header";
import HomeFooter from "@/components/HomeFooter";
import EventPoster from "@/components/eventbrite/EventPoster";
import TicketWidget from "@/components/eventbrite/TicketWidget";
import {
  formatEventDateBadge,
  formatEventTimeRange,
  formatShortEventDate,
  getUpcomingEvents,
  selectHeroEvent,
  selectNextEditions,
  type EventbriteEvent,
} from "@/lib/eventbrite";

export const revalidate = 300;

const TICKETS_URL = "https://buytickets.at/desiroom909";
const MARQUEE_TEXT =
  "NO PHOTOS OF THE ROOM  •  ONLY DESI BEATS  •  TELL NO ONE, BRING EVERYONE  •  ";

async function loadUpcoming(): Promise<{ upcoming: EventbriteEvent[]; error: boolean }> {
  try {
    return { upcoming: await getUpcomingEvents(), error: false };
  } catch {
    return { upcoming: [], error: true };
  }
}

export default async function HomePage() {
  const { upcoming, error } = await loadUpcoming();
  const hero = selectHeroEvent(upcoming);
  const nextEditions = selectNextEditions(upcoming, 2);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", color: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      {/* Hero */}
      <div style={{ position: "relative", minHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat #151515",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.72), rgba(10,10,10,0.6) 45%, rgba(0,0,0,0.95))",
          }}
        />
        <div style={{ position: "relative" }}>
          <Header active="/" />
        </div>
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "70px 44px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(60px,9vw,130px)",
                lineHeight: 0.9,
                letterSpacing: "0.04em",
                color: "transparent",
                WebkitTextStroke: "2.5px var(--color-cream)",
              }}
            >
              DESI ROOM
            </span>
            <span
              style={{
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: "clamp(66px,10vw,150px)",
                lineHeight: 0.9,
                color: "var(--color-lime)",
              }}
            >
              909
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(34px,4.6vw,68px)",
              lineHeight: 1,
              letterSpacing: "0.05em",
              marginTop: 34,
              maxWidth: 1000,
            }}
          >
            THE SECRET SOUTH ASIAN NIGHT THAT KEEPS MOVING
          </div>
          <div style={{ fontSize: 15, letterSpacing: "0.12em", color: "var(--color-cream-a70)", marginTop: 20 }}>
            Exclusive pop-up club nights, premium rooms, and only desi beats — Bollywood, bhangra, Tamil &amp; Telugu
            heaters.
          </div>
          <div style={{ fontSize: 12, letterSpacing: "0.45em", color: "var(--color-cream-a55)", marginTop: 46 }}>
            YOUR SECRET NIGHT OUT
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div
        style={{
          overflow: "hidden",
          borderTop: "1px solid rgba(242,233,221,0.16)",
          borderBottom: "1px solid rgba(242,233,221,0.16)",
          padding: "14px 0",
          background: "#1A1A1A",
        }}
      >
        <div className="marquee-track" style={{ display: "flex", width: "max-content" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: "0.3em",
                color: "rgba(242,233,221,0.9)",
                whiteSpace: "nowrap",
                paddingRight: 40,
              }}
            >
              {MARQUEE_TEXT.repeat(2)}
            </div>
          ))}
        </div>
      </div>

      {/* Happening next */}
      {error && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 44px" }}>
          <div style={{ border: "1px solid var(--color-cream-a25)", padding: "28px 32px", color: "var(--color-cream-a70)", fontSize: 14 }}>
            Couldn&rsquo;t load the next event right now. Check{" "}
            <Link href="/events">the full lineup</Link> or check back shortly.
          </div>
        </div>
      )}

      {!error && hero && (
        <div style={{ background: "#0A0A0A", borderBottom: "1px solid rgba(242,233,221,0.14)" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "90px 44px",
              display: "grid",
              gridTemplateColumns: "420px 1fr",
              gap: 64,
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: -14,
                  background: "var(--color-lime)",
                  color: "var(--color-bg)",
                  padding: "9px 20px",
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  fontWeight: 600,
                  transform: "rotate(-2deg)",
                  zIndex: 2,
                }}
              >
                HAPPENING NEXT
              </div>
              <EventPoster
                src={hero.logoUrl}
                alt={hero.name}
                sizes="(max-width: 1024px) 90vw, 420px"
                style={{ aspectRatio: "4/5", border: "1px solid var(--color-cream-a25)" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, color: "var(--color-lime)", letterSpacing: "0.1em" }}>
                  {formatShortEventDate(hero.startUtc, hero.timezone)}
                </div>
                <div style={{ height: 1, flex: 1, background: "var(--color-cream-a20)" }} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(48px,6vw,88px)", lineHeight: 0.92, letterSpacing: "0.03em" }}>
                {hero.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 20px", fontSize: 14, color: "var(--color-cream-a70)" }}>
                <div style={{ color: "var(--color-lime)", letterSpacing: "0.2em", fontSize: 11, paddingTop: 2 }}>WHERE</div>
                <div>
                  {hero.venueName}
                  {hero.venueAddress ? ` · ${hero.venueAddress}` : ""}
                </div>
                <div style={{ color: "var(--color-lime)", letterSpacing: "0.2em", fontSize: 11, paddingTop: 2 }}>WHEN</div>
                <div>{formatEventDateBadge(hero.startUtc, hero.timezone)} · {formatEventTimeRange(hero.startUtc, hero.endUtc, hero.timezone)}</div>
                {hero.summary && (
                  <>
                    <div style={{ color: "var(--color-lime)", letterSpacing: "0.2em", fontSize: 11, paddingTop: 2 }}>ABOUT</div>
                    <div>{hero.summary}</div>
                  </>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12 }}>
                {hero.hasAvailableTickets ? (
                  <TicketWidget
                    eventId={hero.id}
                    label="GET TICKETS"
                    className="btn-solid"
                    style={{ padding: "17px 40px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600, border: "none", cursor: "pointer" }}
                  />
                ) : (
                  <div
                    className="btn-outline"
                    style={{ border: "1.5px solid", padding: "17px 40px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}
                  >
                    SOLD OUT
                  </div>
                )}
                <div style={{ fontSize: 12, letterSpacing: "0.18em", color: "var(--color-cream-a55)" }}>
                  SELLING FAST — CAPACITY IS REAL
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && !hero && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 44px" }}>
          <div style={{ border: "1px solid var(--color-cream-a25)", padding: "28px 32px", color: "var(--color-cream-a70)", fontSize: 14 }}>
            No rooms on the calendar right now — follow{" "}
            <a href="https://instagram.com/desiroom909" target="_blank" rel="noopener noreferrer">
              @desiroom909
            </a>{" "}
            so you don&rsquo;t miss the next drop.
          </div>
        </div>
      )}

      {/* Next editions */}
      {nextEditions.length > 0 && (
        <div style={{ padding: "100px 44px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.5em", color: "var(--color-lime)", marginBottom: 16 }}>NEXT EDITIONS</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(44px,6vw,84px)", lineHeight: 0.95, letterSpacing: "0.03em" }}>
              THE NEXT {nextEditions.length === 1 ? "ROOM" : `${nextEditions.length} ROOMS`}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(nextEditions.length, 2)}, 1fr)`,
              gap: 44,
              maxWidth: 940,
              margin: "0 auto",
            }}
          >
            {nextEditions.map((event) => (
              <div key={event.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
                <EventPoster
                  src={event.logoUrl}
                  alt={event.name}
                  sizes="(max-width: 768px) 90vw, 45vw"
                  style={{ width: "100%", aspectRatio: "4/5", border: "1px solid var(--color-cream-a25)" }}
                />
                {event.hasAvailableTickets ? (
                  <TicketWidget
                    eventId={event.id}
                    label="BOOK YOUR TICKET"
                    className="btn-solid"
                    style={{ padding: "15px 34px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600, border: "none", cursor: "pointer" }}
                  />
                ) : (
                  <div className="btn-outline" style={{ border: "1.5px solid", padding: "15px 34px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}>
                    SOLD OUT
                  </div>
                )}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, lineHeight: 1 }}>{event.name}</div>
                  <div style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--color-cream-a70)", marginTop: 10 }}>
                    {formatShortEventDate(event.startUtc, event.timezone)} · {event.venueName}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link
              href="/events"
              className="btn-outline"
              style={{ border: "1.5px solid", padding: "15px 34px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 500 }}
            >
              ALL EDITIONS →
            </Link>
          </div>
        </div>
      )}

      {/* Brand statement */}
      <div
        style={{
          position: "relative",
          padding: "120px 44px",
          overflow: "hidden",
          background:
            "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat #1A1A1A",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.78), rgba(20,20,20,0.66))" }} />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.5em", color: "var(--color-lime)", marginBottom: 18 }}>WHAT DEFINES A 909 NIGHT</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(40px,5.5vw,76px)", lineHeight: 1, letterSpacing: "0.03em" }}>
            MORE THAN A PARTY.
            <br />
            THIS IS DESI NIGHTLIFE.
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: "var(--color-cream-a70)", maxWidth: 560, margin: "26px auto 0" }}>
            One room, one night, then it&rsquo;s gone. A warehouse, a basement, the back of a place you&rsquo;ve walked
            past a hundred times — full until the lights come up.
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
              style={{ padding: "16px 36px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}
            >
              GET YOUR TICKETS
            </a>
            <Link
              href="/gallery"
              className="btn-outline"
              style={{ border: "1.5px solid", padding: "16px 36px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 500 }}
            >
              LAST NIGHT&rsquo;S PROOF
            </Link>
          </div>
        </div>
      </div>

      {/* Insider CTA */}
      <div style={{ padding: "110px 44px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(52px,8vw,110px)",
            lineHeight: 0.9,
            letterSpacing: "0.04em",
            color: "transparent",
            WebkitTextStroke: "2px var(--color-cream)",
          }}
        >
          IF YOU KNOW,
          <br />
          YOU KNOW.
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--color-cream-a70)", maxWidth: 480, margin: "26px auto 0" }}>
          909 insiders get first access to tickets, drops, and rooms that sell out before we post the flyer.
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 38, flexWrap: "wrap" }}>
          <a
            href="https://instagram.com/desiroom909"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-solid"
            style={{ padding: "16px 36px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}
          >
            FOLLOW @DESIROOM909
          </a>
          <Link
            href="/contact"
            className="btn-outline"
            style={{ border: "1.5px solid", padding: "16px 36px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 500 }}
          >
            GET ON THE LIST
          </Link>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}
