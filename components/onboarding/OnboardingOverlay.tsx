"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "tlm-onboarding-seen";

const STEPS = [
  {
    title: "Welcome to The Living Manuscript",
    body: "A living map of Western philosophical thought — trace the lineage, ideas, and connections of history's greatest thinkers.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Click any philosopher",
    body: "Tap a portrait to open their profile — explore their ideas, influences, schools of thought, and key works.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M15 15l-2 5L9 9l11 4-5 2z" />
        <path d="M22 22l-5-5" />
      </svg>
    ),
  },
  {
    title: "Trace connections",
    body: "Hover over a thinker to see who they influenced and who shaped their thinking. The edges reveal intellectual lineage.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M8.59 8.59 15.42 15.42" />
      </svg>
    ),
  },
  {
    title: "Write your thoughts",
    body: "Capture insights in your personal philosophical journal. Tag, link, and annotate your notes as you explore.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
] as const;

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [step, setStep] = useState(0);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  }, [step, dismiss]);

  if (!visible) return null;

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
        <div
          key={step}
          className="animate-fade-in-scale relative z-10 w-[90vw] max-w-[420px] bg-stone-50 dark:bg-stone-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* Gold accent */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c47029] to-transparent" />

          <div className="px-7 pt-7 pb-6">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-zinc-950/5 dark:bg-stone-100/5 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-5">
              {s.icon}
            </div>

            {/* Title */}
            <h2 className="font-serif italic text-xl font-medium text-zinc-950 dark:text-stone-100 mb-2.5">
              {s.title}
            </h2>

            {/* Body */}
            <p className="font-sans text-sm leading-relaxed text-slate-500 dark:text-stone-400 mb-6">
              {s.body}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {/* Step dots */}
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      i === step
                        ? "bg-[#c47029]"
                        : i < step
                          ? "bg-zinc-400 dark:bg-zinc-500"
                          : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={dismiss}
                  className="font-sans text-xs text-slate-500 dark:text-stone-400 hover:text-zinc-950 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Skip
                </button>
                <button
                  onClick={next}
                  className="font-sans text-xs font-medium px-4 py-2 rounded-md bg-zinc-950 dark:bg-stone-100 text-stone-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  {step === STEPS.length - 1 ? "Get started" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
