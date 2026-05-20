export default function Loading() {
  return (
    <div className="fixed inset-0 animate-pulse bg-[radial-gradient(ellipse_at_38%_48%,var(--color-zinc-50)_0%,var(--color-zinc-100)_50%,var(--color-zinc-200)_100%)] dark:bg-[radial-gradient(ellipse_at_38%_48%,var(--color-zinc-900)_0%,var(--color-zinc-900)_50%,var(--color-zinc-950)_100%)]">
      <div className="absolute bottom-20 md:bottom-11 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5">
        <div className="font-serif italic text-sm text-zinc-600/45 dark:text-zinc-400/55 tracking-[0.04em] animate-pulse [animation-duration:1.8s]">
          Mapping the lineage…
        </div>
        <div className="w-[72px] h-px bg-linear-to-r from-transparent via-zinc-600/35 to-transparent animate-pulse [animation-duration:1.8s] [animation-delay:0.2s]" />
      </div>
    </div>
  );
}
