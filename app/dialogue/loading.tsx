export default function DialogueLoading() {
  return (
    <div className="h-screen flex animate-pulse bg-stone-100 dark:bg-stone-900">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-72 border-r border-stone-300 dark:border-stone-700 flex-col bg-stone-50 dark:bg-stone-900">
        <div className="px-4 py-4 border-b border-stone-300 dark:border-stone-700">
          <div className="w-32 h-4 rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse" />
          <div className="w-full h-9 rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse mt-3" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse"
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
      </div>

      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-5 rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse" />
        <div className="w-64 h-3 rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse [animation-delay:0.08s]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 px-6 max-w-lg w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-sm bg-zinc-700/10 dark:bg-zinc-500/10 animate-pulse"
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
