"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/events", label: "EVENTS" },
  { href: "/gallery", label: "GALLERY" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
] as const;

interface HeaderProps {
  active?: (typeof NAV_ITEMS)[number]["href"];
}

export default function Header({ active }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px var(--page-px)",
          borderBottom: "1px solid var(--color-cream-a22)",
        }}
      >
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav
          className="nav-desktop"
          style={{
            alignItems: "center",
            gap: 34,
            fontSize: 13,
            letterSpacing: "0.28em",
            fontWeight: 100,
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
        </nav>
        <button
          type="button"
          className="nav-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {open && (
        <nav
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--color-bg)",
            borderBottom: "1px solid var(--color-cream-a22)",
            padding: "8px var(--page-px) 20px",
            zIndex: 70,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={
                item.href === active
                  ? "nav-mobile-link nav-mobile-link-active"
                  : "nav-mobile-link"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
