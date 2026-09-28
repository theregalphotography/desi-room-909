import EventPoster from "@/components/eventbrite/EventPoster";
import TicketWidget from "@/components/eventbrite/TicketWidget";
import {
  formatEventDateBadge,
  formatEventTimeRange,
  formatShortEventDate,
  type EventbriteEvent,
} from "@/lib/eventbrite";

/**
 * One event in the homepage's two-up "Happening Next" row (see
 * `.home-hero-pair` / `.home-hero-card` in globals.css for the breakpoints).
 * Only used when there are 2 published Eventbrite events — with exactly one,
 * the page renders the original full-size single-hero markup instead.
 */
export default function HeroPairCard({
  event,
  posterOverride,
}: {
  event: EventbriteEvent;
  posterOverride?: string | null;
}) {
  return (
    <div className="home-hero-card">
      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          className="happening-next-badge"
          style={{
            background: "var(--color-lime)",
            color: "var(--color-bg)",
            padding: "9px 20px",
            fontSize: 11,
            letterSpacing: "0.3em",
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          HAPPENING NEXT
        </div>
        <EventPoster
          src={posterOverride ?? event.logoUrl}
          alt={event.name}
          sizes="(max-width: 1024px) 90vw, 300px"
          style={{
            aspectRatio: "4/5",
            border: "1px solid var(--color-cream-a25)",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--color-lime)",
              letterSpacing: "0.1em",
            }}
          >
            {formatShortEventDate(event.startUtc, event.timezone)}
          </div>
          <div style={{ height: 1, flex: 1, background: "var(--color-cream-a20)" }} />
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(20px,2.4vw,30px)",
            lineHeight: 0.98,
            letterSpacing: "0.03em",
          }}
        >
          {event.name}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "8px 20px",
            fontSize: 14,
            color: "var(--color-cream-a70)",
          }}
        >
          <div style={{ color: "var(--color-lime)", letterSpacing: "0.2em", fontSize: 11, paddingTop: 2 }}>
            WHERE
          </div>
          <div>
            {event.venueName}
            {event.venueAddress ? ` · ${event.venueAddress}` : ""}
          </div>
          <div style={{ color: "var(--color-lime)", letterSpacing: "0.2em", fontSize: 11, paddingTop: 2 }}>
            WHEN
          </div>
          <div>
            {formatEventDateBadge(event.startUtc, event.timezone)} ·{" "}
            {formatEventTimeRange(event.startUtc, event.endUtc, event.timezone)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
          {event.hasAvailableTickets ? (
            <TicketWidget
              eventId={event.id}
              label="GET TICKETS"
              className="btn-solid"
              style={{
                padding: "13px 26px",
                borderRadius: 999,
                fontSize: 12,
                letterSpacing: "0.18em",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              className="btn-outline"
              style={{
                border: "1.5px solid",
                padding: "13px 26px",
                borderRadius: 999,
                fontSize: 12,
                letterSpacing: "0.18em",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              SOLD OUT
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
