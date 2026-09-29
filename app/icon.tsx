import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// "909" is already the brand's shorthand mark everywhere else on the site
// (Header/Logo, the hero numeral) — reused here since the full "DESI ROOM"
// wordmark doesn't read at favicon size. Transparent background, lime fill
// matching --color-lime in globals.css (CSS variables don't resolve inside
// ImageResponse, so it's hardcoded here).
// Font file read once at module scope per Next's ImageResponse custom-fonts
// pattern — same "A Box For 2" used on the hero/header (see app/fonts.ts).
const aBoxFor = readFile(
  join(process.cwd(), "public/fonts/box/A Box For 2.ttf"),
);

export default async function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#b7f04a",
        fontFamily: "A Box For",
        fontSize: 30,
        letterSpacing: -2,
      }}
    >
      909
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "A Box For",
          data: await aBoxFor,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
