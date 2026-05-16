"use client";

import { useSyncExternalStore } from "react";
import { ErrorBoundary } from "react-error-boundary";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import HeroOverlay from "@/components/network/HeroOverlay";
import { AnimatePresence } from "framer-motion";
import type { LineageNode } from "@/lib/types";

const HERO_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const HERO_STORAGE_KEY = "manuscript_hero_last_seen";

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function heroSnapshot(): boolean {
  const raw = localStorage.getItem(HERO_STORAGE_KEY);
  if (!raw) return true;
  return Date.now() - parseInt(raw, 10) > HERO_COOLDOWN_MS;
}

export default function HomeClient({ nodes }: { nodes: LineageNode[] }) {
  const heroVisible = useSyncExternalStore(subscribeStorage, heroSnapshot, () => false);

  function handleEnter() {
    localStorage.setItem(HERO_STORAGE_KEY, String(Date.now()));
    window.dispatchEvent(new StorageEvent("storage", { key: HERO_STORAGE_KEY }));
  }

  return (
    <>
      <ErrorBoundary fallback={<div className="flex items-center justify-center h-screen">Failed to load canvas.</div>}>
        <NetworkCanvas nodes={nodes} />
      </ErrorBoundary>
      <AnimatePresence>
        {heroVisible && <HeroOverlay onEnter={handleEnter} />}
      </AnimatePresence>
    </>
  );
}
