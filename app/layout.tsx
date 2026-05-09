import type { Metadata } from "next";
import { Suspense } from "react";
import {
  EB_Garamond,
  Playfair_Display,
  Inter,
  Cinzel,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavigationSidebar from "@/components/layout/NavigationSidebar";
import { SanityLive } from "@/lib/sanity/live";
import { Analytics } from "@vercel/analytics/next";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-eb-garamond",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-cinzel",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | The Living Manuscript",
    default: "The Living Manuscript",
  },
  description:
    "A living map of Western philosophical thought — trace the lineage, ideas, and connections of history's greatest thinkers.",
  keywords: ["philosophy", "philosophers", "history of philosophy", "network", "lineage"],
  openGraph: {
    type: "website",
    siteName: "The Living Manuscript",
    title: "The Living Manuscript",
    description:
      "A living map of Western philosophical thought — trace the lineage, ideas, and connections of history's greatest thinkers.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Manuscript",
    description:
      "A living map of Western philosophical thought — trace the lineage, ideas, and connections of history's greatest thinkers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${ebGaramond.variable} ${playfair.variable} ${inter.variable} ${cinzel.variable} ${cormorant.variable}`}
      >
        <body>
          <Suspense fallback={null}>
            <NavigationSidebar />
          </Suspense>
          <main className="ml-[80px] min-h-screen">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <SanityLive />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
