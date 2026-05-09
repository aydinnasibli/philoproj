export default function MyNotesLoading() {
  return (
    <div className="flex h-screen bg-[#f2ece0] overflow-hidden animate-sk-appear">
      <div className="w-12 border-r border-[rgba(0,0,0,0.07)] shrink-0" />

      <div className="w-[210px] border-r border-[rgba(0,0,0,0.07)] shrink-0 p-5 flex flex-col gap-[14px]">
        <div className="w-10 h-[9px] rounded-sm bg-[rgba(132,84,0,0.12)] animate-sk-pulse" />
        {[70, 55, 65, 50, 60, 45].map((w, i) => (
          <div
            key={i}
            style={{ width: `${w}%`, animationDelay: `${i * 0.07}s` }}
            className="h-6 rounded-sm bg-[rgba(132,84,0,0.08)] animate-sk-pulse"
          />
        ))}
      </div>

      <div className="flex-1 p-[22px_24px] grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", alignContent: "start" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{ height: 155 + (i % 3) * 28, animationDelay: `${i * 0.06}s` }}
            className="rounded-[3px] bg-[rgba(132,84,0,0.07)] animate-sk-pulse"
          />
        ))}
      </div>
    </div>
  );
}
