"use client";

import { useState, useTransition } from "react";
import { AnimatePresence } from "framer-motion";
import HeroOverlay from "./HeroOverlay";
import { markHeroSeen } from "@/app/actions/hero";

export default function HeroOverlayClient() {
  const [visible, setVisible] = useState(true);
  const [, startTransition] = useTransition();

  function handleEnter() {
    startTransition(async () => {
      await markHeroSeen();
    });
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && <HeroOverlay onEnter={handleEnter} />}
    </AnimatePresence>
  );
}
