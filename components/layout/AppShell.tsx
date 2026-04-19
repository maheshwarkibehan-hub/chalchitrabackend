"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MiniPlayer from "@/components/video/MiniPlayer";
import { useAppStore } from "@/lib/store";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const sidebarExpanded = useAppStore((state) => state.sidebarExpanded);
  const theme = useAppStore((state) => state.preferences.theme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setResolvedTheme(prefersDark ? "dark" : "light");
      return;
    }
    setResolvedTheme(theme);
  }, [theme]);

  return (
    <div data-theme={resolvedTheme} className="min-h-screen bg-yt-base text-yt-textPrimary">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-200 ${sidebarExpanded ? "lg:ml-[240px]" : "lg:ml-[72px]"}`}>
        <div className="mx-auto w-full max-w-[2200px] px-3 pb-10 pt-3 md:px-6">{children}</div>
      </main>
      <MiniPlayer />
    </div>
  );
}
