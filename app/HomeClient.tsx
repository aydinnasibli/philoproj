"use client";

import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { LineageNode, SchoolWithPhilosophers } from "@/lib/types";

// ssr:false — both canvases rely on browser APIs and have no meaningful SSR output.
// Loading lazily also means only the relevant bundle downloads per device.
const NetworkCanvas     = dynamic(() => import("@/components/network/NetworkCanvas"),     { ssr: false });
const NetworkMobileView = dynamic(() => import("@/components/network/NetworkMobileView"), { ssr: false });

const errorFallback = (
  <div className="flex items-center justify-center h-screen font-serif italic text-slate-500 dark:text-stone-400">
    The network couldn&rsquo;t be loaded.
  </div>
);

export default function HomeClient({
  nodes,
  schools,
}: {
  nodes: LineageNode[];
  schools: SchoolWithPhilosophers[];
}) {
  // null = not yet mounted; neither view renders until we know the device
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary fallback={errorFallback}>
      {isMobile === null ? null : isMobile
        ? <NetworkMobileView nodes={nodes} schools={schools} />
        : <NetworkCanvas nodes={nodes} schools={schools} />
      }
    </ErrorBoundary>
  );
}
