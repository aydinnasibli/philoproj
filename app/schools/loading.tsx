const DELAYS = ["","[animation-delay:0.08s]","[animation-delay:0.16s]","[animation-delay:0.24s]","[animation-delay:0.32s]","[animation-delay:0.40s]","[animation-delay:0.48s]","[animation-delay:0.56s]"] as const;

export default function Loading() {
  return (
    <div className="min-h-screen pl-0 md:pl-20 animate-pulse">
      <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="mb-14">
          <h1 className="font-serif italic font-normal text-zinc-950 dark:text-stone-100 leading-tight tracking-[-0.01em] m-0 text-[clamp(2.2rem,4vw,3.2rem)]">
            Schools of Thought
          </h1>
          <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.2),transparent)] mt-6" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-[170px] rounded-sm bg-zinc-950/6 dark:bg-stone-100/6 animate-pulse ${DELAYS[i]}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
