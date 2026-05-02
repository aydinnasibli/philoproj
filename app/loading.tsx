export default function Loading() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: "var(--canvas)", gap: "1rem",
    }}>
      <div style={{
        fontFamily: "var(--font-cinzel)", fontSize: "10px", fontWeight: 500,
        letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent-light)",
      }}>
        Loading
      </div>
      <div style={{
        width: "100px", height: "1px",
        background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
        animation: "manuscript-shimmer 1.6s ease-in-out infinite",
      }} />
      <style>{`@keyframes manuscript-shimmer { 0%,100%{ opacity:.25 } 50%{ opacity:1 } }`}</style>
    </div>
  );
}
