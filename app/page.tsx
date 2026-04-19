"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryChips from "@/components/ui/CategoryChips";
import ShortsShelf from "@/components/video/ShortsShelf";
import VideoGrid from "@/components/video/VideoGrid";
import type { ParsedShort, ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";
import { collectShorts, isLikelyShort } from "@/lib/shorts";
import { useAppStore } from "@/lib/store";

function getTopUserInterest(): string | null {
  const history = useAppStore.getState().watchHistory;
  if (!history || history.length === 0) return null;

  const keywordCounts: Record<string, number> = {};
  // Analyze last 50 videos
  const recentHistory = history.slice(0, 50);

  for (const video of recentHistory) {
    if (video.keywords && Array.isArray(video.keywords)) {
      for (const kw of video.keywords) {
        const normalized = kw.toLowerCase().trim();
        if (normalized) {
          keywordCounts[normalized] = (keywordCounts[normalized] || 0) + 1;
        }
      }
    }
  }

  // Find the keyword with the highest count
  let topKeyword: string | null = null;
  let maxCount = 0;

  for (const [kw, count] of Object.entries(keywordCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topKeyword = kw;
    }
  }

  // Only consider it an interest if it appears at least twice
  return maxCount > 1 ? topKeyword : null;
}

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
  "Live",
  "News",
  "Mixes",
  "Lo-fi",
  "Comedy",
  "Recently uploaded",
  "Watched",
  "New to you",
  "Podcasts",
  "Cooking",
  "Sports",
  "Nature",
  "Coding",
];

const categoryParams: Record<string, string | undefined> = {
  All: undefined,
  Music: "4gINGgt5dG1hX2NoYXJ0cw%3D%3D",
  Gaming: "4gIcGhpnZW5yZV9nYW1pbmdfdmlkZW9z",
  News: "4gINGgt5dG1hX25ld3M%3D",
  Live: "EgJAAQ%3D%3D",
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
  const requestIdRef = useRef(0);
  const activeCategoryRef = useRef(activeCategory);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const loadFeed = useCallback(async (reset = false) => {
    if (!reset && loading) return;

    const requestId = ++requestIdRef.current;
    const categoryAtRequestStart = activeCategoryRef.current;

    setLoading(true);
    setError(null);

    try {
      const [homeResponse, searchResponse] = await Promise.all([
        source.home(
          reset ? undefined : continuation,
          categoryParams[categoryAtRequestStart],
        ),
        // If it's the initial load of "All", fetch personalized recommendations
        reset && categoryAtRequestStart === "All" && getTopUserInterest()
          ? source.search(getTopUserInterest() as string).catch(() => null)
          : Promise.resolve(null)
      ]);

      if (requestId !== requestIdRef.current || categoryAtRequestStart !== activeCategoryRef.current) {
        return;
      }

      let longVideos = homeResponse.videos.filter((video) => !isLikelyShort(video));
      
      // Inject personalized recommendations at the top
      if (searchResponse && searchResponse.videos) {
        const recommendedVideos = searchResponse.videos.filter((video) => !isLikelyShort(video)).slice(0, 4);
        longVideos = [...recommendedVideos, ...longVideos];
      }

      const incomingShorts = collectShorts(homeResponse.shorts, homeResponse.videos);

      setVideos((prev) => dedupeById(reset ? longVideos : [...prev, ...longVideos]));
      setShorts((prev) => dedupeById(reset ? incomingShorts : [...prev, ...incomingShorts]).slice(0, 18));
      setContinuation(homeResponse.continuationToken);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      // Prevent infinite retry loop on invalid continuation token.
      if (!reset) {
        setContinuation(undefined);
      }
      setError("Feed load nahi hua. Network check karke retry karo.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [continuation, loading, source]);

  useEffect(() => {
    setContinuation(undefined);
    setVideos([]);
    setShorts([]);
    setError(null);
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
    <div>
      {/* Sticky category chips bar — sticks below navbar on scroll */}
      <div className="sticky top-14 z-30 -mx-3 bg-yt-base px-3 pb-3 pt-1 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 2xl:-mx-12 2xl:px-12">
        <CategoryChips categories={HOME_CATEGORIES} active={activeCategory} onChange={setActiveCategory} />
        {/* Bottom fade gradient */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-yt-base/80 to-transparent" />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-yt-border bg-yt-elevated px-4 py-3 text-sm text-yt-textSecondary">
          {error}
        </div>
      )}

      {/* Shorts shelf */}
      <div className="mt-4">
        <ShortsShelf shorts={shorts} />
      </div>

      {/* Video grid */}
      <div className="mt-6">
        <VideoGrid videos={videos} loading={loading} />
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-16" />
    </div>
  );
}
