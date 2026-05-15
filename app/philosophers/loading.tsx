const NAME_W  = ["w-20","w-[104px]","w-32","w-[152px]","w-44","w-24","w-[112px]","w-[136px]","w-20","w-[160px]","w-28","w-[144px]","w-[120px]","w-20"] as const;
const ERA_W   = ["w-[50px]","w-[68px]","w-[86px]"] as const;
const BRNCH_W = ["w-[38px]","w-[52px]","w-[66px]","w-[80px]"] as const;
const DELAYS  = ["","[animation-delay:0.04s]","[animation-delay:0.08s]","[animation-delay:0.12s]","[animation-delay:0.16s]","[animation-delay:0.20s]","[animation-delay:0.24s]","[animation-delay:0.28s]","[animation-delay:0.32s]","[animation-delay:0.36s]","[animation-delay:0.40s]","[animation-delay:0.44s]","[animation-delay:0.48s]","[animation-delay:0.52s]"] as const;

const ROW_GROUPS = [
  { size: 5, start: 0 },
  { size: 3, start: 5 },
  { size: 4, start: 8 },
  { size: 2, start: 12 },
] as const;

function SkRow({ i }: { i: number }) {
  return (
    <div className="grid grid-cols-[1fr_200px_200px] items-center py-[14px] border-b border-border-pale">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full shrink-0 bg-[rgba(17,21,26,0.08)] animate-sk-pulse ${DELAYS[i]}`} />
        <div className={`w-11 h-11 rounded-full shrink-0 bg-[rgba(17,21,26,0.08)] animate-sk-pulse ${DELAYS[i]}`} />
        <div className="flex flex-col gap-[5px]">
          <div className={`${NAME_W[i]} h-[14px] rounded-sm bg-[rgba(17,21,26,0.08)] animate-sk-pulse ${DELAYS[i]}`} />
          <div className={`w-16 h-[10px] rounded-sm bg-[rgba(17,21,26,0.06)] animate-sk-pulse ${DELAYS[i]}`} />
        </div>
      </div>
      <div className={`${ERA_W[i % 3]} h-3 rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse ${DELAYS[i]}`} />
      <div className={`${BRNCH_W[i % 4]} h-[11px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse ${DELAYS[i]}`} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen pl-[80px] animate-sk-appear">
      <div className="max-w-[1100px] mx-auto px-12 pt-16 pb-24">
        <div className="pt-3 pb-4 border-b-2 border-ink flex items-baseline gap-4">
          <div className="w-8 h-[28px] rounded-sm bg-[rgba(17,21,26,0.09)] animate-sk-pulse" />
          <div className="w-16 h-[10px] rounded-sm bg-[rgba(17,21,26,0.06)] animate-sk-pulse [animation-delay:0.05s]" />
        </div>

        <div className="grid grid-cols-[1fr_200px_200px] py-2 border-b border-border bg-canvas-warm">
          {(["w-10","w-7","w-11"] as const).map((w, i) => (
            <div key={i} className={`${w} h-[10px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse ${DELAYS[i]}`} />
          ))}
        </div>

        {ROW_GROUPS.map(({ size, start }) => (
          <div key={start}>
            <div className="border-b border-t border-border flex items-center gap-4 h-14">
              <div className="w-8 h-[9px] rounded-sm bg-[rgba(132,84,0,0.1)] animate-sk-pulse [animation-delay:0.06s]" />
              <div className="w-20 h-[9px] rounded-sm bg-[rgba(17,21,26,0.05)] animate-sk-pulse [animation-delay:0.08s]" />
            </div>
            {Array.from({ length: size }).map((_, ri) => (
              <SkRow key={ri} i={start + ri} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
