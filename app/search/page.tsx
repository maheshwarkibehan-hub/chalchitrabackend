"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SearchResultsPanel from "@/components/search/SearchResultsPanel";
import CategoryChips from "@/components/ui/CategoryChips";
import type { ParsedChannel, ParsedPlaylistItem, ParsedVideo } from "@/lib/parser";
import { getDataSource } from "@/lib/runtime";

const FILTERS = ["All", "Video", "Channel", "Playlist", "Live"];

type SortMode = "relevance" | "views";

function dedupeById<T extends { videoId?: string; channelId?: string; playlistId?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];

  for (const item of items) {
    const key = item.videoId || item.channelId || item.playlistId;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function SearchPageContent() {
  const source = useMemo(() => getDataSource("auto"), []);
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() || "";

  const [videos, setVideos] = useState<ParsedVideo[]>([]);
  const [channels, setChannels] = useState<ParsedChannel[]>([]);
  const [playlists, setPlaylists] = useState<ParsedPlaylistItem[]>([]);
  const [continuation, setContinuation] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const queryRef = useRef(q);

  useEffect(() => {
    queryRef.current = q;
  }, [q]);

  const runSearch = useCallback(async (reset = false, query = q) => {
    if (!query) return;
    if (!reset && loading) return;

    const requestId = ++requestIdRef.current;
    const queryAtRequestStart = query;

    setLoading(true);

    try {
      const result = await source.search(queryAtRequestStart, reset ? undefined : continuation);

      if (requestId !== requestIdRef.current || queryAtRequestStart !== queryRef.current) {
        return;
      }

      setVideos((prev) => dedupeById(reset ? result.videos : [...prev, ...result.videos]));
      setChannels((prev) => dedupeById(reset ? result.channels : [...prev, ...result.channels]));
      setPlaylists((prev) => dedupeById(reset ? result.playlists : [...prev, ...result.playlists]));
      setContinuation(result.continuationToken);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [continuation, loading, q, source]);

  useEffect(() => {
    setContinuation(undefined);
    setVideos([]);
    setChannels([]);
    setPlaylists([]);
    if (!q) {
      setLoading(false);
      return;
    }

    runSearch(true, q);
    // runSearch intentionally depends on pagination/loading internals; query change should trigger reset only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && continuation && !loading) {
          runSearch();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // runSearch intentionally omitted to avoid observer churn on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuation, loading]);

  const visibleVideos = useMemo(() => {
    let list = videos;
    if (activeFilter === "Live") {
      list = list.filter((video) => video.isLive);
    }

    if (sortMode === "views") {
      list = [...list].sort((a, b) => Number(b.viewCountNumber || 0) - Number(a.viewCountNumber || 0));
    }

    return list;
  }, [activeFilter, sortMode, videos]);

  const showChannels = activeFilter === "All" || activeFilter === "Channel";
  const showPlaylists = activeFilter === "All" || activeFilter === "Playlist";
  const showVideos = activeFilter === "All" || activeFilter === "Video" || activeFilter === "Live";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium text-yt-textPrimary">
          Search results for <span className="text-yt-likeActive">{q || "..."}</span>
        </h1>
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-yt-border px-4 text-sm text-yt-textPrimary hover:bg-yt-hover"
        >
          {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
        </button>
      </div>

      <CategoryChips categories={FILTERS} active={activeFilter} onChange={setActiveFilter} />

      {showFilters && (
        <aside className="rounded-ytCard border border-yt-border bg-yt-elevated p-4">
          <p className="text-sm font-semibold text-yt-textPrimary">Sort by</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSortMode("relevance")}
              className={`rounded-full px-3 py-1.5 text-sm ${sortMode === "relevance" ? "bg-yt-chipSelected text-yt-textChipSelected" : "bg-yt-chip text-yt-textPrimary"}`}
            >
              Relevance
            </button>
            <button
              type="button"
              onClick={() => setSortMode("views")}
              className={`rounded-full px-3 py-1.5 text-sm ${sortMode === "views" ? "bg-yt-chipSelected text-yt-textChipSelected" : "bg-yt-chip text-yt-textPrimary"}`}
            >
              View count
            </button>
          </div>
        </aside>
      )}

      {loading && videos.length === 0 ? (
        <div className="rounded-ytCard border border-yt-border bg-yt-elevated px-4 py-6 text-sm text-yt-textSecondary">Loading results...</div>
      ) : (
        <SearchResultsPanel
          videos={showVideos ? visibleVideos : []}
          channels={showChannels ? channels : []}
          playlists={showPlaylists ? playlists : []}
          showChannels={showChannels}
          showPlaylists={showPlaylists}
        />
      )}

      <div ref={sentinelRef} className="h-16" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-24" />}>
      <SearchPageContent />
    </Suspense>
  );
}
