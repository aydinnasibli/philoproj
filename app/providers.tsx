"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

export function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={initialTheme ?? "light"} disableTransitionOnChange={true}>
      {/* reducedMotion="user" respects prefers-reduced-motion across all framer-motion
          components (template transitions, hero overlay, canvas, panels). */}
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
