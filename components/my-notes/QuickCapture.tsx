"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function QuickCapture({ onSave, onClose, placeholder }: {
  onSave: (d: { title: string; body: string }) => void; onClose: () => void; placeholder: string;
}) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
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
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-600 bg-[rgba(18,15,10,.6)] backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-[560px] bg-(--mn-card) rounded-[4px] border border-(--mn-border) shadow-[0_30px_80px_rgba(0,0,0,.22)] overflow-hidden">
        <div className="h-[2px] bg-linear-to-r from-(--mn-gold) via-(--mn-gold-b) to-transparent" />
        <div className="px-[22px] pt-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)…" className="w-full bg-transparent border-none outline-none font-cinzel text-[14px] tracking-[.04em] text-(--mn-ink) mb-3" />
          <textarea ref={ref} value={body} onChange={e => setBody(e.target.value)} placeholder={placeholder} rows={5} className="w-full bg-transparent border-none outline-none resize-none font-serif text-[18px] leading-[1.9] text-(--mn-ink)" />
        </div>
        <div className="px-[22px] py-[10px] border-t border-(--mn-border) flex items-center justify-between bg-(--mn-surface)">
          <span className="text-[11.5px] text-(--mn-ink-3) italic">⌘↵ save · Esc cancel</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[14px] py-1 text-[10px] font-cinzel cursor-pointer rounded-[2px]">Cancel</button>
            <button onClick={save} className="bg-(--mn-ink) text-(--mn-surface) border-none px-[18px] py-1 text-[10px] font-cinzel tracking-widest cursor-pointer rounded-[2px]">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
