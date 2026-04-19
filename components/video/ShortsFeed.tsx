"use client";

import { useEffect, useMemo, useState } from "react";
import ShortCard from "@/components/ui/ShortCard";
import type { ParsedShort } from "@/lib/parser";
import { collectShorts, reorderShorts } from "@/lib/shorts";
import { getDataSource } from "@/lib/runtime";
import type { VideoPlayerResult } from "@/lib/runtime/types";
import { getBestThumbnail } from "@/lib/utils";

type ShortsFeedProps = {
  initialVideoId?: string;
};

function buildFallbackShorts(videoId: string, player: VideoPlayerResult): ParsedShort {
  const thumbCandidates = (player.videoDetails.thumbnail || []).map((thumb) => thumb.url).filter(Boolean);

  return {
    videoId,
    title: player.videoDetails.title || "Short",
    thumbnail: getBestThumbnail(thumbCandidates) || `https://i.ytimg.com/vi/${videoId}/hq720.jpg`,
    viewCount: String(player.videoDetails.viewCount || ""),
    viewCountNumber: player.videoDetails.viewCount,
    channelName: player.videoDetails.author,
  };
}

export default function ShortsFeed({ initialVideoId }: ShortsFeedProps) {
  const source = useMemo(() => getDataSource("auto"), []);
  const [shorts, setShorts] = useState<ParsedShort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadShorts() {
      setLoading(true);

      try {
        const feed = await source.home();
        let items = collectShorts(feed.shorts, feed.videos);

        if (items.length < 10) {
          const fallback = await source.search("youtube shorts");
          items = collectShorts(items, fallback.videos);
        }

        if (initialVideoId && !items.some((item) => item.videoId === initialVideoId)) {
          try {
            const player = await source.player(initialVideoId);
            items = [buildFallbackShorts(initialVideoId, player), ...items];
          } catch {
            // Keep existing list when fallback player request fails.
          }
        }

        const ordered = reorderShorts(items, initialVideoId).slice(0, 24);
        if (!cancelled) {
          setShorts(ordered);
        }
      } catch {
        if (!cancelled) {
          setShorts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadShorts();

    return () => {
      cancelled = true;
    };
  }, [initialVideoId, source]);

  return (
    <div className="h-[calc(100dvh-72px)] snap-y snap-mandatory overflow-y-auto">
      {shorts.map((short) => (
        <ShortCard
          key={short.videoId}
          id={short.videoId}
          title={short.title}
          thumbnail={short.thumbnail}
          channelName={short.channelName || "channel"}
          likes={short.viewCountNumber || 0}
          comments={Math.floor((short.viewCountNumber || 0) / 40)}
        />
      ))}

      {loading && shorts.length === 0 && (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-yt-textSecondary">
          Shorts load ho rahe hain...
        </div>
      )}

      {!loading && shorts.length === 0 && (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-yt-textSecondary">
          Shorts abhi load nahi hue. Thoda wait karke page reload karo.
        </div>
      )}
    </div>
  );
}