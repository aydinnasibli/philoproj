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
          ? "bg-amber-700 dark:bg-amber-600-hi border-amber-700 dark:border-amber-500 text-amber-700 dark:text-amber-500"
          : "bg-transparent border-transparent text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-400"
      }`}
    >
      {children}
    </button>
  );
}
