const DELAYS = ["","[animation-delay:0.06s]","[animation-delay:0.12s]","[animation-delay:0.18s]","[animation-delay:0.24s]","[animation-delay:0.30s]"] as const;

const DESC_WIDTHS  = [100, 92, 97, 88] as const;
const IDEA_WIDTHS  = [60, 75, 55, 70] as const;
const INFLU_LEFT   = [80, 64, 96] as const;
const INFLU_RIGHT  = [72, 96, 60] as const;

export default function Loading() {
  return (
    <div className="min-h-screen pl-0 md:pl-20 animate-sk-appear">
      <div className="max-w-[820px] mx-auto px-4 md:px-12 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="w-16 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse mb-11" />
        <div className="w-[72px] h-[22px] rounded-sm bg-(--sk-accent) animate-sk-pulse mb-4" />
        <div className="w-[300px] h-[52px] rounded-sm bg-(--sk-bg) animate-sk-pulse mb-7" />
        <div className="flex items-center gap-3 mb-9">
          <div className="flex-1 h-px bg-(--sk-accent) animate-sk-pulse" />
          <div className="w-2 h-2 rounded-full bg-(--sk-accent) animate-sk-pulse [animation-delay:0.06s]" />
          <div className="flex-1 h-px bg-(--sk-accent) animate-sk-pulse [animation-delay:0.06s]" />
        </div>
        <div className="flex flex-col gap-[9px] mb-12">
          {DESC_WIDTHS.map((w, i) => (
            <div key={i} style={{ width: `${w}%` }} className={`h-[13px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse ${DELAYS[i]}`} />
          ))}
        </div>
        <div className="mb-12">
          <div className="w-20 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse mb-4.5" />
          <div className="flex flex-col gap-3">
            {IDEA_WIDTHS.map((w, i) => (
              <div key={i} className="flex gap-3.5 items-center">
                <div className="w-1 h-1 rounded-full bg-(--sk-accent) shrink-0" />
                <div style={{ width: `${w}%` }} className={`h-[12px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse ${DELAYS[i]}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-8 mb-12">
          <div className="flex-1">
            <div className="w-24 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse mb-3" />
            <div className="flex gap-1.5 flex-wrap">
              {INFLU_LEFT.map((w, i) => (
                <div key={i} style={{ width: `${w}px` }} className={`h-[26px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse ${DELAYS[i]}`} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="w-24 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse mb-3 [animation-delay:0.06s]" />
            <div className="flex gap-1.5 flex-wrap">
              {INFLU_RIGHT.map((w, i) => (
                <div key={i} style={{ width: `${w}px` }} className={`h-[26px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse ${DELAYS[i + 1]}`} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="w-24 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse mb-4.5" />
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex items-center gap-3.5 px-4 py-3.5 bg-(--card-bg-soft) border border-border-pale ${DELAYS[i]}`}>
                <div className="w-[42px] h-[42px] rounded-full shrink-0 bg-(--sk-accent) animate-sk-pulse" />
                <div className="flex flex-col gap-[5px]">
                  <div className="w-28 h-[13px] rounded-sm bg-(--sk-bg) animate-sk-pulse" />
                  <div className="w-20 h-[10px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.04s]" />
                </div>
                <div className="ml-auto w-10 h-[9px] rounded-sm bg-(--sk-accent) animate-sk-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
