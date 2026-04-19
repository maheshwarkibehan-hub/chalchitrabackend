"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryChips from "@/components/ui/CategoryChips";
import ShortsShelf from "@/components/video/ShortsShelf";
import VideoGrid from "@/components/video/VideoGrid";
import type { ParsedShort, ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";
import { collectShorts, isLikelyShort } from "@/lib/shorts";

function dedupeById<T extends { videoId: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!item.videoId || seen.has(item.videoId)) continue;
    seen.add(item.videoId);
    out.push(item);
  }
  return out;
}

const HOME_CATEGORIES = [
  "All",
  "Music",
  "Gaming",
  "News",
  "Live",
  "Mixes",
  "Computer programming",
  "Recently uploaded",
  "Watched",
  "New to you",
  "Podcasts",
  "Sports",
  "Fashion",
  "Cooking",
  "Hindi",
  "Bollywood",
];

const categoryParams: Record<string, string | undefined> = {
  All: undefined,
  Music: "4gINGgt5dG1hX2NoYXJ0cw%3D%3D",
  Gaming: "4gIcGhpnZW5yZV9nYW1pbmdfdmlkZW9z",
  News: "4gINGgt5dG1hX25ld3M%3D",
};

export default function HomePage() {
  const source = useMemo(() => getDataSource("auto"), []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState<ParsedVideo[]>([]);
  const [shorts, setShorts] = useState<ParsedShort[]>([]);
  const [continuation, setContinuation] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadFeed = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await source.home(
        reset ? undefined : continuation,
        categoryParams[activeCategory],
      );

      const longVideos = response.videos.filter((video) => !isLikelyShort(video));
      const incomingShorts = collectShorts(response.shorts, response.videos);

      setVideos((prev) => dedupeById(reset ? longVideos : [...prev, ...longVideos]));
      setShorts((prev) => dedupeById(reset ? incomingShorts : [...prev, ...incomingShorts]).slice(0, 18));
      setContinuation(response.continuationToken);
    } catch {
      // Prevent infinite retry loop on invalid continuation token.
      if (!reset) {
        setContinuation(undefined);
      }
      setError("Feed load nahi hua. Network check karke retry karo.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, continuation, loading, source]);

  useEffect(() => {
    setContinuation(undefined);
    setShorts([]);
    loadFeed(true);
    // loadFeed intentionally depends on pagination/loading internals; category change should trigger reset only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && continuation && !loading) {
          loadFeed();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // loadFeed intentionally omitted to avoid re-creating observer on each state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuation, loading]);

  return (
    <div className="space-y-4">
      <CategoryChips categories={HOME_CATEGORIES} active={activeCategory} onChange={setActiveCategory} />
      {error && (
        <div className="rounded-ytCard border border-yt-border bg-yt-elevated px-4 py-3 text-sm text-yt-textSecondary">
          {error}
        </div>
      )}
      <ShortsShelf shorts={shorts} />
      <VideoGrid videos={videos} loading={loading} />
      <div ref={sentinelRef} className="h-16" />
    </div>
  );
}
