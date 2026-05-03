export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", paddingLeft: 80, animation: "sk-appear 900ms ease-out both" }}>
      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:0.28} 50%{opacity:0.6} }
        @keyframes sk-appear { 0%,44%{opacity:0} 100%{opacity:1} }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 48px 96px" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ width: 240, height: 42, borderRadius: 2, background: "rgba(17,21,26,0.08)", animation: "sk-pulse 1.6s ease-in-out infinite" }} />
          <div style={{ height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.15), transparent)", marginTop: 24 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 2 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: 170, borderRadius: 2, background: "rgba(17,21,26,0.06)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.08}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
