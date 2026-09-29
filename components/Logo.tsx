interface LogoProps {
  size?: number;
  textColor?: string;
}

export default function Logo({
  size = 28,
  textColor = "var(--color-cream)",
}: LogoProps) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
      <span
        style={{
          fontFamily: "var(--font-striker)",
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "0.1em",
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        DESI ROOM
      </span>
      <span
        style={{
          fontFamily: "var(--font-striker)",
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
