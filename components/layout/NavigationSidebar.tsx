"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
      <line x1="9" y1="3" x2="9" y2="18"></line>
      <line x1="15" y1="6" x2="15" y2="21"></line>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

export default function NavigationSidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "80px",
        backgroundColor: "var(--surface)", 
        borderRight: "1px solid var(--border-pale)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "24px",
        paddingBottom: "24px",
        zIndex: 50,
      }}
    >
      {/* Top Profile Avatar */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--ink)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "auto",
          overflow: "hidden",
          border: "2px solid #D6D2C4"
        }}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Socrates_Louvre.jpg/440px-Socrates_Louvre.jpg" alt="User" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8, filter: "grayscale(100%)" }} />
      </div>

      {/* Main Nav Icons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "40px" }}>
        {/* Dummy Activity */}
        <div style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)", cursor: "pointer" }}>
          <ActivityIcon />
        </div>

        {/* Network Toggle / Home */}
        <Link href="/">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: pathname === "/" ? "var(--ink)" : "transparent",
            color: pathname === "/" ? "var(--canvas)" : "var(--ink-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <NetworkIcon />
          </div>
        </Link>

        {/* Lineage */}
        <Link href="/lineage">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: pathname.startsWith("/lineage") ? "var(--ink)" : "transparent",
            color: pathname.startsWith("/lineage") ? "var(--canvas)" : "var(--ink-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <MapIcon />
          </div>
        </Link>
        
        {/* Archive */}
        <Link href="/archive">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: pathname.startsWith("/archive") ? "var(--ink)" : "transparent",
            color: pathname.startsWith("/archive") ? "var(--canvas)" : "var(--ink-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <BookIcon />
          </div>
        </Link>
      </div>

      {/* Bottom Icons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "auto", alignItems: "center" }}>
        {/* Theme Color Block */}
        <div style={{
          width: "24px",
          height: "24px",
          backgroundColor: "#8C6A2E", // Brown accent from mock
          borderRadius: "6px",
          cursor: "pointer"
        }} />
        
        {/* Help */}
        <div style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.1)",
         color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          cursor: "pointer"
        }}>
          ?
        </div>
      </div>
    </nav>
  );
}
