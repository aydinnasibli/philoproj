const DELAYS = ["","[animation-delay:0.08s]","[animation-delay:0.16s]","[animation-delay:0.24s]","[animation-delay:0.32s]","[animation-delay:0.40s]","[animation-delay:0.48s]","[animation-delay:0.56s]"] as const;

export default function Loading() {
  return (
    <div className="min-h-screen pl-[80px] animate-sk-appear">
      <div className="max-w-[1100px] mx-auto px-12 pt-16 pb-24">
        <div className="mb-14">
          <div className="w-60 h-[42px] rounded-sm bg-[rgba(17,21,26,0.08)] animate-sk-pulse" />
          <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.15),transparent)] mt-6" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[2px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-[170px] rounded-sm bg-[rgba(17,21,26,0.06)] animate-sk-pulse ${DELAYS[i]}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
