"use client";

import { ErrorBoundary } from "react-error-boundary";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import type { LineageNode, SchoolWithPhilosophers } from "@/lib/types";

export default function HomeClient({
  nodes,
  schools,
}: {
  nodes: LineageNode[];
  schools: SchoolWithPhilosophers[];
}) {
  return (
    <ErrorBoundary fallback={<div className="flex items-center justify-center h-screen font-serif italic text-slate-500 dark:text-stone-400">The network couldn&rsquo;t be loaded.</div>}>
      <NetworkCanvas nodes={nodes} schools={schools} />
    </ErrorBoundary>
  );
}
