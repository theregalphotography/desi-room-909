import { Big_Shoulders, Fredoka, Raleway, Sora } from "next/font/google";
import localFont from "next/font/local";

// Google Fonts merged "Big Shoulders Display" into the "Big Shoulders" variable
// family's optical-size (opsz) axis. Loading it as a variable font and letting
// font-optical-sizing:auto pick the axis at render size reproduces the Display cut.
export const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-big-shoulders",
  display: "swap",
});

export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

// Preview-only: bold stamped/stencil display font (client-supplied, under
// public/fonts/box/), trying it out on "DESI ROOM 909" in the hero.
// use requires a paid license from the author before this ships to production.
export const aBoxFor = localFont({
  src: "../public/fonts/box/A Box For 2.ttf",
  weight: "600",
  variable: "--font-a-box-for",
  display: "swap",
});

// Preview-only: modern geometric display font (client-supplied, under
// public/fonts/striker/), trying it out on "DESI ROOM 909" in the Header/Footer logo.
export const striker = localFont({
  src: "../public/fonts/striker/Striker.ttf",
  weight: "700",
  variable: "--font-striker",
  display: "swap",
});

// Thin-weight labels and nav only — not used for body/paragraph text.
export const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100"],
  variable: "--font-raleway",
  display: "swap",
});

// Sitewide UI/body font — paragraphs, buttons, notes, card text, everywhere
// var(--font-body) is used. Headlines stay on Big Shoulders, the "909"
// numeral stays on Fredoka, labels/nav stay on Raleway.
export const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});
