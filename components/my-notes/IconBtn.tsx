"use client";

export function IconBtn({ children, active, onClick, title }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-[38px] flex items-center justify-center rounded-md cursor-pointer text-base transition-[background-color] duration-150 shrink-0 border ${
        active
          ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
          : "bg-transparent border-transparent text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-400"
      }`}
    >
      {children}
    </button>
  );
}
