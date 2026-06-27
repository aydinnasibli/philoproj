export default function DirectoryListHeader({ count }: { count: number }) {
  return (
    <>
      <div className="mb-10 md:mb-14 animate-fade-up">
        <h1 className="font-serif italic font-medium text-[clamp(2.2rem,4vw,3.2rem)] text-zinc-950 dark:text-stone-100 leading-tight tracking-[-0.01em] m-0">
          Thinkers
        </h1>
        <div className="h-px bg-[#11151A]/10 dark:bg-stone-100/10 mt-6" />
        <p className="font-serif text-[0.9375rem] leading-[1.8] text-slate-500 dark:text-stone-400 mt-5 max-w-[55ch] m-0">
          Every mind that shaped the Western philosophical tradition, from the pre-Socratics to the twentieth century.
        </p>
      </div>

      <div
        className="pt-3 pb-4 border-b-2 border-zinc-950 dark:border-stone-100 flex items-baseline gap-4 animate-fade-up"
        style={{ animationDelay: '0.07s' }}
      >
        <span className="font-serif italic text-[clamp(1.5rem,4vw,2rem)] font-normal leading-none">{count}</span>
        <span className="font-sans text-xs tracking-widest uppercase text-slate-500 dark:text-stone-400 font-medium">Thinkers</span>
      </div>
    </>
  );
}
