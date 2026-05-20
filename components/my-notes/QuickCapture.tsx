"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function QuickCapture({ onSave, onClose, placeholder, initialTitle = "", initialBody = "" }: {
  onSave: (d: { title: string; body: string }) => void; onClose: () => void; placeholder: string;
  initialTitle?: string; initialBody?: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [title, setTitle] = useState(initialTitle);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);
  const save = useCallback(() => {
    if (!body.trim() && !title.trim()) return onClose();
    onSave({ title: title.trim(), body: body.trim() });
  }, [body, title, onClose, onSave]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, save]);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-600 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-[560px] bg-stone-50 dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 shadow-[0_30px_80px_rgba(0,0,0,.22)] overflow-hidden">
        <div className="h-[2px] bg-linear-to-r from-zinc-700 dark:from-zinc-500 via-zinc-600 dark:via-zinc-400 to-transparent" />
        <div className="px-5 pt-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)…" className="w-full bg-transparent border-none outline-none font-cinzel text-base tracking-[.04em] text-stone-900 dark:text-stone-100 mb-3" />
          <textarea ref={ref} value={body} onChange={e => setBody(e.target.value)} placeholder={placeholder} rows={5} className="w-full bg-transparent border-none outline-none resize-none font-serif text-lg leading-[1.9] text-stone-900 dark:text-stone-100" />
        </div>
        <div className="px-5 py-2.5 border-t border-stone-300 dark:border-stone-700 flex items-center justify-between bg-stone-50 dark:bg-stone-900">
          <span className="text-xs text-stone-400 dark:text-stone-500 italic">⌘↵ save · Esc cancel</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-3.5 py-1 text-xs font-cinzel cursor-pointer rounded-xs">Cancel</button>
            <button onClick={save} className="bg-stone-950 dark:bg-stone-100 text-stone-50 dark:text-stone-900 border-none px-4 py-1 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
