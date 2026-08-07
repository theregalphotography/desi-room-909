import Logo from "./Logo";

export default function Footer() {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        borderTop: "1px solid var(--color-cream-a18)",
        padding: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
      }}
    >
      <Logo size={18} strokeColor="rgba(242,233,221,0.8)" />
      <div style={{ fontSize: 11, letterSpacing: "0.35em", color: "var(--color-cream-a55)" }}>
        YOUR SECRET NIGHT OUT
      </div>
      <div style={{ display: "flex", gap: 24, fontSize: 12, letterSpacing: "0.22em" }}>
        <a
          href="https://instagram.com/desiroom909"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          INSTAGRAM
        </a>
        <a href="https://wa.me/10000000000" target="_blank" rel="noopener noreferrer" className="footer-link">
          WHATSAPP
        </a>
      </div>
    </div>
  );
}
