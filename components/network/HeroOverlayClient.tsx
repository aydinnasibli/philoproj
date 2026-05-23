"use client";

import { useState, useTransition } from "react";
import { AnimatePresence } from "framer-motion";
import HeroOverlay from "./HeroOverlay";
import { markHeroSeen } from "@/app/actions/hero";

export default function HeroOverlayClient() {
  const [visible, setVisible] = useState(true);
  const [, startTransition] = useTransition();

  function handleExitComplete() {
    startTransition(async () => {
      await markHeroSeen();
    });
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && <HeroOverlay onEnter={() => setVisible(false)} />}
    </AnimatePresence>
  );
}
