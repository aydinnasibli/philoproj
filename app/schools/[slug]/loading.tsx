const DELAYS = ["","[animation-delay:0.06s]","[animation-delay:0.12s]","[animation-delay:0.18s]","[animation-delay:0.24s]","[animation-delay:0.30s]"] as const;

const DESC_WIDTHS  = ["w-full","w-[92%]","w-[97%]","w-[88%]"] as const;
const IDEA_WIDTHS  = ["w-[60%]","w-3/4","w-[55%]","w-[70%]"] as const;
const INFLU_LEFT   = ["w-20","w-16","w-24"] as const;
const INFLU_RIGHT  = ["w-[72px]","w-24","w-[60px]"] as const;

export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="max-w-[820px] mx-auto px-4 md:px-12 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="w-16 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse mb-11" />
        <div className="w-[72px] h-[22px] rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse mb-4" />
        <div className="w-[300px] h-[52px] rounded-sm bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse mb-7" />
        <div className="flex items-center gap-3 mb-9">
          <div className="flex-1 h-px bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse [animation-delay:0.06s]" />
          <div className="flex-1 h-px bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse [animation-delay:0.06s]" />
        </div>
        <div className="flex flex-col gap-2 mb-12">
          {DESC_WIDTHS.map((w, i) => (
            <div key={i} className={`${w} h-[13px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i]}`} />
          ))}
        </div>
        <div className="mb-12">
          <div className="w-20 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse mb-4.5" />
          <div className="flex flex-col gap-3">
            {IDEA_WIDTHS.map((w, i) => (
              <div key={i} className="flex gap-3.5 items-center">
                <div className="w-1 h-1 rounded-full bg-zinc-700/10 dark:bg-zinc-500/10 shrink-0" />
                <div className={`${w} h-[12px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i]}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-8 mb-12">
          <div className="flex-1">
            <div className="w-24 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse mb-3" />
            <div className="flex gap-1.5 flex-wrap">
              {INFLU_LEFT.map((w, i) => (
                <div key={i} className={`${w} h-[26px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i]}`} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="w-24 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse mb-3 [animation-delay:0.06s]" />
            <div className="flex gap-1.5 flex-wrap">
              {INFLU_RIGHT.map((w, i) => (
                <div key={i} className={`${w} h-[26px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i + 1]}`} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="w-24 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse mb-4.5" />
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex items-center gap-3.5 px-4 py-3.5 bg-stone-50/60 dark:bg-stone-900/60 border border-zinc-100 dark:border-zinc-800 ${DELAYS[i]}`}>
                <div className="size-[42px] rounded-full shrink-0 bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-28 h-[13px] rounded-sm bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse" />
                  <div className="w-20 h-[10px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.04s]" />
                </div>
                <div className="ml-auto w-10 h-[9px] rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
