import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAboutPage, type AboutPage } from "@/lib/contentful";

export const metadata: Metadata = {
  title: "About",
  description: "Desi Room 909 started the way most good nights do — the story behind the room that moves.",
};

const FALLBACK_ABOUT: AboutPage = {
  heading: "A ROOM,\nNOT A VENUE",
  storyParagraphs: [
    "Desi Room 909 started the way most good nights do: a borrowed sound system, a room that wasn't really meant for dancing, and a group chat that got out of hand.",
    "There was nowhere that played our music the way we heard it growing up — Bollywood next to bhangra next to Tamil, Telugu and Malayalam heaters, no apologies, no “fusion set,” no watered-down crossover hour. So we built the room ourselves. Then we built it again in a different building. Then a different city.",
    "That's the whole model. 909 doesn't have an address. It has a date, a door, and a family that keeps showing up. Every event is a one-night takeover — a warehouse, a basement, the back room of a place you've walked past a hundred times. When the night ends, the room goes back to being ordinary. You keep the rest.",
    "We keep it small on purpose. Capacity is real, and when tickets are gone they're gone. Not because scarcity is a marketing trick — because the night only works when everyone in the room chose to be there.",
  ],
};

const PRINCIPLES = [
  { number: "01", title: "ONLY DESI BEATS", body: "All night. If you came for Top 40, you're in the wrong room." },
  { number: "02", title: "THE ROOM MOVES", body: "New city, new door every time. Follow the date, not the address." },
  { number: "03", title: "EVERYONE'S FAMILY", body: "Come alone, leave with fifty cousins. Zero tolerance for anything that breaks that." },
] as const;

async function loadAboutPage(): Promise<AboutPage> {
  try {
    return (await getAboutPage()) ?? FALLBACK_ABOUT;
  } catch {
    return FALLBACK_ABOUT;
  }
}

export default async function AboutPage() {
  const about = await loadAboutPage();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", color: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      <Header active="/about" />

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "90px 44px 60px" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.5em", color: "var(--color-lime)", marginBottom: 18 }}>THE STORY</div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(56px,8vw,104px)",
            lineHeight: 0.9,
            letterSpacing: "0.03em",
            color: "transparent",
            WebkitTextStroke: "2px var(--color-cream)",
            whiteSpace: "pre-line",
          }}
        >
          {about.heading}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, fontSize: 17, lineHeight: 1.85, color: "rgba(242,233,221,0.85)", marginTop: 48 }}>
          {about.storyParagraphs.map((paragraph, index) => (
            <div key={index}>{paragraph}</div>
          ))}
        </div>
      </div>

      <div style={{ background: "#161616", padding: "80px 44px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 28 }}>
          {PRINCIPLES.map((principle) => (
            <div key={principle.number} style={{ borderTop: "3px solid var(--color-lime)", paddingTop: 20 }}>
              <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 40, color: "var(--color-lime)", lineHeight: 1 }}>
                {principle.number}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "12px 0 8px" }}>{principle.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(242,233,221,0.65)" }}>{principle.body}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            maxWidth: 820,
            margin: "64px auto 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 18,
            border: "1px solid var(--color-cream-a25)",
            padding: "36px 44px",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, lineHeight: 1 }}>
            SOUND LIKE YOUR KIND OF NIGHT?
          </div>
          <Link
            href="/events"
            className="btn-solid"
            style={{ padding: "15px 32px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}
          >
            FIND THE DOOR →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
