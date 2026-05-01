import dynamic from "next/dynamic";
import config from "@/sanity.config";
import type { NextStudioProps } from "next-sanity/studio";

const Studio = dynamic<NextStudioProps>(
  () => import("next-sanity/studio").then(m => ({ default: m.NextStudio })),
  { ssr: false }
);

export default function StudioPage() {
  return <Studio config={config} />;
}
