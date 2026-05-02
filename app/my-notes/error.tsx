"use client";

export default function MyNotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: "flex", height: "100vh", alignItems: "center", justifyContent: "center",
      background: "#f2ece0", flexDirection: "column", gap: 16, textAlign: "center", padding: 40,
    }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "#ddd5c2", letterSpacing: ".3em" }}>✦</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "#9a8a70", maxWidth: 360, lineHeight: 1.7 }}>
        Something went wrong loading your manuscript.
      </div>
      {error.digest && (
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#ccc0a8" }}>{error.digest}</div>
      )}
      <button onClick={reset} style={{
        marginTop: 8, background: "transparent", border: "1px solid #ddd5c2", color: "#9a8a70",
        padding: "8px 24px", fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: ".12em",
        cursor: "pointer", borderRadius: 2, transition: "all .15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#b87c28"; e.currentTarget.style.color = "#b87c28"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd5c2"; e.currentTarget.style.color = "#9a8a70"; }}>
        Try again
      </button>
    </div>
  );
}
