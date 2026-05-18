"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { updateTheme } from "@/app/my-notes/actions";

function ThemeSync() {
  const { theme } = useTheme();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (!theme) return;
    updateTheme(theme).catch(() => {});
  }, [theme]);

  return null;
}

export function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={initialTheme ?? "system"} disableTransitionOnChange={false}>
      <ThemeSync />
      {children}
    </ThemeProvider>
  );
}
