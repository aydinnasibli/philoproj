export default function PathsLoading() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-8 md:pt-16 pb-12">
      <div className="mb-10">
        <div className="h-3 w-20 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-3 animate-pulse" />
        <div className="h-10 w-72 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-4 animate-pulse" />
        <div className="h-4 w-96 bg-zinc-950/8 dark:bg-stone-100/8 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse">
            <div className="h-5 w-48 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-3" />
            <div className="h-3 w-full bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-2" />
            <div className="h-3 w-3/4 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-4" />
            <div className="h-2.5 w-24 bg-zinc-950/8 dark:bg-stone-100/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
