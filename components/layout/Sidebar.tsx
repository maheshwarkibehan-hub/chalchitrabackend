"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  Flame,
  Folder,
  Gamepad2,
  HelpCircle,
  History,
  Home,
  Mic,
  Music2,
  Newspaper,
  PlayCircle,
  Settings,
  ThumbsUp,
  Trophy,
  Tv,
  Watch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import MiniSidebar from "@/components/layout/MiniSidebar";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const sections: NavItem[][] = [
  [
    { href: "/", label: "Home", icon: Home },
    { href: "/shorts", label: "Shorts", icon: Tv },
    { href: "/subscriptions", label: "Subscriptions", icon: PlayCircle },
  ],
  [
    { href: "/history", label: "History", icon: History },
    { href: "/playlist/local", label: "Playlists", icon: Folder },
    { href: "/watch-later", label: "Watch Later", icon: Watch },
    { href: "/liked", label: "Liked Videos", icon: ThumbsUp },
  ],
  [
    { href: "/trending", label: "Trending", icon: Flame },
    { href: "/music", label: "Music", icon: Music2 },
    { href: "/gaming", label: "Gaming", icon: Gamepad2 },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/sports", label: "Sports", icon: Trophy },
    { href: "/podcasts", label: "Podcasts", icon: Mic },
  ],
  [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help", icon: HelpCircle },
  ],
];

export default function Sidebar() {
  const pathname = usePathname();
  const expanded = useAppStore((state) => state.sidebarExpanded);

  const fullSidebar = useMemo(
    () => (
      <aside className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-56px)] w-[240px] overflow-y-auto border-r border-yt-border bg-yt-sidebar px-3 py-2 lg:block">
        <nav>
          {sections.map((items, sectionIndex) => (
            <div key={`section-${sectionIndex}`} className="mb-2 border-b border-yt-border pb-2 last:border-b-0">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "mb-1 flex h-10 items-center gap-4 rounded-xl px-3 text-sm transition",
                      active
                        ? "bg-[#0000000d] font-medium text-yt-textPrimary"
                        : "text-yt-textSecondary hover:bg-yt-hover hover:text-yt-textPrimary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    ),
    [pathname],
  );

  if (!expanded) {
    return <MiniSidebar />;
  }

  return fullSidebar;
}
