import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tables, birthdays, sponsorships, brand collabs, venue offers, press — one line, one number.",
};

const CONTACT_CARDS = [
  {
    label: "TABLES & BOOKINGS",
    href: "mailto:bookings@desiroom909.com",
    display: "bookings@desiroom909.com",
    note: "Birthdays, group bookings, bottle service. Tell us the night and how many of you.",
  },
  {
    label: "SPONSORSHIPS & PARTNERS",
    href: "mailto:partners@desiroom909.com",
    display: "partners@desiroom909.com",
    note: "Brand collabs, sponsorships, venues that want a 909 night, press & media.",
  },
  {
    label: "CALL OR TEXT",
    href: "tel:+15551234909",
    display: "+1 (555) 123-4909",
    note: "Fastest for night-of questions. If we're mid-event, leave a message — we call back.",
  },
] as const;

const FIND_US_LINKS = [
  { label: "INSTAGRAM", handle: "@desiroom909", href: "https://instagram.com/desiroom909" },
  { label: "WHATSAPP", handle: "+1 (000) 000-0000", href: "https://wa.me/10000000000" },
] as const;

const HOUSE_RULES = [
  { lead: "Bring ID.", rest: "Valid government ID at the door, no exceptions." },
  { lead: "Tickets are final.", rest: "Sold out means sold out — no door sales when capped." },
  { lead: "Dress for the room.", rest: "Effort noticed, sneakers fine, athleisure isn't." },
  { lead: "Respect the family.", rest: "Harassment of any kind gets you walked out." },
] as const;

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", color: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      <Header active="/contact" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 44px 100px" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.5em", color: "var(--color-lime)", marginBottom: 18 }}>CONTACT</div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(56px,8vw,104px)",
            lineHeight: 0.9,
            letterSpacing: "0.03em",
            color: "transparent",
            WebkitTextStroke: "2px var(--color-cream)",
          }}
        >
          KNOCK FIRST
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, marginTop: 56, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14, color: "var(--color-cream-a70)", marginBottom: 8, lineHeight: 1.7 }}>
              Tables, birthdays, sponsorships, brand collabs, venue offers, press — one line, one number. We reply
              within 48 hours.
            </div>
            {CONTACT_CARDS.map((card) => (
              <div
                key={card.label}
                style={{ border: "1px solid var(--color-cream-a25)", background: "rgba(0,0,0,0.15)", padding: "34px 40px", display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div style={{ fontSize: 11, letterSpacing: "0.4em", color: "var(--color-lime)" }}>{card.label}</div>
                <a
                  href={card.href}
                  className="accent-hover"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.1 }}
                >
                  {card.display}
                </a>
                <div style={{ fontSize: 13, color: "var(--color-cream-a60)", lineHeight: 1.6 }}>{card.note}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.4em", color: "var(--color-lime)", marginBottom: 16 }}>FIND US</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {FIND_US_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card-link"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid", padding: "18px 22px" }}
                  >
                    <span style={{ fontSize: 13, letterSpacing: "0.22em" }}>{link.label}</span>
                    <span style={{ fontSize: 13, color: "var(--color-cream-a55)" }}>{link.handle}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.4em", color: "var(--color-lime)", marginBottom: 16 }}>HOUSE RULES</div>
              <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--color-cream-a25)" }}>
                {HOUSE_RULES.map((rule, index) => (
                  <div
                    key={rule.lead}
                    style={{
                      padding: "16px 22px",
                      borderBottom: index < HOUSE_RULES.length - 1 ? "1px solid var(--color-cream-a20)" : undefined,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "rgba(242,233,221,0.8)",
                    }}
                  >
                    <span style={{ color: "var(--color-lime)" }}>{rule.lead}</span> {rule.rest}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
