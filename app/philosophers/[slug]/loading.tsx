const DELAYS = ["","[animation-delay:0.04s]","[animation-delay:0.08s]","[animation-delay:0.12s]","[animation-delay:0.16s]","[animation-delay:0.20s]"] as const;

const BIO_WIDTHS = [100, 92, 97, 88, 95, 100, 84] as const;
const SIDEBAR_WIDTHS = [70, 55, 80, 60, 75, 65] as const;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-8 md:pt-24 pb-12 animate-sk-appear">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-16 items-start">
        <article>
          <div className="-mx-4 md:-mx-10 px-4 md:px-10 pt-8 pb-8 md:pb-10 mb-8 bg-(--sk-accent) border-t-4 border-t-(--sk-accent)">
            <div className="flex gap-2 items-center mb-10">
              <div className="w-14 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse" />
              <div className="w-[6px] h-[9px] rounded-sm bg-(--sk-bg-dim) animate-sk-pulse [animation-delay:0.03s]" />
              <div className="w-20 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.05s]" />
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-[120px] h-[120px] md:w-[200px] md:h-[200px] rounded-full shrink-0 bg-(--sk-bg) animate-sk-pulse" />
              <div className="pt-2 flex flex-col gap-4">
                <div className="w-20 h-[10px] rounded-sm bg-(--sk-accent) animate-sk-pulse [animation-delay:0.06s]" />
                <div className="w-[280px] h-[52px] rounded-sm bg-(--sk-bg) animate-sk-pulse [animation-delay:0.08s]" />
                <div className="w-14 h-[2px] bg-(--sk-bg) animate-sk-pulse [animation-delay:0.10s]" />
                <div className="w-36 h-[11px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.12s]" />
              </div>
            </div>
          </div>
          <div className="pl-6 mb-8 border-l-[3px] border-l-(--sk-accent)">
            <div className="w-[78%] h-[22px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.10s]" />
          </div>
          <div className="border-t border-border pt-6 flex flex-col gap-[7px]">
            <div className="w-full h-[13px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.12s]" />
            <div className="w-[87%] h-[13px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.14s]" />
            <div className="w-[73%] h-[13px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.16s]" />
          </div>
          <section className="mt-12">
            <div className="w-20 h-[9px] rounded-sm bg-(--sk-accent) animate-sk-pulse mb-6" />
            <div className="flex flex-col gap-[9px]">
              {BIO_WIDTHS.map((w, i) => (
                <div key={i} style={{ width: `${w}%` }} className={`h-[13px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse ${DELAYS[i % 6]}`} />
              ))}
            </div>
          </section>
        </article>
        <aside className="sticky top-4 md:top-[88px]">
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="h-[48px] bg-(--sk-bg-dim) border-b border-border-pale animate-sk-pulse" />
            <div className="p-4 flex flex-col gap-[14px]">
              {SIDEBAR_WIDTHS.map((w, i) => (
                <div key={i} style={{ width: `${w}%` }} className={`h-[11px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse ${DELAYS[i]}`} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
