"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Bell, Menu, Moon, Settings, Sun, UserCircle2 } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { useAppStore } from "@/lib/store";

export default function Navbar() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const preferences = useAppStore((state) => state.preferences);
  const updatePreferences = useAppStore((state) => state.updatePreferences);

  const isDark = preferences.theme !== "light";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] h-14 border-b border-yt-border bg-yt-base px-2 md:px-4">
      <div className="mx-auto flex h-full max-w-[2200px] items-center justify-between gap-4">
        <div className="flex min-w-[132px] items-center gap-2 md:min-w-[160px] md:gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-yt-textPrimary hover:bg-yt-hover"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden>
              <rect width="28" height="20" rx="6" fill="#ff0000" />
              <path d="M11 6.5L18 10L11 13.5V6.5Z" fill="white" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-yt-textPrimary md:text-xl">YouTube</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-3xl min-w-0">
          <Suspense fallback={<div className="h-10 w-full rounded-full border border-yt-border bg-yt-input" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updatePreferences({ theme: isDark ? "light" : "dark" })}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-yt-textPrimary hover:bg-yt-hover sm:flex"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-yt-textPrimary hover:bg-yt-hover sm:flex"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full text-yt-textPrimary hover:bg-yt-hover"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5e5e5] text-[#555]">
            <UserCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
