export default function Loading() {
  return (
    <div style={{ paddingLeft: 80, minHeight: "100vh", background: "var(--parchment)", animation: "sk-appear 900ms ease-out both" }}>
      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:0.28} 50%{opacity:0.6} }
        @keyframes sk-appear { 0%,44%{opacity:0} 100%{opacity:1} }
      `}</style>

      <div style={{ padding: "2rem 2.5rem 1.25rem", borderBottom: "2px solid var(--ink)", display: "flex", alignItems: "baseline", gap: 16 }}>
        <div style={{ width: 44, height: 38, borderRadius: 2, background: "rgba(17,21,26,0.09)", animation: "sk-pulse 1.6s ease-in-out infinite" }} />
        <div style={{ width: 72, height: 11, borderRadius: 2, background: "rgba(17,21,26,0.07)", animation: "sk-pulse 1.6s ease-in-out 0.05s infinite" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 200px", padding: "8px 2.5rem", borderBottom: "1px solid var(--border)", background: "var(--canvas-warm)" }}>
        {[40, 28, 44].map((w, i) => (
          <div key={i} style={{ width: w, height: 10, borderRadius: 2, background: "rgba(17,21,26,0.07)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.06}s infinite` }} />
        ))}
      </div>

      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 200px 200px", alignItems: "center", padding: "14px 2.5rem", borderBottom: "1px solid var(--border-pale)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: "rgba(17,21,26,0.08)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.04}s infinite` }} />
            <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "rgba(17,21,26,0.08)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.04}s infinite` }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ width: 80 + (i % 5) * 24, height: 14, borderRadius: 2, background: "rgba(17,21,26,0.08)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.04}s infinite` }} />
              <div style={{ width: 64, height: 10, borderRadius: 2, background: "rgba(17,21,26,0.06)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.04 + 0.05}s infinite` }} />
            </div>
          </div>
          <div style={{ width: 50 + (i % 3) * 18, height: 12, borderRadius: 2, background: "rgba(17,21,26,0.07)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.04}s infinite` }} />
          <div style={{ width: 38 + (i % 4) * 14, height: 11, borderRadius: 2, background: "rgba(17,21,26,0.07)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.04}s infinite` }} />
        </div>
      ))}
    </div>
  );
}
