"use client";

import { motion } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";

interface Props {
  schoolA: SchoolWithPhilosophers | null;
  schoolB: SchoolWithPhilosophers | null;
  onClose: () => void;
}

type ColumnColors = {
  acText:   string;
  acBg:     string;
  a14Bg:    string;
  a18Bg:    string;
  a30Border: string;
  a40Border: string;
};

const COMPARISON_COLORS: Record<"left" | "right", ColumnColors> = {
  left: {
    acText:    "text-[#C47029]",
    acBg:      "bg-[#C47029]",
    a14Bg:     "bg-[rgba(196,112,41,0.08)]",
    a18Bg:     "bg-[rgba(196,112,41,0.09)]",
    a30Border: "border-[rgba(196,112,41,0.19)]",
    a40Border: "border-[rgba(196,112,41,0.25)]",
  },
  right: {
    acText:    "text-[#5A6999]",
    acBg:      "bg-[#5A6999]",
    a14Bg:     "bg-[rgba(90,105,153,0.08)]",
    a18Bg:     "bg-[rgba(90,105,153,0.09)]",
    a30Border: "border-[rgba(90,105,153,0.19)]",
    a40Border: "border-[rgba(90,105,153,0.25)]",
  },
};

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[10px] px-8 py-6">
      <div className="w-10 h-10 rounded-full border-[1.5px] border-dashed border-[rgba(196,112,41,0.25)] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[rgba(196,112,41,0.2)]" />
      </div>
      <span className="font-serif italic text-[0.82rem] text-[rgba(17,21,26,0.3)]">{label}</span>
    </div>
  );
}

function SchoolColumn({ school, side, comparison }: { school: SchoolWithPhilosophers | null; side: "left" | "right"; comparison: "left" | "right" }) {
  const c = COMPARISON_COLORS[comparison];

  if (!school) {
    return (
      <div className="flex-1">
        <EmptyColumn label={side === "left" ? "Select first school on map" : "Select second school on map"} />
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto px-7 py-6 ${side === "left" ? "border-r border-r-[rgba(17,21,26,0.07)]" : ""}`}>
      <div className="flex items-start justify-between mb-[14px]">
        <div>
          <div className={`inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase ${c.acText} ${c.a14Bg} border ${c.a30Border} px-[9px] py-[3px] rounded-[2px] mb-[10px]`}>
            {school.eraRange}
          </div>
          <h3 className="font-serif text-[1.55rem] italic text-[#11151a] leading-[1.1] font-normal m-0">{school.title}</h3>
        </div>
        <div className={`w-7 h-7 rounded-full ${c.a18Bg} border ${c.a40Border} flex items-center justify-center shrink-0 mt-1`}>
          <div className={`w-[7px] h-[7px] rounded-full ${c.acBg} opacity-70`} />
        </div>
      </div>

      <div className="h-px bg-[linear-gradient(to_right,rgba(17,21,26,0.08),transparent)] mb-[14px]" />
      <p className="font-sans text-[0.74rem] leading-[1.75] text-[#5F6A78] mb-4">
        {school.description.slice(0, 200)}{school.description.length > 200 ? "…" : ""}
      </p>

      {school.coreIdeas.length > 0 && (
        <div className="mb-4">
          <div className="font-sans text-[7px] font-bold tracking-[0.18em] uppercase text-[#5F6A78] mb-[10px]">Core Ideas</div>
          <div className="flex flex-col gap-[6px]">
            {school.coreIdeas.slice(0, 3).map((idea, i) => (
              <div key={i} className="flex gap-[9px] items-start">
                <div className={`w-[3px] h-[3px] rounded-full ${c.acBg} opacity-60 mt-[6px] shrink-0`} />
                <span className="font-sans text-[0.71rem] leading-[1.65] text-[#43474c]">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.philosophers.length > 0 && (
        <div>
          <div className="font-sans text-[7px] font-bold tracking-[0.18em] uppercase text-[#5F6A78] mb-[10px]">Key Thinkers</div>
          <div className="flex flex-wrap gap-[6px]">
            {school.philosophers.slice(0, 4).map(p => (
              <div key={p._id} className="flex items-center gap-[7px] bg-[rgba(17,21,26,0.03)] border border-[rgba(17,21,26,0.08)] rounded-full pl-[6px] pr-[10px] py-[5px]">
                <div className={`w-5 h-5 rounded-full ${c.a18Bg} flex items-center justify-center font-serif text-[0.65rem] font-medium ${c.acText} shrink-0`}>
                  {p.name.charAt(0)}
                </div>
                <span className="font-sans text-[0.68rem] text-[#43474c]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparisonPanel({ schoolA, schoolB, onClose }: Props) {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      data-panel="true"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed bottom-0 left-[80px] right-0 h-[340px] z-70 flex flex-col bg-[rgba(253,250,245,0.98)] backdrop-blur-[28px] border-t border-t-[rgba(132,84,0,0.14)] shadow-[0_-16px_64px_rgba(17,21,26,0.12)]"
    >
      <div className="h-[2px] bg-[linear-gradient(to_right,#c47029_0%,rgba(196,112,41,0.38)_40%,transparent_100%)]" />
      <div className="px-7 py-3 border-b border-[rgba(17,21,26,0.06)] flex items-center justify-between bg-[rgba(253,250,245,0.7)]">
        <div className="flex items-center gap-[14px]">
          <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-[#11151a]">Dialectical Comparison</div>
          <div className="h-3 w-px bg-[rgba(17,21,26,0.12)]" />
          <div className="font-serif italic text-[0.75rem] text-[rgba(17,21,26,0.4)]">
            {schoolA && schoolB ? `${schoolA.title} · ${schoolB.title}` : schoolA ? `${schoolA.title} · select second` : "Select two schools on the map"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-[rgba(17,21,26,0.05)] border border-[rgba(17,21,26,0.1)] cursor-pointer flex items-center justify-center text-[0.7rem] text-[rgba(17,21,26,0.4)] transition-all duration-200 hover:bg-[rgba(17,21,26,0.1)] hover:text-[#11151a]"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <SchoolColumn school={schoolA} side="left"  comparison="left"  />
        <SchoolColumn school={schoolB} side="right" comparison="right" />
      </div>
    </motion.div>
  );
}
