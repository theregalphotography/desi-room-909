import Link from "next/link";
import Logo from "./Logo";

const EXPLORE_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Desi Room 909" },
] as const;

const SUPPORT_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/contact", label: "House rules" },
  { href: "/contact", label: "Info & reservations" },
] as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          fontFamily: "var(--font-label)",
          fontWeight: 100,
          fontSize: 11,
          letterSpacing: "0.4em",
          color: "var(--color-lime)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {links.map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-hover"
            style={{ fontSize: 13, letterSpacing: "0.12em" }}
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="accent-hover"
            style={{ fontSize: 13, letterSpacing: "0.12em" }}
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

export default function HomeFooter() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--color-cream-a18)",
        padding: "70px var(--page-px) 0",
        background: "var(--color-bg)",
      }}
    >
      <div
        className="footer-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          paddingBottom: 56,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Logo size={26} />
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.35em",
              color: "var(--color-cream-a55)",
            }}
          >
            YOUR SECRET NIGHT OUT
          </div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--color-cream-a60)",
              maxWidth: 300,
            }}
          >
            Have a question or want to sponsor? DM us for the quickest response.
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              fontSize: 12,
              letterSpacing: "0.22em",
            }}
          >
            <a
              href="https://instagram.com/desiroom909"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              INSTAGRAM
            </a>
            <a
              href="https://wa.me/10000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              WHATSAPP
            </a>
          </div>
        </div>
        <FooterColumn title="EXPLORE" links={EXPLORE_LINKS} />
        <FooterColumn title="SUPPORT" links={SUPPORT_LINKS} />
      </div>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          borderTop: "1px solid rgba(242,233,221,0.12)",
          padding: "24px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(242,233,221,0.45)",
          }}
        >
          © {new Date().getFullYear()} DESI ROOM 909. ALL RIGHTS RESERVED.
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "rgba(242,233,221,0.45)",
          }}
        >
          VALID ID REQUIRED AT THE DOOR
        </div>
      </div>
    </div>
  );
}
