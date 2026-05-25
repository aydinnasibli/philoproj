"use client";

import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { ComponentProps } from "react";
import type LineageCanvas from "./LineageCanvas";

// Both loaded dynamically so neither bundle downloads on the wrong device
const LineageCanvasInner = dynamic(() => import("./LineageCanvas"),        { ssr: false });
const LineageMobileView  = dynamic(() => import("./LineageMobileView"),    { ssr: false });

type Props = ComponentProps<typeof LineageCanvas>;

const errorFallback = (
  <div className="flex items-center justify-center h-screen font-serif italic text-slate-500 dark:text-stone-400">
    The lineage couldn&rsquo;t be loaded.
  </div>
);

export default function LineageCanvasErrorBoundary(props: Props) {
  // null = not yet mounted; avoid loading either bundle until we know the device
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary fallback={errorFallback}>
      {isMobile === null ? null : isMobile
        ? <LineageMobileView schools={props.schools} />
        : <LineageCanvasInner {...props} />
      }
    </ErrorBoundary>
  );
}
