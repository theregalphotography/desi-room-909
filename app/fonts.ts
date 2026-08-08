import { Big_Shoulders, Fredoka, Raleway, Sora } from "next/font/google";

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
