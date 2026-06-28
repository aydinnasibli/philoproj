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
    <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_200px_200px] items-center py-3.5 border-b border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-3 pl-2">
        <div className={`w-11 h-11 rounded-full shrink-0 bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse ${DELAYS[i]}`} />
        <div className="flex flex-col gap-1.5">
          <div className={`${NAME_W[i]} h-[14px] rounded-sm bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse ${DELAYS[i]}`} />
          <div className={`w-16 h-[10px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i]}`} />
        </div>
      </div>
      <div className={`hidden md:block ${ERA_W[i % 3]} h-3 rounded-sm bg-zinc-950/7 dark:bg-stone-100/7 animate-pulse ${DELAYS[i]}`} />
      <div className={`hidden md:block ${BRNCH_W[i % 4]} h-[11px] rounded-sm bg-zinc-950/7 dark:bg-stone-100/7 animate-pulse ${DELAYS[i]}`} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="pt-3 pb-4 border-b-2 border-zinc-950 dark:border-stone-100 flex items-baseline gap-4">
          <div className="w-8 h-[28px] rounded-sm bg-zinc-950/9 dark:bg-stone-100/9 animate-pulse" />
          <div className="w-16 h-[10px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.05s]" />
        </div>

        <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_200px_200px] py-2 border-b border-zinc-200 dark:border-zinc-700 bg-stone-100 dark:bg-stone-950">
          {(["w-10","w-7","w-11"] as const).map((w, i) => (
            <div key={i} className={`${w} h-[10px] rounded-sm bg-zinc-950/7 dark:bg-stone-100/7 animate-pulse ${DELAYS[i]}`} />
          ))}
        </div>

        {ROW_GROUPS.map(({ size, start }) => (
          <div key={start}>
            <div className="border-b border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-4 h-14">
              <div className="w-8 h-[9px] rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse [animation-delay:0.06s]" />
              <div className="w-20 h-[9px] rounded-sm bg-zinc-950/5 dark:bg-stone-100/5 animate-pulse [animation-delay:0.08s]" />
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
