"use client";

export function IconBtn({ children, active, onClick, title }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-[38px] flex items-center justify-center rounded-[4px] cursor-pointer text-[16px] transition-all duration-150 shrink-0 border ${
        active
          ? "bg-(--mn-gold-hi) border-(--mn-gold) text-(--mn-gold)"
          : "bg-transparent border-transparent text-(--mn-ink-3) hover:bg-(--mn-panel) hover:text-(--mn-ink-2)"
      }`}
    >
      {children}
    </button>
  );
}
