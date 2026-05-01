import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#FCFBF9" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          gap: "1.5rem",
          textAlign: "center",
          padding: "2rem",
        }}>
          <div style={{
            fontFamily: "system-ui, sans-serif", fontSize: "8px", fontWeight: 700,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#845400",
          }}>
            404
          </div>
          <h1 style={{
            fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 400, color: "#11151A", lineHeight: 1.1,
          }}>
            This page has been lost to history
          </h1>
          <p style={{
            fontFamily: "system-ui, sans-serif", fontSize: "0.9rem",
            color: "#5F6A78", maxWidth: "40ch", lineHeight: 1.7,
          }}>
            The entry you were looking for could not be found in the manuscript.
          </p>
          <Link href="/" style={{
            fontFamily: "system-ui, sans-serif", fontSize: "9px", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#845400", textDecoration: "none",
            borderBottom: "1px solid currentColor", paddingBottom: "2px",
          }}>
            Return to the Network
          </Link>
        </div>
      </body>
    </html>
  );
}
