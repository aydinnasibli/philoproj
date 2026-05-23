"use client";

import { ThemeProvider } from "next-themes";

export function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={initialTheme ?? "light"} disableTransitionOnChange={true}>
      {children}
    </ThemeProvider>
  );
}
