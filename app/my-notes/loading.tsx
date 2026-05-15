const NOTE_H = ["h-[155px]","h-[183px]","h-[211px]"] as const;
const DELAYS = ["","[animation-delay:0.06s]","[animation-delay:0.12s]","[animation-delay:0.18s]","[animation-delay:0.24s]","[animation-delay:0.30s]","[animation-delay:0.36s]","[animation-delay:0.42s]","[animation-delay:0.48s]"] as const;

export default function MyNotesLoading() {
  return (
    <div className="h-screen flex overflow-hidden bg-[#f2ece0] animate-sk-appear">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header bar */}
        <div className="px-6 py-[11px] border-b border-[#ddd5c2] flex items-center gap-[14px] shrink-0 bg-[rgba(242,236,224,0.92)]">
          <div className="shrink-0 flex flex-col gap-[6px]">
            <div className="w-28 h-[11px] rounded-sm bg-[rgba(132,84,0,0.12)] animate-sk-pulse" />
            <div className="w-44 h-[10px] rounded-sm bg-[rgba(132,84,0,0.08)] animate-sk-pulse [animation-delay:0.05s]" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-16 h-[9px] rounded-sm bg-[rgba(132,84,0,0.09)] animate-sk-pulse [animation-delay:0.06s]" />
            <div className="w-[260px] h-[30px] rounded-[3px] bg-[rgba(132,84,0,0.07)] animate-sk-pulse [animation-delay:0.08s]" />
          </div>
        </div>
        {/* Note grid */}
        <div className="flex-1 px-6 py-[22px] grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 content-start overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`${NOTE_H[i % 3]} rounded-[3px] bg-[rgba(132,84,0,0.07)] animate-sk-pulse ${DELAYS[i]}`} />
          ))}
        </div>
      </div>
      {/* NavRail — right side */}
      <div className="w-[52px] bg-[#ede7da] border-l border-[#ddd5c2] flex flex-col items-center py-[14px] gap-[6px] shrink-0">
        <div className="w-[20px] h-[32px] rounded-sm bg-[rgba(132,84,0,0.1)] animate-sk-pulse mb-3" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-[rgba(132,84,0,0.08)] animate-sk-pulse" />
        <div className="w-[28px] border-t border-[#ddd5c2] my-1" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-[rgba(132,84,0,0.08)] animate-sk-pulse [animation-delay:0.06s]" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-[rgba(132,84,0,0.08)] animate-sk-pulse [animation-delay:0.12s]" />
        <div className="w-[36px] h-[36px] rounded-[8px] bg-[rgba(132,84,0,0.08)] animate-sk-pulse [animation-delay:0.18s]" />
        <div className="flex-1" />
        <div className="w-[36px] h-[36px] rounded-full bg-[rgba(132,84,0,0.15)] animate-sk-pulse" />
      </div>
    </div>
  );
}
