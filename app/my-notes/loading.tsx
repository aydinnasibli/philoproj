const NOTE_H = ["h-[155px]","h-[183px]","h-[211px]"] as const;
const DELAYS = ["","[animation-delay:0.06s]","[animation-delay:0.12s]","[animation-delay:0.18s]","[animation-delay:0.24s]","[animation-delay:0.30s]","[animation-delay:0.36s]","[animation-delay:0.42s]","[animation-delay:0.48s]"] as const;

export default function MyNotesLoading() {
  return (
    <div className="h-screen flex overflow-hidden animate-sk-appear bg-(--mn-bg)">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-6 py-[11px] border-b border-(--mn-border) flex items-center gap-3.5 shrink-0 bg-(--mn-surface)">
          <div className="shrink-0 flex flex-col gap-1.5">
            <div className="w-28 h-[11px] rounded-sm bg-(--sk-accent) animate-sk-pulse" />
            <div className="w-44 h-[10px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.05s]" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-16 h-[9px] rounded-sm bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.06s]" />
            <div className="w-[140px] md:w-[260px] h-[30px] rounded-[3px] bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.08s]" />
          </div>
        </div>
        <div className="flex-1 px-6 py-[22px] grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 content-start overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`${NOTE_H[i % 3]} rounded-[3px] bg-(--sk-accent) animate-sk-pulse ${DELAYS[i]}`} />
          ))}
        </div>
      </div>
      <div className="w-[52px] bg-(--mn-panel) border-l border-(--mn-border) flex flex-col items-center py-3.5 gap-1.5 shrink-0">
        <div className="w-[20px] h-[32px] rounded-sm bg-(--sk-accent) animate-sk-pulse mb-3" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-(--sk-bg-soft) animate-sk-pulse" />
        <div className="w-[28px] border-t border-(--mn-border) my-1" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.06s]" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.12s]" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-(--sk-bg-soft) animate-sk-pulse [animation-delay:0.18s]" />
        <div className="flex-1" />
        <div className="w-[36px] h-[36px] rounded-full bg-(--sk-accent) animate-sk-pulse" />
      </div>
    </div>
  );
}
