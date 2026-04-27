"use client";

import { useState, useEffect } from "react";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import HeroOverlay from "@/components/network/HeroOverlay";
import { AnimatePresence } from "framer-motion";
import type { LineageNode } from "@/lib/types";

const HERO_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const HERO_STORAGE_KEY = "manuscript_hero_last_seen";

export default function HomeClient({ nodes }: { nodes: LineageNode[] }) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (!raw) {
      setHeroVisible(true);
      return;
    }
    const lastSeen = parseInt(raw, 10);
    if (Date.now() - lastSeen > HERO_COOLDOWN_MS) {
      setHeroVisible(true);
    }
  }, []);

  function handleEnter() {
    localStorage.setItem(HERO_STORAGE_KEY, String(Date.now()));
    setHeroVisible(false);
  }

  return (
    <>
      <NetworkCanvas nodes={nodes} />
      <AnimatePresence>
        {heroVisible && <HeroOverlay onEnter={handleEnter} />}
      </AnimatePresence>
    </>
  );
}
