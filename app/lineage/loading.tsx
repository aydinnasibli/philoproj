export default function Loading() {
  return (
    <div className="fixed inset-0 animate-sk-appear bg-[radial-gradient(ellipse_at_38%_48%,#FDFAF5_0%,#F8F3E8_50%,#F0E9D6_100%)]">
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 flex flex-col items-center gap-[10px]">
        <div className="font-serif italic text-[0.82rem] text-[rgba(132,84,0,0.45)] tracking-[0.04em] animate-sk-pulse [animation-duration:1.8s]">
          Mapping the lineage…
        </div>
        <div className="w-[72px] h-px bg-[linear-gradient(90deg,transparent,rgba(132,84,0,0.35),transparent)] animate-sk-pulse [animation-duration:1.8s] [animation-delay:0.2s]" />
      </div>
    </div>
  );
}
