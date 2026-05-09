const NAME_W  = ["w-20","w-[104px]","w-32","w-[152px]","w-44","w-24","w-[112px]","w-[136px]","w-20","w-[160px]","w-28","w-[144px]","w-[120px]","w-20"] as const;
const ERA_W   = ["w-[50px]","w-[68px]","w-[86px]"] as const;
const BRNCH_W = ["w-[38px]","w-[52px]","w-[66px]","w-[80px]"] as const;
const DELAYS  = ["","[animation-delay:0.04s]","[animation-delay:0.08s]","[animation-delay:0.12s]","[animation-delay:0.16s]","[animation-delay:0.20s]","[animation-delay:0.24s]","[animation-delay:0.28s]","[animation-delay:0.32s]","[animation-delay:0.36s]","[animation-delay:0.40s]","[animation-delay:0.44s]","[animation-delay:0.48s]","[animation-delay:0.52s]"] as const;

export default function Loading() {
  return (
    <div className="pl-[80px] min-h-screen animate-sk-appear">
      <div className="pt-8 px-10 pb-5 border-b-2 border-ink flex items-baseline gap-4">
        <div className="w-[44px] h-[38px] rounded-sm bg-[rgba(17,21,26,0.09)] animate-sk-pulse" />
        <div className="w-[72px] h-[11px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse [animation-delay:0.05s]" />
      </div>

      <div className="grid grid-cols-[1fr_200px_200px] px-10 py-2 border-b border-border bg-canvas-warm">
        {(["w-10","w-7","w-11"] as const).map((w, i) => (
          <div key={i} className={`${w} h-[10px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse ${DELAYS[i]}`} />
        ))}
      </div>

      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[1fr_200px_200px] items-center px-10 py-[14px] border-b border-border-pale">
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
      ))}
    </div>
  );
}
