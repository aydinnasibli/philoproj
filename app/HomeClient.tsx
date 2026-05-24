"use client";

import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import type { LineageNode, SchoolWithPhilosophers } from "@/lib/types";

// ssr:false defers the entire canvas bundle (framer-motion, canvas logic) off the critical path.
// The canvas has no meaningful server-rendered output — it requires window and pointer events.
const NetworkCanvas = dynamic(
  () => import("@/components/network/NetworkCanvas"),
  { ssr: false }
);

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
