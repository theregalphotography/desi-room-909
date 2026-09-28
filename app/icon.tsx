import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// "909" is already the brand's shorthand mark everywhere else on the site
// (Header/Logo, the hero numeral) — reused here since the full "DESI ROOM"
// wordmark doesn't read at favicon size. Colors match --color-bg/--color-lime
// in globals.css directly (CSS variables don't resolve inside ImageResponse).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#b7f04a",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: -1.5,
          padding: "0 3px",
        }}
      >
        909
      </div>
    ),
    { ...size },
  );
}
