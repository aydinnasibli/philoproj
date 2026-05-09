"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import type { EraWithPhilosophers } from "@/lib/types";

function formatYear(y: number) {
  if (y < 0) return `${Math.abs(y)} BC`;
  return `${y} AD`;
}

type Props = { eras: EraWithPhilosophers[] };

export default function EraGrid({ eras }: Props) {
  if (eras.length === 0) {
    return (
      <div className="px-10 py-16 text-ink-muted font-serif italic">
        No eras found. Run <code>npm run seed</code>.
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-10 grid bg-border" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5px" }}>
      {eras.map((era, idx) => (
        <motion.div key={era._id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08, duration: 0.5, ease: "easeOut" }} className="bg-canvas">
          <DashboardCard era={era} />
        </motion.div>
      ))}
    </div>
  );
}

function DashboardCard({ era }: { era: EraWithPhilosophers }) {
  return (
    <div className="p-10 h-full flex flex-col gap-5 relative overflow-hidden min-h-[300px] group">
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 bg-[linear-gradient(90deg,var(--accent),transparent)]" />
      <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-accent">
        {formatYear(era.startYear)} — {formatYear(era.endYear)}
      </span>
      <h2 className="font-serif text-[1.75rem] font-medium leading-[1.15] text-ink">{era.title}</h2>
      <p className="font-sans text-[0.875rem] leading-[1.75] text-ink-muted flex-1">{era.description}</p>

      {era.philosophers.length > 0 && (
        <div>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-ink-muted mb-[10px] font-semibold">Notable Thinkers</p>
          <div className="flex flex-wrap gap-[6px]">
            {era.philosophers.map((p) => (
              <Link
                key={p._id}
                href={`/philosophers/${p.slug}`}
                className="flex items-center gap-[6px] px-[10px] py-1 border border-border text-xs font-sans text-ink no-underline bg-transparent transition-[border-color,color] duration-200 hover:border-accent hover:text-accent"
              >
                {p.avatarUrl && (
                  <Image src={p.avatarUrl} alt={p.name} width={18} height={18} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                )}
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
