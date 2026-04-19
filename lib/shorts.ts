import type { ParsedShort, ParsedVideo } from "@/lib/parser";
import { getBestThumbnail } from "@/lib/utils";

const SHORT_MAX_SECONDS = 70;

export function isLikelyShort(video: ParsedVideo): boolean {
  if (video.isLive) return false;
  if (video.isShort) return true;

  const seconds = Number(video.durationSeconds || 0);
  if (seconds > 0 && seconds <= SHORT_MAX_SECONDS) {
    return true;
  }

  const normalizedDuration = (video.duration || "").trim().toLowerCase();
  if (normalizedDuration === "shorts" || normalizedDuration === "short") {
    return true;
  }

  return seconds === 0 && /#shorts?\b/i.test(video.title || "");
}

export function mapVideoToShort(video: ParsedVideo): ParsedShort {
  return {
    videoId: video.videoId,
    title: video.title,
    thumbnail: getBestThumbnail(video.thumbnails),
    viewCount: video.viewCount,
    viewCountNumber: video.viewCountNumber,
    channelName: video.channelName,
  };
}

function dedupeShorts(shorts: ParsedShort[]): ParsedShort[] {
  const seen = new Set<string>();
  const out: ParsedShort[] = [];

  for (const short of shorts) {
    if (!short.videoId || !short.thumbnail || seen.has(short.videoId)) continue;
    seen.add(short.videoId);
    out.push(short);
  }

  return out;
}

export function collectShorts(feedShorts: ParsedShort[] | undefined, feedVideos: ParsedVideo[]): ParsedShort[] {
  const nativeShorts = (feedShorts || []).map((short) => ({
    ...short,
    thumbnail: short.thumbnail || "",
  }));

  const derivedShorts = feedVideos
    .filter(isLikelyShort)
    .map(mapVideoToShort);

  return dedupeShorts([...nativeShorts, ...derivedShorts]);
}

export function reorderShorts(shorts: ParsedShort[], firstVideoId?: string): ParsedShort[] {
  if (!firstVideoId) return shorts;

  const picked = shorts.find((item) => item.videoId === firstVideoId);
  if (!picked) return shorts;

  return [picked, ...shorts.filter((item) => item.videoId !== firstVideoId)];
}