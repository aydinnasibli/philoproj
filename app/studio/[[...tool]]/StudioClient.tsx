"use client";

import dynamic from "next/dynamic";
import type { NextStudioProps } from "next-sanity/studio";
import config from "@/sanity.config";

const Studio = dynamic<NextStudioProps>(
  () => import("next-sanity/studio").then(m => ({ default: m.NextStudio })),
  { ssr: false }
);

export default function StudioClient() {
  return <Studio config={config} />;
}
