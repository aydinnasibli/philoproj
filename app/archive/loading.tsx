export default function Loading() {
  return (
    <div className="pl-[80px] min-h-screen animate-sk-appear">
      <div className="pt-8 px-10 pb-5 border-b-2 border-ink flex items-baseline gap-4">
        <div className="w-[44px] h-[38px] rounded-sm bg-[rgba(17,21,26,0.09)] animate-sk-pulse" />
        <div style={{ animationDelay: "0.05s" }} className="w-[72px] h-[11px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse" />
      </div>

      <div className="grid grid-cols-[1fr_200px_200px] px-10 py-2 border-b border-border bg-canvas-warm">
        {[40, 28, 44].map((w, i) => (
          <div
            key={i}
            style={{ width: w, animationDelay: `${i * 0.06}s` }}
            className="h-[10px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse"
          />
        ))}
      </div>

      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[1fr_200px_200px] items-center px-10 py-[14px] border-b border-border-pale">
          <div className="flex items-center gap-3">
            <div
              style={{ animationDelay: `${i * 0.04}s` }}
              className="w-2 h-2 rounded-full shrink-0 bg-[rgba(17,21,26,0.08)] animate-sk-pulse"
            />
            <div
              style={{ animationDelay: `${i * 0.04}s` }}
              className="w-11 h-11 rounded-full shrink-0 bg-[rgba(17,21,26,0.08)] animate-sk-pulse"
            />
            <div className="flex flex-col gap-[5px]">
              <div
                style={{ width: 80 + (i % 5) * 24, animationDelay: `${i * 0.04}s` }}
                className="h-[14px] rounded-sm bg-[rgba(17,21,26,0.08)] animate-sk-pulse"
              />
              <div
                style={{ animationDelay: `${i * 0.04 + 0.05}s` }}
                className="w-16 h-[10px] rounded-sm bg-[rgba(17,21,26,0.06)] animate-sk-pulse"
              />
            </div>
          </div>
          <div
            style={{ width: 50 + (i % 3) * 18, animationDelay: `${i * 0.04}s` }}
            className="h-3 rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse"
          />
          <div
            style={{ width: 38 + (i % 4) * 14, animationDelay: `${i * 0.04}s` }}
            className="h-[11px] rounded-sm bg-[rgba(17,21,26,0.07)] animate-sk-pulse"
          />
        </div>
      ))}
    </div>
  );
}
