import type { Metadata } from "next";
import "./globals.css";
import NavigationSidebar from "@/components/layout/NavigationSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | The Living Manuscript",
    default: "The Living Manuscript",
  },
  description:
    "A living map of Western philosophical thought — trace the lineage, ideas, and connections of history's greatest thinkers.",
  keywords: ["philosophy", "philosophers", "history of philosophy", "network", "lineage"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavigationSidebar />
        <main style={{ marginLeft: "80px", minHeight: "100vh" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
