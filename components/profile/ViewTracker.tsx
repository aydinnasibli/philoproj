"use client";

import { useEffect, useRef } from "react";
import { trackPhilosopherView } from "@/app/progress/actions";

export default function ViewTracker({ philosopherId, slug }: { philosopherId: string; slug: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackPhilosopherView(philosopherId, slug).catch(() => {});
  }, [philosopherId, slug]);

  return null;
}
