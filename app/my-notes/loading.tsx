export default function MyNotesLoading() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f2ece0", overflow: "hidden", animation: "sk-appear 900ms ease-out both" }}>
      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:0.28} 50%{opacity:0.6} }
        @keyframes sk-appear { 0%,44%{opacity:0} 100%{opacity:1} }
      `}</style>

      <div style={{ width: 48, borderRight: "1px solid rgba(0,0,0,0.07)", flexShrink: 0 }} />

      <div style={{ width: 210, borderRight: "1px solid rgba(0,0,0,0.07)", flexShrink: 0, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ width: 40, height: 9, borderRadius: 2, background: "rgba(132,84,0,0.12)", animation: "sk-pulse 1.6s ease-in-out infinite" }} />
        {[70, 55, 65, 50, 60, 45].map((w, i) => (
          <div key={i} style={{ width: `${w}%`, height: 24, borderRadius: 2, background: "rgba(132,84,0,0.08)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.07}s infinite` }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: "22px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, alignContent: "start" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ height: 155 + (i % 3) * 28, borderRadius: 3, background: "rgba(132,84,0,0.07)", animation: `sk-pulse 1.6s ease-in-out ${i * 0.06}s infinite` }} />
        ))}
      </div>
    </div>
  );
}
