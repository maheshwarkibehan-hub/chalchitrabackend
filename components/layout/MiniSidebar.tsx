"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Settings,
  Trophy,
  Tv,
} from "lucide-react";

const miniItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shorts", label: "Shorts", icon: Tv },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/history", label: "History", icon: History },
  { href: "/playlist/local", label: "Playlists", icon: Folder },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/music", label: "Music", icon: Music2 },
  { href: "/gaming", label: "Gaming", icon: Gamepad2 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/sports", label: "Sports", icon: Trophy },
  { href: "/podcasts", label: "Podcasts", icon: Mic },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export default function MiniSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 hidden h-[calc(100vh-56px)] w-[72px] overflow-y-auto border-r border-yt-border bg-yt-sidebar py-2 lg:block">
      <nav className="space-y-1 px-2">
        {miniItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 flex-col items-center justify-center rounded-xl text-[10px] transition",
                active
                  ? "bg-[#0000000d] text-yt-textPrimary"
                  : "text-yt-textSecondary hover:bg-yt-hover hover:text-yt-textPrimary",
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
