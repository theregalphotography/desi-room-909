import Link from "next/link";
import Logo from "./Logo";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/events", label: "EVENTS" },
  { href: "/gallery", label: "GALLERY" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
] as const;

const TICKETS_URL = "https://buytickets.at/desiroom909";

interface HeaderProps {
  active?: (typeof NAV_ITEMS)[number]["href"];
}

export default function Header({ active }: HeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 44px",
        borderBottom: "1px solid var(--color-cream-a22)",
      }}
    >
      <Link href="/">
        <Logo />
      </Link>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 34,
          fontSize: 12,
          letterSpacing: "0.28em",
          fontWeight: 500,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.href === active ? "nav-link-active" : "nav-link"}
          >
            {item.label}
          </Link>
        ))}
        {/* <a
          href={TICKETS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ticket-btn"
          style={{
            padding: "11px 22px",
            borderRadius: 999,
            letterSpacing: "0.22em",
            fontWeight: 600,
          }}
        >
          TICKETS
        </a>*/}
      </nav>
    </div>
  );
}
