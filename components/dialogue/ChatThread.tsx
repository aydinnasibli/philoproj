"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { MessageData } from "@/app/dialogue/actions";

export default function ChatThread({
  messages,
  philosopherName,
  philosopherAvatar,
  isStreaming,
}: {
  messages: MessageData[];
  philosopherName: string;
  philosopherAvatar: string;
  isStreaming: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const visibleMessages = messages.filter((m) => m.role !== "system");

  if (visibleMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center animate-fade-up-sm">
          <div className="font-cinzel text-xl tracking-[.3em] text-stone-300 dark:text-stone-700 mb-3">
            ✦
          </div>
          <p className="font-serif italic text-base text-stone-400 dark:text-stone-500 max-w-[32ch] leading-relaxed">
            Ask {philosopherName} a question to begin the dialogue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      {visibleMessages.map((msg, i) => {
        const isUser = msg.role === "user";
        const isLastAssistant =
          msg.role === "assistant" && i === visibleMessages.length - 1;

        return (
          <div
            key={`${msg.createdAt}-${i}`}
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fade-up-sm`}
          >
            {/* Philosopher avatar */}
            {!isUser && (
              <div className="shrink-0 mt-1">
                {philosopherAvatar ? (
                  <Image
                    src={philosopherAvatar}
                    alt={philosopherName}
                    width={28}
                    height={28}
                    className="size-7 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                  />
                ) : (
                  <div className="size-7 rounded-full bg-stone-200 dark:bg-stone-700 border border-stone-300 dark:border-stone-700 flex items-center justify-center">
                    <span className="font-serif italic text-[10px] text-stone-400 dark:text-stone-500">
                      {philosopherName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`
                max-w-[85%] md:max-w-[70%] rounded-sm px-4 py-3
                ${
                  isUser
                    ? "bg-stone-200 dark:bg-stone-800 text-zinc-900 dark:text-stone-100"
                    : "bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-zinc-800 dark:text-stone-200"
                }
              `}
            >
              <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                {msg.content}
                {isLastAssistant && isStreaming && (
                  <span className="inline-block w-[2px] h-[1em] bg-zinc-600 dark:bg-zinc-400 ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
