"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhilosopherListItem } from "@/lib/types";

export default function PhilosopherSelector({
  philosophers,
  onSelect,
}: {
  philosophers: PhilosopherListItem[];
  onSelect: (philosopher: PhilosopherListItem) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? philosophers.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.coreBranch.toLowerCase().includes(search.toLowerCase())
      )
    : philosophers;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8 animate-fade-up-sm">
          <div className="font-cinzel text-2xl tracking-[.3em] text-stone-300 dark:text-stone-700 mb-3">
            ✦
          </div>
          <h1 className="font-serif italic text-2xl text-zinc-950 dark:text-stone-100 mb-2">
            Begin a Dialogue
          </h1>
          <p className="font-sans text-sm text-slate-500 dark:text-stone-400 max-w-[42ch] mx-auto leading-relaxed">
            Choose a philosopher to converse with. They will respond in
            character, drawing from their actual ideas and works.
          </p>
        </div>

        {/* Search */}
        <div
          className="mb-6 animate-fade-up-sm"
          style={{ animationDelay: '0.1s' }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search philosophers..."
            className="w-full px-4 py-2.5 rounded-sm font-sans text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-zinc-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus-visible:border-zinc-500 dark:focus-visible:border-zinc-500 transition-[border-color] duration-150"
          />
        </div>

        {/* Philosopher grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((philosopher, i) => (
            <button
              key={philosopher._id}
              onClick={() => onSelect(philosopher)}
              className="group flex flex-col items-center gap-2 p-4 rounded-sm cursor-pointer bg-stone-50 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-[border-color,background] duration-150 text-left animate-fade-up-sm"
              style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
            >
              {philosopher.avatarUrl ? (
                <Image
                  src={philosopher.avatarUrl}
                  alt={philosopher.name}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover border border-stone-300 dark:border-stone-700 group-hover:border-zinc-500 dark:group-hover:border-zinc-500 transition-[border-color] duration-150"
                />
              ) : (
                <div className="size-12 rounded-full bg-stone-200 dark:bg-stone-700 border border-stone-300 dark:border-stone-700 flex items-center justify-center">
                  <span className="font-serif italic text-sm text-stone-400 dark:text-stone-500">
                    {philosopher.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="text-center min-w-0 w-full">
                <div className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 truncate">
                  {philosopher.name}
                </div>
                <div className="font-sans text-[10px] text-stone-400 dark:text-stone-500 tracking-wide mt-0.5 truncate">
                  {philosopher.coreBranch}
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center font-sans text-sm text-stone-400 dark:text-stone-500 mt-8">
            No philosophers found.
          </p>
        )}
      </div>
    </div>
  );
}
