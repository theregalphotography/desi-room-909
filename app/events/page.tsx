import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComingSoonCard from "@/components/ComingSoonCard";
import EventPoster from "@/components/eventbrite/EventPoster";
import TicketWidget from "@/components/eventbrite/TicketWidget";
import {
  formatPastEventDate,
  getPastEvents,
  getUpcomingEvents,
  selectHeroEvent,
  type EventbriteEvent,
} from "@/lib/eventbrite";
import { getHeroEventPoster, getUpcomingTeasers, type UpcomingTeaser } from "@/lib/contentful";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events",
  description: "No fixed address. Every 909 is a one-night takeover — find the door before it's gone.",
};

const TICKETS_URL = "https://buytickets.at/desiroom909";

async function loadEvents(): Promise<{ upcoming: EventbriteEvent[]; past: EventbriteEvent[] }> {
  try {
    const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);
    return { upcoming, past };
  } catch {
    return { upcoming: [], past: [] };
  }
}

async function loadTeasers(): Promise<UpcomingTeaser[]> {
  try {
    return await getUpcomingTeasers();
  } catch {
    return [];
  }
}

async function loadHeroPoster(): Promise<string | null> {
  try {
    return await getHeroEventPoster();
  } catch {
    return null;
  }
}

export default async function EventsPage() {
  const [{ upcoming, past }, teasers] = await Promise.all([loadEvents(), loadTeasers()]);
  const heroEvent = selectHeroEvent(upcoming);
  const heroPosterUrl = heroEvent ? await loadHeroPoster() : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", color: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      <Header active="/events" />

      <div style={{ padding: "80px var(--page-px) 30px", maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-label)",
            fontWeight: 100,
            fontSize: 12,
            letterSpacing: "0.5em",
            color: "var(--color-lime)",
            marginBottom: 18,
          }}
        >
          UPCOMING ROOMS
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(56px,8vw,110px)",
            lineHeight: 0.9,
            letterSpacing: "0.03em",
            color: "transparent",
            WebkitTextStroke: "2px var(--color-cream)",
          }}
        >
          FIND THE DOOR
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--color-cream-a70)", maxWidth: 520, marginTop: 22 }}>
          No fixed address. Every 909 is a one-night takeover — the room changes, the family doesn&rsquo;t. When it
          says sold out, it&rsquo;s sold out.
        </div>
      </div>

      {upcoming.length === 0 && teasers.length === 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 var(--page-px) 100px" }}>
          <div style={{ border: "1px solid var(--color-cream-a25)", padding: "48px var(--page-px)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, lineHeight: 1.1 }}>
              NO DOORS OPEN RIGHT NOW.
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-cream-a70)", maxWidth: 440, margin: "14px auto 0" }}>
              We post the next room before it ever hits a calendar. Follow{" "}
              <a href="https://instagram.com/desiroom909" target="_blank" rel="noopener noreferrer">
                @desiroom909
              </a>{" "}
              so you&rsquo;re not the last to know.
            </div>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div
          style={{
            padding: "40px var(--page-px) 100px",
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 28,
          }}
        >
          {upcoming.map((event) => (
            <div
              key={event.id}
              style={{ border: "1px solid var(--color-cream-a25)", background: "rgba(0,0,0,0.14)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ position: "relative" }}>
                {!event.hasAvailableTickets && (
                  <div
                    style={{
                      position: "absolute",
                      top: 22,
                      right: -8,
                      background: "var(--color-cream)",
                      color: "var(--color-bg)",
                      padding: "8px 18px",
                      fontSize: 11,
                      letterSpacing: "0.3em",
                      fontWeight: 600,
                      transform: "rotate(3deg)",
                      zIndex: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    SOLD OUT
                  </div>
                )}
                <EventPoster
                  src={event.id === heroEvent?.id ? (heroPosterUrl ?? event.logoUrl) : event.logoUrl}
                  alt={event.name}
                  sizes="(max-width: 640px) 90vw, 380px"
                  style={{
                    aspectRatio: "4/5",
                    borderBottom: "1px solid var(--color-cream-a25)",
                    opacity: event.hasAvailableTickets ? 1 : 0.55,
                  }}
                />
              </div>
              <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 12, flex: 1, opacity: event.hasAvailableTickets ? 1 : 0.7 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, lineHeight: 0.95 }}>{event.name}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-cream-a70)" }}>
                  {event.venueName}
                  {event.venueAddress && (
                    <>
                      <br />
                      {event.venueAddress}
                    </>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 14 }}>
                  {event.hasAvailableTickets ? (
                    <TicketWidget
                      eventId={event.id}
                      label="GET TICKETS"
                      className="btn-solid"
                      style={{ padding: "13px 26px", borderRadius: 999, fontSize: 12, letterSpacing: "0.2em", fontWeight: 600, border: "none", cursor: "pointer" }}
                    />
                  ) : (
                    <div
                      className="btn-outline"
                      style={{ border: "1.5px solid", padding: "13px 26px", borderRadius: 999, fontSize: 12, letterSpacing: "0.2em", fontWeight: 600 }}
                    >
                      AT CAPACITY
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {teasers.length > 0 && (
        <div style={{ padding: "0 var(--page-px) 100px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, flexWrap: "wrap", marginBottom: 36 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, lineHeight: 1 }}>
              MORE ON THE WAY
            </div>
            <div style={{ flex: 1, height: 1, background: "var(--color-cream-a20)", minWidth: 40 }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 28,
            }}
          >
            {teasers.map((teaser) => (
              <ComingSoonCard key={teaser.id} teaser={teaser} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div style={{ background: "#0A0A0A", borderTop: "1px solid rgba(242,233,221,0.14)", borderBottom: "1px solid rgba(242,233,221,0.14)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "90px var(--page-px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(44px,6vw,84px)",
                  lineHeight: 0.95,
                  letterSpacing: "0.03em",
                  color: "transparent",
                  WebkitTextStroke: "2px var(--color-cream)",
                }}
              >
                ROOMS WE LEFT BEHIND
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-cream-a60)", maxWidth: 480, marginBottom: 50 }}>
              Every door we&rsquo;ve opened and closed. If you were there, you know. If you weren&rsquo;t — the proof
              is in the <a href="/gallery">gallery</a>.
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {past.map((event) => (
                <div key={event.id} className="events-past-row" style={{ borderTop: "1px solid rgba(242,233,221,0.16)" }}>
                  <EventPoster
                    src={event.logoUrl}
                    alt={event.name}
                    sizes="110px"
                    grayscale
                    className="events-past-thumb"
                    style={{ border: "1px solid var(--color-cream-a20)" }}
                  />
                  <div className="events-past-info">
                    <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "var(--color-cream-a55)", marginBottom: 8 }}>
                      {formatPastEventDate(event.endUtc, event.timezone)} · {event.venueName}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, lineHeight: 1 }}>{event.name}</div>
                  </div>
                  <div
                    className="events-past-badge"
                    style={{
                      border: "1.5px solid var(--color-lime)",
                      color: "var(--color-lime)",
                      padding: "8px 18px",
                      fontSize: 11,
                      letterSpacing: "0.3em",
                      fontWeight: 600,
                      transform: "rotate(-2deg)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    YOU MISSED IT
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 44, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: "var(--color-cream-a60)", letterSpacing: "0.12em" }}>
                Don&rsquo;t end up on this list again.
              </div>
              <a
                href={TICKETS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid"
                style={{ padding: "14px 30px", borderRadius: 999, fontSize: 12, letterSpacing: "0.22em", fontWeight: 600 }}
              >
                GET TICKETS TO THE NEXT ONE
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
