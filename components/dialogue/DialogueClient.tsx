"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { SignInButton } from "@clerk/nextjs";
import type { PhilosopherListItem } from "@/lib/types";
import type { ConversationListItem, MessageData } from "@/app/dialogue/actions";
import {
  getConversation,
  createConversation,
  deleteConversation,
} from "@/app/dialogue/actions";
import PhilosopherSelector from "./PhilosopherSelector";
import ChatThread from "./ChatThread";
import ChatInput from "./ChatInput";

export default function DialogueClient({
  isAuthenticated,
  initialConversations,
  philosophers,
}: {
  isAuthenticated: boolean;
  initialConversations: ConversationListItem[];
  philosophers: PhilosopherListItem[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<{
    slug: string;
    name: string;
    avatarUrl: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectConversation = useCallback(async (id: string) => {
    setLoadingConversation(true);
    setError(null);
    try {
      const conv = await getConversation(id);
      if (conv) {
        setSelectedId(conv.id);
        setMessages(conv.messages);
        setSelectedPhilosopher({
          slug: conv.philosopherSlug,
          name: conv.philosopherName,
          avatarUrl:
            philosophers.find((p) => p.slug === conv.philosopherSlug)?.avatarUrl ?? "",
        });
        setSidebarOpen(false);
      }
    } catch {
      setError("Failed to load conversation");
    } finally {
      setLoadingConversation(false);
    }
  }, [philosophers]);

  const startNewDialogue = useCallback(
    async (philosopher: PhilosopherListItem) => {
      setError(null);
      try {
        const conv = await createConversation(philosopher.slug, philosopher.name);
        setSelectedId(conv.id);
        setMessages([]);
        setSelectedPhilosopher({
          slug: philosopher.slug,
          name: philosopher.name,
          avatarUrl: philosopher.avatarUrl,
        });
        setConversations((prev) => [
          {
            id: conv.id,
            philosopherSlug: philosopher.slug,
            philosopherName: philosopher.name,
            messageCount: 0,
            updatedAt: conv.updatedAt,
          },
          ...prev,
        ]);
        setSidebarOpen(false);
      } catch {
        setError("Failed to create conversation");
      }
    },
    []
  );

  const handleNewDialogue = useCallback(() => {
    setSelectedId(null);
    setMessages([]);
    setSelectedPhilosopher(null);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setMessages([]);
          setSelectedPhilosopher(null);
        }
      } catch {
        setError("Failed to delete conversation");
      }
    },
    [selectedId]
  );

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedPhilosopher || !selectedId || isStreaming) return;

      setError(null);
      const userMessage: MessageData = {
        role: "user",
        content,
        createdAt: Date.now(),
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsStreaming(true);

      // Add a placeholder for the assistant's response
      const assistantMessage: MessageData = {
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };
      setMessages([...newMessages, assistantMessage]);

      try {
        const res = await fetch("/api/dialogue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            philosopherSlug: selectedPhilosopher.slug,
            content: content,
            conversationId: selectedId,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || "Request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // skip malformed
            }
          }
        }

        // Update conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? { ...c, messageCount: c.messageCount + 2, updatedAt: Date.now() }
              : c
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        // Remove the empty assistant message on error
        setMessages(newMessages);
      } finally {
        setIsStreaming(false);
      }
    },
    [selectedPhilosopher, selectedId, messages, isStreaming]
  );

  if (!isAuthenticated) {
    return (
      <div className="relative flex h-screen items-center justify-center flex-col gap-5 text-center p-10 bg-stone-100 dark:bg-stone-900 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-5 px-6 md:px-24 opacity-[0.07] blur-[2px] select-none"
        >
          <div className="flex justify-end">
            <div className="max-w-[40ch] rounded-2xl bg-zinc-900 dark:bg-stone-200 px-5 py-3 text-left font-sans text-sm text-stone-100 dark:text-zinc-900">
              What does it mean to live a good life?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[52ch] rounded-2xl border border-stone-300 dark:border-stone-700 px-5 py-3 text-left font-serif italic text-base text-zinc-900 dark:text-stone-100">
              The unexamined life is not worth living. Virtue, not pleasure, is the soul&apos;s truest harmony — and harmony is its own reward.
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[40ch] rounded-2xl bg-zinc-900 dark:bg-stone-200 px-5 py-3 text-left font-sans text-sm text-stone-100 dark:text-zinc-900">
              But how do we know what virtue is?
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="font-cinzel text-3xl tracking-[.3em] text-stone-300 dark:text-stone-700">
            ✦
          </div>
          <h1 className="font-serif italic text-2xl text-zinc-950 dark:text-stone-100">
            Philosophical Dialogue
          </h1>
          <p className="font-sans text-sm text-slate-500 dark:text-stone-400 max-w-[36ch] leading-relaxed">
            Sign in to converse with history&apos;s greatest philosophers — powered by AI.
          </p>
          <SignInButton mode="modal">
            <button className="mt-2 bg-transparent py-2 px-6 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs transition-[color,border-color] duration-150 border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-zinc-700 dark:hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-400">
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-100 dark:bg-stone-900 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-15 left-3 z-30 size-9 rounded-lg flex items-center justify-center bg-stone-200/90 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 text-zinc-700 dark:text-zinc-400 cursor-pointer backdrop-blur-sm"
        title="Toggle conversations"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="animate-fade-in md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 bg-stone-50 dark:bg-stone-900
          border-r border-stone-300 dark:border-stone-700
          flex flex-col
          transform md:transform-none transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-stone-300 dark:border-stone-700 shrink-0">
          <h2 className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 tracking-wide">
            Dialogues
          </h2>
          <button
            onClick={handleNewDialogue}
            className="mt-3 w-full py-2 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs transition-[color,border-color,background] duration-150 border border-stone-300 dark:border-stone-700 text-zinc-700 dark:text-zinc-400 bg-transparent hover:bg-stone-200 dark:hover:bg-stone-800 hover:border-zinc-500 dark:hover:border-zinc-500"
          >
            + New Dialogue
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-8 px-4 font-sans leading-relaxed">
              No dialogues yet. Choose a philosopher to begin.
            </p>
          )}
          {conversations.map((conv) => (
            <div key={conv.id} className="group relative">
              <button
                onClick={() => selectConversation(conv.id)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-sm cursor-pointer
                  transition-[background,color] duration-150 bg-transparent border-none
                  ${
                    selectedId === conv.id
                      ? "bg-stone-200 dark:bg-stone-800 text-zinc-900 dark:text-zinc-200"
                      : "text-zinc-700 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
                  }
                `}
              >
                <div className="font-sans text-xs font-medium truncate">
                  {conv.philosopherName}
                </div>
                <div className="font-sans text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                  {conv.messageCount} messages
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                title="Delete conversation"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer bg-transparent border-none text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {loadingConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="font-serif italic text-sm text-stone-400 dark:text-stone-500 animate-pulse">
              Loading conversation...
            </div>
          </div>
        ) : selectedPhilosopher && selectedId ? (
          <>
            {/* Chat header */}
            <div
              className="animate-fade-down px-6 py-3 border-b border-stone-300 dark:border-stone-700 flex items-center gap-3 shrink-0 bg-stone-50 dark:bg-stone-900"
            >
              {selectedPhilosopher.avatarUrl && (
                <Image
                  src={selectedPhilosopher.avatarUrl}
                  alt={selectedPhilosopher.name}
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                />
              )}
              <div>
                <div className="font-serif italic text-sm text-zinc-950 dark:text-stone-100">
                  Dialogue with {selectedPhilosopher.name}
                </div>
                <div className="font-sans text-[10px] text-stone-400 dark:text-stone-500 tracking-wide">
                  AI DIALOGUE
                </div>
              </div>
            </div>

            {/* Chat thread */}
            <ChatThread
              messages={messages}
              philosopherName={selectedPhilosopher.name}
              philosopherAvatar={selectedPhilosopher.avatarUrl}
              isStreaming={isStreaming}
            />

            {/* Error display */}
            {error && (
              <div className="animate-fade-in px-6 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900">
                <p className="font-sans text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Chat input */}
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
              philosopherName={selectedPhilosopher.name}
            />
          </>
        ) : (
          <PhilosopherSelector
            philosophers={philosophers}
            onSelect={startNewDialogue}
          />
        )}
      </div>
    </div>
  );
}
