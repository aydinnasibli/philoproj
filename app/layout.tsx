import type { Metadata } from "next";
import "./globals.css";
import NavigationSidebar from "@/components/layout/NavigationSidebar";
import TopNav from "@/components/layout/TopNav";

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
        <TopNav />
        <main
          style={{
            marginLeft: "80px",
            marginTop: 0,
            minHeight: "100vh",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
