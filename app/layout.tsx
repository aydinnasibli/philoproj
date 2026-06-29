import type { Metadata, Viewport } from "next";
import {
  EB_Garamond,
  Cinzel,
} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense, ViewTransition } from "react";
import NavigationSidebar from "@/components/layout/NavigationSidebar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "optional",
  variable: "--font-eb-garamond",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "optional",
  variable: "--font-cinzel",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFBF9" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1714" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ebGaramond.variable} ${cinzel.variable}`}
    >
      <body>
        <ClerkProvider telemetry={{ disabled: true }}>
          <Providers initialTheme="light">
            <Suspense fallback={<div className="fixed inset-y-0 left-0 w-20" />}>
              <NavigationSidebar />
            </Suspense>
            <main className="md:ml-20 pt-13 md:pt-0 pb-16 md:pb-0 min-h-screen">
              <ViewTransition name="page-content">
                {children}
              </ViewTransition>
            </main>
            <Analytics />
            <SpeedInsights />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
