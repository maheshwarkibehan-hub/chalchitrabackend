"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

export default function MiniPlayer() {
  const miniPlayerActive = useAppStore((state) => state.miniPlayerActive);
  const setMiniPlayerActive = useAppStore((state) => state.setMiniPlayerActive);
  const currentlyPlaying = useAppStore((state) => state.currentlyPlaying);
  const updateCurrentlyPlaying = useAppStore((state) => state.updateCurrentlyPlaying);
  const playerRef = useRef<HTMLVideoElement>(null);
  const lastTimeSyncRef = useRef(0);
  const [duration, setDuration] = useState(currentlyPlaying.duration || 0);

  const videoId = currentlyPlaying.videoId;
  const streamUrl = currentlyPlaying.streamUrl;
  const poster = currentlyPlaying.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");

  useEffect(() => {
    const element = playerRef.current;
    if (!element || !miniPlayerActive || !videoId || !streamUrl) return;

    const snapshot = useAppStore.getState().currentlyPlaying;
    const applyState = () => {
      const resumeTime = Math.max(0, snapshot.currentTime || 0);
      if (resumeTime > 0) {
        element.currentTime = Math.min(resumeTime, element.duration || resumeTime);
      }

      element.volume = snapshot.volume;
      element.muted = snapshot.isMuted;
      element.playbackRate = snapshot.playbackRate;
      setDuration(element.duration || snapshot.duration || 0);

      if (snapshot.isPlaying) {
        element.play().catch(() => {
          updateCurrentlyPlaying({ isPlaying: false });
        });
      }
    };

    if (element.src !== streamUrl) {
      element.src = streamUrl;
      element.load();
    }

    if (element.readyState >= 1) {
      applyState();
    } else {
      element.addEventListener("loadedmetadata", applyState);
      return () => element.removeEventListener("loadedmetadata", applyState);
    }
  }, [miniPlayerActive, streamUrl, updateCurrentlyPlaying, videoId]);

  useEffect(() => {
    const element = playerRef.current;
    if (!element || !miniPlayerActive || !videoId || !streamUrl) return;

    const onPlay = () => updateCurrentlyPlaying({ isPlaying: true });
    const onPause = () =>
      updateCurrentlyPlaying({
        isPlaying: false,
        currentTime: element.currentTime || 0,
      });
    const onLoadedMetadata = () => {
      setDuration(element.duration || currentlyPlaying.duration || 0);
    };
    const onTimeUpdate = () => {
      const now = Date.now();
      const currentTime = element.currentTime || 0;
      const nextDuration = element.duration || currentlyPlaying.duration || 0;
      setDuration(nextDuration);

      if (now - lastTimeSyncRef.current < 400) return;
      lastTimeSyncRef.current = now;
      updateCurrentlyPlaying({
        currentTime,
        duration: nextDuration,
      });
    };

    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onPause);
    element.addEventListener("loadedmetadata", onLoadedMetadata);
    element.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("loadedmetadata", onLoadedMetadata);
      element.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [currentlyPlaying.duration, miniPlayerActive, streamUrl, updateCurrentlyPlaying, videoId]);

  if (!miniPlayerActive || !videoId || !streamUrl) {
    return null;
  }

  const totalDuration = duration || currentlyPlaying.duration || 0;

  function togglePlayPause() {
    const element = playerRef.current;
    if (!element) return;

    if (element.paused) {
      element.play().catch(() => {
        updateCurrentlyPlaying({ isPlaying: false });
      });
      return;
    }

    element.pause();
  }

  function closeMiniPlayer() {
    const element = playerRef.current;
    if (element) {
      element.pause();
      updateCurrentlyPlaying({
        isPlaying: false,
        currentTime: element.currentTime || currentlyPlaying.currentTime,
        duration: element.duration || totalDuration,
      });
    }
    setMiniPlayerActive(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[110] w-[320px] overflow-hidden rounded-ytCard border border-yt-border bg-yt-elevated shadow-sm">
      <div className="relative aspect-video bg-black">
        <video
          ref={playerRef}
          className="h-full w-full"
          poster={poster}
          preload="metadata"
          playsInline
          onClick={togglePlayPause}
        />
      </div>

      <div className="flex items-center gap-2 border-t border-yt-border px-3 py-2">
        <Link href={`/watch/${videoId}`} className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-yt-textPrimary">{currentlyPlaying.title || "Playing video"}</p>
          <p className="truncate text-xs text-yt-textSecondary">
            {formatDuration(Math.floor(currentlyPlaying.currentTime || 0))} / {formatDuration(Math.floor(totalDuration))}
          </p>
        </Link>

        <button
          type="button"
          className="rounded-full p-2 text-yt-textPrimary hover:bg-yt-chip"
          onClick={togglePlayPause}
          aria-label={currentlyPlaying.isPlaying ? "Pause" : "Play"}
        >
          {currentlyPlaying.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          type="button"
          className="rounded-full p-2 text-yt-textPrimary hover:bg-yt-chip"
          onClick={closeMiniPlayer}
          aria-label="Close mini player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
