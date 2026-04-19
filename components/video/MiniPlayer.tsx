"use client";

import Link from "next/link";
import Image from "next/image";
import { Pause, Play, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function MiniPlayer() {
  const miniPlayerActive = useAppStore((state) => state.miniPlayerActive);
  const setMiniPlayerActive = useAppStore((state) => state.setMiniPlayerActive);
  const currentlyPlaying = useAppStore((state) => state.currentlyPlaying);
  const updateCurrentlyPlaying = useAppStore((state) => state.updateCurrentlyPlaying);

  if (!miniPlayerActive || !currentlyPlaying.videoId) {
    return null;
  }

  const thumbnail = `https://i.ytimg.com/vi/${currentlyPlaying.videoId}/hqdefault.jpg`;

  return (
    <div className="fixed bottom-4 right-4 z-[110] w-[320px] overflow-hidden rounded-ytCard border border-yt-border bg-yt-elevated shadow-sm">
      <Link href={`/watch/${currentlyPlaying.videoId}`} className="relative block aspect-video bg-black">
        <Image src={thumbnail} alt="Mini player thumbnail" fill sizes="320px" className="object-cover" />
      </Link>

      <div className="flex items-center gap-2 border-t border-yt-border px-3 py-2">
        <Link href={`/watch/${currentlyPlaying.videoId}`} className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-yt-textPrimary">Playing video</p>
          <p className="truncate text-xs text-yt-textSecondary">Playback continues across pages</p>
        </Link>

        <button
          type="button"
          className="rounded-full p-2 text-yt-textPrimary hover:bg-yt-chip"
          onClick={() => updateCurrentlyPlaying({ isPlaying: !currentlyPlaying.isPlaying })}
          aria-label={currentlyPlaying.isPlaying ? "Pause" : "Play"}
        >
          {currentlyPlaying.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          type="button"
          className="rounded-full p-2 text-yt-textPrimary hover:bg-yt-chip"
          onClick={() => setMiniPlayerActive(false)}
          aria-label="Close mini player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
