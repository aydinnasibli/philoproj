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
          ? "bg-[#F5EEE3] dark:bg-stone-800 border-[#845400]/20 dark:border-stone-700 text-[#845400] dark:text-[#C47029]"
          : "bg-transparent border-transparent text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-[#845400] dark:hover:text-[#C47029]"
      }`}
    >
      {children}
    </button>
  );
}
