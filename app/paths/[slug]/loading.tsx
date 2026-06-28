export default function PathDetailLoading() {
  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-10 pt-8 md:pt-16 pb-12">
      <div className="mb-10 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-20 bg-zinc-950/8 dark:bg-stone-100/8 rounded-full" />
          <div className="h-3 w-24 bg-zinc-950/8 dark:bg-stone-100/8 rounded" />
        </div>
        <div className="h-10 w-80 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-4" />
        <div className="h-4 w-full bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-2" />
        <div className="h-4 w-2/3 bg-zinc-950/8 dark:bg-stone-100/8 rounded" />
      </div>
      <div className="space-y-8 pl-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-2.5 w-12 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-2" />
            <div className="h-5 w-48 bg-zinc-950/8 dark:bg-stone-100/8 rounded mb-2" />
            <div className="h-3 w-full bg-zinc-950/8 dark:bg-stone-100/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
