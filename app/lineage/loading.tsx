export default function Loading() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse at 38% 48%, #FDFAF5 0%, #F8F3E8 50%, #F0E9D6 100%)",
      animation: "sk-appear 900ms ease-out both",
    }}>
      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:0.28} 50%{opacity:0.7} }
        @keyframes sk-appear { 0%,44%{opacity:0} 100%{opacity:1} }
      `}</style>
      <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(132,84,0,0.45)", letterSpacing: "0.04em", animation: "sk-pulse 1.8s ease-in-out infinite" }}>
          Mapping the lineage…
        </div>
        <div style={{ width: 72, height: 1, background: "linear-gradient(90deg, transparent, rgba(132,84,0,0.35), transparent)", animation: "sk-pulse 1.8s ease-in-out 0.2s infinite" }} />
      </div>
    </div>
  );
}
