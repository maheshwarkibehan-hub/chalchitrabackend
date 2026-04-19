"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { ParsedVideo } from "@/lib/parser";

type PlaylistPanelProps = {
  title: string;
  videos: ParsedVideo[];
  activeVideoId?: string;
};

export default function PlaylistPanel({ title, videos, activeVideoId }: PlaylistPanelProps) {
  if (!videos.length) return null;

  return (
    <aside className="rounded-ytMenu border border-yt-border bg-yt-elevated p-3">
      <div className="mb-3">
        <h3 className="text-base font-medium text-yt-textPrimary">{title}</h3>
        <p className="text-xs text-yt-textSecondary">{videos.length} videos</p>
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto">
        {videos.map((video, index) => {
          const active = activeVideoId === video.videoId;
          return (
            <Link
              key={video.videoId}
              href={`/watch/${video.videoId}`}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 ${
                active ? "bg-yt-hover" : "hover:bg-yt-hover"
              }`}
            >
              <span className="w-6 text-center text-xs text-yt-textSecondary">{active ? <Play className="mx-auto h-3.5 w-3.5" /> : index + 1}</span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm text-yt-textPrimary">{video.title}</p>
                <p className="text-xs text-yt-textSecondary">{video.channelName}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
