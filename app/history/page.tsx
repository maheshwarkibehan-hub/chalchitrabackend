"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatRelativeDate } from "@/lib/utils";

export default function HistoryPage() {
  const watchHistory = useAppStore((state) => state.watchHistory);
  const searchHistory = useAppStore((state) => state.searchHistory);
  const clearWatchHistory = useAppStore((state) => state.clearWatchHistory);
  const clearSearchHistory = useAppStore((state) => state.clearSearchHistory);
  const removeWatchHistoryItem = useAppStore((state) => state.removeWatchHistoryItem);
  const preferences = useAppStore((state) => state.preferences);
  const updatePreferences = useAppStore((state) => state.updatePreferences);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-medium">Watch History</h1>
          <button
            type="button"
            onClick={clearWatchHistory}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-4 text-sm hover:bg-yt-hover"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </div>

        <div className="space-y-3">
          {watchHistory.map((video) => (
            <article key={video.videoId} className="rounded-lg border border-yt-border bg-yt-base p-3">
              <Link href={`/watch/${video.videoId}`} className="line-clamp-1 text-sm font-medium text-yt-textPrimary hover:underline">
                {video.title}
              </Link>
              <p className="text-xs text-yt-textSecondary">{video.channelName}</p>
              <p className="mt-1 text-xs text-yt-textSecondary">Watched {formatRelativeDate(video.watchedAt)}</p>
              <div className="mt-2 h-1 rounded-full bg-zinc-700">
                <div className="h-full rounded-full bg-yt-accent" style={{ width: `${video.progressPercent}%` }} />
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-yt-likeActive hover:underline"
                onClick={() => removeWatchHistoryItem(video.videoId)}
              >
                Remove
              </button>
            </article>
          ))}

          {watchHistory.length === 0 && <p className="text-sm text-yt-textSecondary">No watch history yet.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
          <h2 className="mb-2 text-base font-medium">Search History</h2>
          <div className="space-y-2">
            {searchHistory.map((item) => (
              <p key={item} className="rounded bg-yt-chip px-3 py-2 text-sm text-yt-textPrimary">
                {item}
              </p>
            ))}
            {searchHistory.length === 0 && <p className="text-sm text-yt-textSecondary">No recent searches.</p>}
          </div>
          <button
            type="button"
            onClick={clearSearchHistory}
            className="mt-3 text-sm text-yt-likeActive hover:underline"
          >
            Clear search history
          </button>
        </div>

        <div className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
          <h2 className="mb-2 text-base font-medium">History controls</h2>
          <label className="flex items-center justify-between text-sm">
            <span className="text-yt-textPrimary">Pause watch history</span>
            <input
              type="checkbox"
              checked={preferences.pauseWatchHistory}
              onChange={(event) => updatePreferences({ pauseWatchHistory: event.target.checked })}
              className="h-4 w-4 accent-yt-accent"
            />
          </label>
        </div>
      </section>
    </div>
  );
}
