"use client";

import { useState, useEffect } from "react";
import { getLineageNodes } from "@/lib/mockData";
import NetworkCanvas from "@/components/lineage/NetworkCanvas";
import HeroOverlay from "@/components/home/HeroOverlay";
import { AnimatePresence } from "framer-motion";

const HERO_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const HERO_STORAGE_KEY = "manuscript_hero_last_seen";

export default function HomePage() {
  const nodes = getLineageNodes();
  const [heroVisible, setHeroVisible] = useState(false); // start hidden, check on mount

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
    // else: within 7 days — skip hero, go straight to canvas
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
