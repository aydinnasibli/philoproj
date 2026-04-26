import { getSchoolsWithPhilosophers } from "@/lib/mockData";
import SchoolCard from "@/components/schools/SchoolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schools of Thought",
  description: "The great philosophical traditions of Western thought.",
};

export default function SchoolsPage() {
  const schools = getSchoolsWithPhilosophers();

  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", paddingLeft: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 48px 96px" }}>

        <div style={{ marginBottom: 56 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--accent)", marginBottom: 14,
          }}>
            Western Philosophy
          </div>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 400,
            color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-0.01em",
            margin: 0,
          }}>
            Schools of Thought
          </h1>
          <div style={{ height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.2), transparent)", marginTop: 24 }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 2,
        }}>
          {schools.map(school => (
            <SchoolCard key={school._id} school={school} />
          ))}
        </div>
      </div>
    </div>
  );
}
