"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useMemo, useState } from "react";
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
  const history = useAppStore((state) => state.watchHistory);

  const watchedProgress = useMemo(() => {
    const entry = history.find((item) => item.videoId === video.videoId);
    return entry?.progressPercent ?? 0;
  }, [history, video.videoId]);

  const thumb = getBestThumbnail(video.thumbnails) || "https://i.ytimg.com/vi/aqz-KE-bpKQ/hq720.jpg";
  const avatar = video.channelAvatar || "https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj";

  return (
    <article className="group space-y-3">
      <Link href={`/watch/${video.videoId}`} className="relative block overflow-hidden rounded-ytCard">
        <div className="relative aspect-video">
          <Image src={thumb} alt={video.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" quality={88} className="object-cover" />

          {video.isLive ? (
            <span className="absolute bottom-2 right-2 rounded bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white">LIVE</span>
          ) : (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] text-white">
              {video.duration || formatDuration(video.durationSeconds)}
            </span>
          )}

          {watchedProgress > 0 && (
            <div className="absolute bottom-0 left-0 h-[3px] bg-yt-accent" style={{ width: `${Math.min(100, watchedProgress)}%` }} />
          )}

          <button
            type="button"
            className="absolute right-2 top-2 hidden rounded-full bg-white/85 p-1.5 text-yt-textPrimary shadow-sm group-hover:block"
            onClick={(event) => {
              event.preventDefault();
              setMenuOpen((prev) => !prev);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-2 top-10 z-10 min-w-44 rounded-ytMenu border border-yt-border bg-yt-elevated py-2 shadow-sm">
              {menuItems.map((item) => (
                <button
                  type="button"
                  key={item}
                  className="block w-full px-3 py-2 text-left text-sm text-yt-textPrimary hover:bg-yt-hover"
                  onClick={(event) => {
                    event.preventDefault();
                    setMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="flex gap-3">
        {showChannelAvatar && (
          <Link href={`/channel/${video.channelId}`} className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image src={avatar} alt={video.channelName} fill sizes="36px" className="object-cover" />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.videoId}`} className="line-clamp-2 text-[14px] font-medium leading-5 text-yt-textPrimary">
            {video.title}
          </Link>
          <Link href={`/channel/${video.channelId}`} className="mt-1 block text-[13px] text-yt-textSecondary hover:text-yt-textPrimary">
            {video.channelName}
          </Link>
          <p className="text-[13px] text-yt-textSecondary">
            {video.viewCount ? formatViewCount(video.viewCountNumber || video.viewCount) : "0 views"} •{" "}
            {video.publishedTime || formatRelativeDate(new Date())}
          </p>
        </div>
      </div>
    </article>
  );
}
