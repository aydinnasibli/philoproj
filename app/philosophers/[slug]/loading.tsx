const DELAYS = ["","[animation-delay:0.04s]","[animation-delay:0.08s]","[animation-delay:0.12s]","[animation-delay:0.16s]","[animation-delay:0.20s]"] as const;

const BIO_WIDTHS     = ["w-full","w-[92%]","w-[97%]","w-[88%]","w-[95%]","w-full","w-[84%]"] as const;
const SIDEBAR_WIDTHS = ["w-[70%]","w-[55%]","w-4/5","w-[60%]","w-3/4","w-[65%]"] as const;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-8 md:pt-24 pb-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-16 items-start">
        <article>
          <div className="-mx-4 md:-mx-10 px-4 md:px-10 pt-8 pb-8 md:pb-10 mb-8 bg-zinc-700/10 dark:bg-zinc-500/10 border-t-4 border-t-zinc-700/10 dark:border-t-zinc-500/10">
            <div className="flex gap-2 items-center mb-10">
              <div className="w-14 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse" />
              <div className="w-[6px] h-[9px] rounded-sm bg-zinc-950/5 dark:bg-stone-100/5 animate-pulse [animation-delay:0.03s]" />
              <div className="w-20 h-[9px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.05s]" />
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-[120px] h-[120px] md:w-[200px] md:h-[200px] rounded-full shrink-0 bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse" />
              <div className="pt-2 flex flex-col gap-4">
                <div className="w-20 h-[10px] rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse [animation-delay:0.06s]" />
                <div className="w-[280px] h-[52px] rounded-sm bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse [animation-delay:0.08s]" />
                <div className="w-14 h-0.5 bg-zinc-950/8 dark:bg-stone-100/8 animate-pulse [animation-delay:0.10s]" />
                <div className="w-36 h-[11px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.12s]" />
              </div>
            </div>
          </div>
          <div className="px-5 py-4 mb-8 bg-zinc-950/3 dark:bg-stone-100/3 rounded-xs">
            <div className="w-[78%] h-[22px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.10s]" />
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6 flex flex-col gap-1.5">
            <div className="w-full h-[13px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.12s]" />
            <div className="w-[87%] h-[13px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.14s]" />
            <div className="w-[73%] h-[13px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.16s]" />
          </div>
          <section className="mt-12">
            <div className="w-20 h-[9px] rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse mb-6" />
            <div className="flex flex-col gap-2">
              {BIO_WIDTHS.map((w, i) => (
                <div key={i} className={`${w} h-[13px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i % 6]}`} />
              ))}
            </div>
          </section>
        </article>
        <aside className="sticky top-4 md:top-[88px]">
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-sm overflow-hidden">
            <div className="h-12 bg-zinc-950/5 dark:bg-stone-100/5 border-b border-zinc-100 dark:border-zinc-800 animate-pulse" />
            <div className="p-4 flex flex-col gap-3.5">
              {SIDEBAR_WIDTHS.map((w, i) => (
                <div key={i} className={`${w} h-[11px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i]}`} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
