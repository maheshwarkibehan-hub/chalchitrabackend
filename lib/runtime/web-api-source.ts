import type { AppDataSource, CommentsResult, HomeResult, NextDataResult, PlaylistResult, SearchResult, TrendingResult, VideoPlayerResult } from "@/lib/runtime/types";
import type { ParsedChannelPage, ParsedChapter } from "@/lib/parser";
import type { SponsorSegment } from "@/lib/sponsorblock";
import { getSponsorSegments } from "@/lib/sponsorblock";
import { getReturnYouTubeDislike, type ReturnYouTubeDislikeResponse } from "@/lib/returnyoutubedislike";

async function fetchJson<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API request failed: ${path} (${response.status}) ${detail.slice(0, 120)}`);
  }
  return response.json() as Promise<T>;
}

export const webApiSource: AppDataSource = {
  async search(query, continuationToken) {
    return fetchJson<SearchResult>("/api/search", {
      query,
      continuation: continuationToken,
    });
  },

  async player(videoId) {
    return fetchJson<VideoPlayerResult>("/api/player", { videoId });
  },

  async next(videoId) {
    const [related, chapters] = await Promise.all([
      fetchJson<{ relatedVideos: NextDataResult["relatedVideos"] }>("/api/related", { videoId }),
      fetchJson<{ chapters: ParsedChapter[] }>("/api/chapters", { videoId }),
    ]);

    return {
      relatedVideos: related.relatedVideos,
      chapters: chapters.chapters,
      comments: [],
      commentsContinuationToken: undefined,
    };
  },

  async home(continuationToken, params) {
    return fetchJson<HomeResult>("/api/home", {
      continuation: continuationToken,
      params,
    });
  },

  async trending(params) {
    return fetchJson<TrendingResult>("/api/trending", { params });
  },

  async channel(channelId, params) {
    return fetchJson<ParsedChannelPage>("/api/channel", { channelId, params });
  },

  async playlist(playlistId, continuationToken) {
    return fetchJson<PlaylistResult>("/api/playlist", {
      playlistId,
      continuation: continuationToken,
    });
  },

  async comments(videoId, continuationToken) {
    return fetchJson<CommentsResult>("/api/comments", {
      videoId,
      continuation: continuationToken,
    });
  },

  async transcript(videoId, params) {
    const result = await fetchJson<{ transcript: Array<{ startMs: number; text: string }> }>("/api/transcript", {
      videoId,
      params,
    });
    return result.transcript;
  },

  async suggestions(query) {
    const result = await fetchJson<{ suggestions: string[] }>("/api/suggestions", { q: query });
    return result.suggestions;
  },

  async chapters(videoId) {
    const result = await fetchJson<{ chapters: ParsedChapter[] }>("/api/chapters", { videoId });
    return result.chapters;
  },

  async liveChatReplay(videoId, continuation) {
    return {
      actions: [],
      continuation,
      videoId,
    };
  },

  async sponsorSegments(videoId): Promise<SponsorSegment[]> {
    return getSponsorSegments(videoId);
  },

  async dislikeVotes(videoId): Promise<ReturnYouTubeDislikeResponse | null> {
    return getReturnYouTubeDislike(videoId);
  },
};
