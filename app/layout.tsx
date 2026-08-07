import type { Metadata } from "next";
import { archivo, bigShoulders, fredoka } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "Desi Room 909 — Your Secret Night Out",
    template: "%s — Desi Room 909",
  },
  description:
    "Desi Room 909 runs ticketed South Asian nightlife pop-ups across venues. Your secret night out.",
  openGraph: {
    siteName: "Desi Room 909",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${fredoka.variable} ${archivo.variable}`}>
      <body
        style={{
          minHeight: "100vh",
          background: "var(--color-surface)",
          color: "var(--color-cream)",
          fontFamily: "var(--font-body)",
        }}
      >
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
