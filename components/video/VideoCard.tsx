"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, ListPlus, MoreVertical } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ParsedVideo } from "@/lib/parser";
import { formatDuration, formatRelativeDate, formatViewCount, getBestThumbnail } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

type VideoCardProps = {
  video: ParsedVideo;
  showChannelAvatar?: boolean;
};

const menuItems = [
  "Add to queue",
  "Save to playlist",
  "Save to Watch Later",
  "Download",
  "Share",
  "Not interested",
];

export default function VideoCard({ video, showChannelAvatar = true }: VideoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const history = useAppStore((state) => state.watchHistory);

  const watchedProgress = useMemo(() => {
    const entry = history.find((item) => item.videoId === video.videoId);
    return entry?.progressPercent ?? 0;
  }, [history, video.videoId]);

  const thumb = getBestThumbnail(video.thumbnails) || "https://i.ytimg.com/vi/aqz-KE-bpKQ/hq720.jpg";
  const avatar = video.channelAvatar || "https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj";

  return (
    <article className="group">
      {/* Thumbnail */}
      <Link href={`/watch/${video.videoId}`} className="relative block overflow-hidden rounded-xl">
        <div className="relative aspect-video bg-yt-hover">
          <Image
            src={thumb}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            quality={85}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/5" />

          {/* Duration badge */}
          {video.isLive ? (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-[4px] bg-red-600 px-1.5 py-0.5 text-[12px] font-medium leading-none text-white">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              LIVE
            </span>
          ) : (
            <span className="absolute bottom-2 right-2 rounded-[4px] bg-black/80 px-1 py-[2px] text-[12px] font-medium leading-none text-white">
              {video.duration || formatDuration(video.durationSeconds)}
            </span>
          )}

          {/* Watch progress bar */}
          {watchedProgress > 0 && (
            <div className="absolute bottom-0 left-0 h-[3px] bg-yt-accent" style={{ width: `${Math.min(100, watchedProgress)}%` }} />
          )}

          {/* Hover action buttons on thumbnail */}
          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              title="Watch Later"
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              title="Add to queue"
            >
              <ListPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>

      {/* Metadata */}
      <div className="mt-3 flex gap-3">
        {showChannelAvatar && (
          <Link href={`/channel/${video.channelId}`} className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image src={avatar} alt={video.channelName} fill sizes="36px" className="object-cover" />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <Link href={`/watch/${video.videoId}`} className="line-clamp-2 flex-1 text-sm font-medium leading-[20px] text-yt-textPrimary">
              {video.title}
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-yt-textSecondary opacity-0 transition-opacity hover:bg-yt-hover group-hover:opacity-100"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-7 z-10 min-w-48 rounded-xl border border-yt-border bg-yt-elevated py-2 shadow-lg">
                  {menuItems.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="block w-full px-4 py-2 text-left text-sm text-yt-textPrimary hover:bg-yt-hover"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link href={`/channel/${video.channelId}`} className="mt-0.5 block text-[13px] leading-[18px] text-yt-textSecondary hover:text-yt-textPrimary">
            {video.channelName}
          </Link>
          <p className="text-[13px] leading-[18px] text-yt-textSecondary">
            {video.viewCount ? formatViewCount(video.viewCountNumber || video.viewCount) : "0 views"} •{" "}
            {video.publishedTime || formatRelativeDate(new Date())}
          </p>
        </div>
      </div>
    </article>
  );
}
