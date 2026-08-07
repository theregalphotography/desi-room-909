interface LogoProps {
  size?: number;
  strokeColor?: string;
}

export default function Logo({ size = 23, strokeColor = "var(--color-cream)" }: LogoProps) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "0.1em",
          color: "transparent",
          WebkitTextStroke: `1px ${strokeColor}`,
          whiteSpace: "nowrap",
        }}
      >
        DESI ROOM
      </span>
      <span
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 700,
          fontSize: size,
          color: "var(--color-lime)",
        }}
      >
        909
      </span>
    </span>
  );
}
