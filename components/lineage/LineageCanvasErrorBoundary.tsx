"use client";

import { ErrorBoundary } from "react-error-boundary";
import LineageCanvas from "./LineageCanvas";
import type { ComponentProps } from "react";

export default function LineageCanvasErrorBoundary(props: ComponentProps<typeof LineageCanvas>) {
  return (
    <ErrorBoundary fallback={<div className="flex items-center justify-center h-screen">Failed to load canvas.</div>}>
      <LineageCanvas {...props} />
    </ErrorBoundary>
  );
}
