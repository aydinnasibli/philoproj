export default function MyNotesLoading() {
  return (
    <div style={{
      display: "flex", height: "100vh", alignItems: "center", justifyContent: "center",
      background: "#f2ece0", flexDirection: "column", gap: 16,
    }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".18em", color: "#9a8a70" }}>
        LOADING
      </div>
      <div style={{
        width: 120, height: 1, background: "linear-gradient(90deg,transparent,#b87c28,transparent)",
        animation: "mn-shimmer 1.6s ease-in-out infinite",
      }} />
      <style>{`@keyframes mn-shimmer{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );
}
