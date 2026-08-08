import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Bookings, sponsorships, press — one address, one number. We reply within 48 hours.",
};

const GENERAL_CONTACT = {
  email: "desiroom909@gmail.com",
  note: "Info, VIP tables, reservations, and sponsorship inquiries all handled right here. We reply within 48 hours.",
};

const DIRECT_CONTACT = [
  {
    label: "CALL OR TEXT",
    handle: "+1 (980) 331-0225",
    href: "tel:+19803310225",
    external: false,
  },
] as const;

const FIND_US_LINKS = [
  {
    label: "INSTAGRAM",
    handle: "@desiroom909",
    href: "https://instagram.com/desiroom909",
    external: true,
  },
  {
    label: "WHATSAPP",
    handle: "+1 (980) 331-0225",
    href: "https://wa.me/19803310225",
    external: true,
  },
] as const;

const HOUSE_RULES = [
  {
    emoji: "🎟️",
    lead: "21+ Only",
    rest: "Guests must be 21 years or older to enter.",
  },
  {
    emoji: "🪪",
    lead: "Valid Physical ID Required",
    rest: "Government-issued physical photo ID is required for entry. Photos, screenshots, or copies of IDs will not be accepted.",
  },
  {
    emoji: "🎶",
    lead: "Respect the Vibe",
    rest: "Come ready to enjoy the music, dance, and celebrate. Respect the artists, DJs, staff, venue, and fellow guests.",
  },
  {
    emoji: "🚫",
    lead: "No Outside Food or Drinks",
    rest: "Outside beverages, alcohol, or food are not permitted inside the venue.",
  },
  {
    emoji: "🍹",
    lead: "Drink Responsibly",
    rest: "Please enjoy responsibly. Guests who appear intoxicated or disruptive may be denied entry or removed.",
  },
  {
    emoji: "🤝",
    lead: "Zero Tolerance Policy",
    rest: "No fighting, harassment, inappropriate behavior, or disrespectful conduct will be tolerated.",
  },
  {
    emoji: "🚭",
    lead: "Follow Venue Smoking Policies",
    rest: "Smoking, vaping, or hookah rules will follow venue guidelines.",
  },
  {
    emoji: "🎒",
    lead: "Security Checks Required",
    rest: "All guests are subject to security screening before entry.",
  },
  {
    emoji: "🎟️",
    lead: "Tickets Are Non-Refundable",
    rest: "All ticket sales are final unless the event is canceled or rescheduled.",
  },
  {
    emoji: "📸",
    lead: "Photography & Video Notice",
    rest: "Photos and videos may be captured during the event for promotional purposes.",
  },
  {
    emoji: "👕",
    lead: "Dress to Impress",
    rest: "Bring your style, energy, and best vibes.",
  },
] as const;

const MOST_IMPORTANT_RULE =
  "Leave the stress outside. Bring the energy inside.";

interface ContactLink {
  label: string;
  handle: string;
  href: string;
  external: boolean;
}

function ContactRow({ link }: { link: ContactLink }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      className="contact-row-link"
    >
      <span style={{ fontSize: 12, letterSpacing: "0.22em", fontWeight: 600 }}>
        {link.label}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, color: "var(--color-cream-a60)" }}>
          {link.handle}
        </span>
        <span className="contact-row-arrow" aria-hidden="true">
          →
        </span>
      </span>
    </a>
  );
}

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-surface)",
        color: "var(--color-cream)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Header active="/contact" />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px var(--page-px) 100px",
        }}
      >
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
          CONTACT
        </div>
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

        <div
          className="contact-grid"
          style={{ marginTop: 64, alignItems: "start" }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "var(--font-label)",
                fontWeight: 100,
                fontSize: 11,
                letterSpacing: "0.4em",
                color: "var(--color-lime)",
                marginBottom: 18,
              }}
            >
              GENERAL INQUIRIES
            </div>
            <a
              href={`mailto:${GENERAL_CONTACT.email}`}
              className="accent-hover"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(26px,3.2vw,42px)",
                lineHeight: 1.15,
                paddingBottom: 18,
                borderBottom: "1px solid var(--color-cream-a25)",
                overflowWrap: "break-word",
              }}
            >
              {GENERAL_CONTACT.email}
            </a>
            <div
              style={{
                fontSize: 14,
                color: "var(--color-cream-a70)",
                lineHeight: 1.7,
                maxWidth: 480,
                marginTop: 18,
              }}
            >
              {GENERAL_CONTACT.note}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 44,
              }}
            >
              {DIRECT_CONTACT.map((link) => (
                <ContactRow key={link.label} link={link} />
              ))}
            </div>

            <div style={{ marginTop: 56 }}>
              <div
                style={{
                  fontFamily: "var(--font-label)",
                  fontWeight: 100,
                  fontSize: 11,
                  letterSpacing: "0.4em",
                  color: "var(--color-lime)",
                  marginBottom: 4,
                }}
              >
                FIND US
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {FIND_US_LINKS.map((link) => (
                  <ContactRow key={link.label} link={link} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: "var(--font-label)",
                fontWeight: 100,
                fontSize: 11,
                letterSpacing: "0.4em",
                color: "var(--color-lime)",
                marginBottom: 16,
              }}
            >
              DESI ROOM 909 — HOUSE RULES
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--color-cream-a25)",
              }}
            >
              {HOUSE_RULES.map((rule) => (
                <div
                  key={rule.lead}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--color-cream-a20)",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <span aria-hidden="true">{rule.emoji}</span>
                    <span
                      style={{ color: "var(--color-lime)", fontWeight: 600 }}
                    >
                      {rule.lead}
                    </span>
                  </div>
                  <div
                    style={{ color: "rgba(242,233,221,0.75)", marginTop: 4 }}
                  >
                    {rule.rest}
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "18px 20px",
                  background: "rgba(183,240,74,0.06)",
                }}
              >
                <div
                  style={{
                    color: "var(--color-lime)",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  ✨ MOST IMPORTANT RULE
                </div>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "var(--color-cream)",
                  }}
                >
                  {MOST_IMPORTANT_RULE}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
