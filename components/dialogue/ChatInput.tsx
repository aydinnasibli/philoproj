"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export default function ChatInput({
  onSend,
  disabled,
  philosopherName,
}: {
  onSend: (content: string) => void;
  disabled: boolean;
  philosopherName: string;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 20;
    const maxLines = 4;
    const maxHeight = lineHeight * maxLines + 16; // padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="px-4 md:px-6 py-3 border-t border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 shrink-0">
      <div className="flex gap-3 items-end max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${philosopherName} a question...`}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-sm font-sans text-sm bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-zinc-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus-visible:border-zinc-500 dark:focus-visible:border-zinc-500 transition-[border-color] duration-150 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          title="Send message"
          className="shrink-0 size-10 rounded-sm flex items-center justify-center cursor-pointer transition-[color,border-color,background,opacity] duration-150 border border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-800 text-zinc-700 dark:text-zinc-400 hover:border-zinc-500 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="text-center font-sans text-[10px] text-stone-400 dark:text-stone-500 mt-2 tracking-wide">
        AI-generated responses in character. Not historically verbatim.
      </p>
    </div>
  );
}
