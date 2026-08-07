import { Archivo, Big_Shoulders, Fredoka } from "next/font/google";

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

export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-archivo",
  display: "swap",
});
