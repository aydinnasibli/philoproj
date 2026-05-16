import type { Metadata } from "next";
import { Suspense } from "react";
import ArchiveData from "./ArchiveData";
import Loading from "./loading";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const DESCRIPTION =
  "A complete alphabetical directory of Western philosophical thinkers — from Thales to Wittgenstein.";

export const metadata: Metadata = {
  title: "Archive",
  description: DESCRIPTION,
  alternates: { canonical: "/philosophers" },
  openGraph: {
    title: "Archive",
    description: DESCRIPTION,
    type: "website",
    url: `${BASE}/archive`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive",
    description: DESCRIPTION,
  },
};

export default function ArchivePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ArchiveData />
    </Suspense>
  );
}
