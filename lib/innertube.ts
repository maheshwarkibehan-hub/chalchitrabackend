/* eslint-disable @typescript-eslint/no-explicit-any */

import { decipherStreamUrl } from "@/lib/decipher";
import {
  parseChannelPageResponse,
  parseCommentsResponse,
  parseHomeFeedResponse,
  parsePlaylistResponse,
  parseRelatedVideosFromNext,
  parseSearchResponse,
  parseTranscriptResponse,
  parseTrendingResponse,
  parseChaptersFromNext,
} from "@/lib/parser";

const INNERTUBE_BASE_URL = "https://www.youtube.com/youtubei/v1";
const INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

const WEB_CLIENT_CONTEXT = {
  client: {
    clientName: "WEB",
    clientVersion: "2.20240101.00.00",
    hl: "en",
    gl: "IN",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    clientFormFactor: "UNKNOWN_FORM_FACTOR",
  },
};

const ANDROID_CLIENT_CONTEXT = {
  client: {
    clientName: "ANDROID",
    clientVersion: "20.10.38",
    hl: "en",
    gl: "IN",
    userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    androidSdkVersion: 34,
  },
};

type InnertubeOptions = {
  signal?: AbortSignal;
  useAndroidClient?: boolean;
};

type StreamInfo = {
  itag: number;
  mimeType: string;
  quality: string;
  bitrate: number;
  url?: string;
  signatureCipher?: string;
  cipher?: string;
  audioQuality?: string;
  width?: number;
  height?: number;
  fps?: number;
  contentLength?: string;
  approxDurationMs?: string;
};

async function innertubePost<T>(
  endpoint: string,
  body: Record<string, any>,
  options: InnertubeOptions = {},
): Promise<T> {
  const context = options.useAndroidClient ? ANDROID_CLIENT_CONTEXT : WEB_CLIENT_CONTEXT;
  const url = `${INNERTUBE_BASE_URL}/${endpoint}?key=${INNERTUBE_KEY}&prettyPrint=false`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-youtube-client-name": options.useAndroidClient ? "3" : "1",
      "x-youtube-client-version": context.client.clientVersion,
      "user-agent": context.client.userAgent,
    },
    body: JSON.stringify({
      context,
      ...body,
    }),
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Innertube ${endpoint} failed (${response.status}): ${message.slice(0, 180)}`);
  }

  return (await response.json()) as T;
}

function extractVideoDetails(data: any) {
  const details = data?.videoDetails || {};
  return {
    videoId: details.videoId || "",
    title: details.title || "",
    author: details.author || "",
    lengthSeconds: Number(details.lengthSeconds || 0),
    viewCount: Number(details.viewCount || 0),
    shortDescription: details.shortDescription || "",
    thumbnail: details.thumbnail?.thumbnails || [],
    isLive: Boolean(details.isLive),
    isLiveDvr: Boolean(details.isLiveDvrEnabled),
    keywords: details.keywords || [],
  };
}

async function resolveStreamUrls(videoId: string, streams: StreamInfo[]): Promise<StreamInfo[]> {
  const mapped = await Promise.all(
    streams.map(async (stream) => {
      if (stream.url) return stream;
      const decipheredUrl = await decipherStreamUrl(videoId, stream);
      return {
        ...stream,
        url: decipheredUrl || undefined,
      };
    }),
  );
  return mapped;
}

async function normalizeStreamingData(videoId: string, data: any) {
  const streamingData = data?.streamingData || {};
  const adaptiveFormats: StreamInfo[] = Array.isArray(streamingData.adaptiveFormats)
    ? streamingData.adaptiveFormats
    : [];
  const muxedFormats: StreamInfo[] = Array.isArray(streamingData.formats)
    ? streamingData.formats
    : [];

  const normalizedAdaptive = await resolveStreamUrls(videoId, adaptiveFormats);
  const normalizedMuxed = await resolveStreamUrls(videoId, muxedFormats);

  return {
    expiresInSeconds: Number(streamingData.expiresInSeconds || 0),
    adaptiveFormats: normalizedAdaptive,
    formats: normalizedMuxed,
  };
}

function hasCipherOnlyStreams(streams: StreamInfo[]): boolean {
  if (!streams.length) return true;
  const withUrl = streams.filter((stream) => stream.url);
  return withUrl.length < Math.max(1, Math.floor(streams.length / 3));
}

function extractCaptionTracks(data: any) {
  const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  return tracks.map((track: any) => ({
    baseUrl: track.baseUrl,
    name: track.name?.simpleText || track.name?.runs?.[0]?.text || "",
    languageCode: track.languageCode || "",
    kind: track.kind || "",
    vssId: track.vssId || "",
  }));
}

function extractStoryboardSpec(data: any) {
  return data?.storyboards?.playerStoryboardSpecRenderer?.spec || null;
}

function buildTranscriptParamsFromVideoId(videoId: string): string {
  const payload = `\n\v${videoId}`;
  return Buffer.from(payload, "binary").toString("base64");
}

export async function searchVideos(query: string, continuationToken?: string) {
  const body = continuationToken
    ? { continuation: continuationToken }
    : {
        query,
      };

  const data = await innertubePost<any>("search", body);
  return parseSearchResponse(data);
}

export async function getVideoPlayer(videoId: string) {
  const body = {
    videoId,
    racyCheckOk: true,
    contentCheckOk: true,
  };

  const webData = await innertubePost<any>("player", body);
  let streamingData = await normalizeStreamingData(videoId, webData);

  if (hasCipherOnlyStreams(streamingData.adaptiveFormats)) {
    try {
      const androidData = await innertubePost<any>("player", body, {
        useAndroidClient: true,
      });
      const androidStreams = await normalizeStreamingData(videoId, androidData);
      if (androidStreams.adaptiveFormats.some((stream) => stream.url)) {
        streamingData = androidStreams;
      }
    } catch {
      // Keep WEB response if ANDROID fallback fails.
    }
  }

  return {
    videoDetails: extractVideoDetails(webData),
    playabilityStatus: webData?.playabilityStatus,
    streamingData: {
      ...streamingData,
      videoStreams: streamingData.adaptiveFormats.filter((stream) =>
        String(stream.mimeType || "").includes("video"),
      ),
      audioStreams: streamingData.adaptiveFormats.filter((stream) =>
        String(stream.mimeType || "").includes("audio"),
      ),
    },
    captions: extractCaptionTracks(webData),
    storyboards: extractStoryboardSpec(webData),
    raw: webData,
  };
}

export async function getVideoData(videoId: string) {
  return getVideoPlayer(videoId);
}

export async function getNextData(videoId: string) {
  const data = await innertubePost<any>("next", { videoId });
  let relatedVideos = parseRelatedVideosFromNext(data);
  const chapters = parseChaptersFromNext(data);

  const continuation =
    data?.contents?.twoColumnWatchNextResults?.results?.results?.contents
      ?.find((item: any) => item.itemSectionRenderer?.targetId === "comments-section")
      ?.itemSectionRenderer?.contents?.[0]?.continuationItemRenderer?.continuationEndpoint
      ?.continuationCommand?.token ||
    data?.engagementPanels?.find(
      (panel: any) => panel.engagementPanelSectionListRenderer?.panelIdentifier === "engagement-panel-comments-section",
    )?.engagementPanelSectionListRenderer?.content?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
      ?.token;

  const comments = parseCommentsResponse(data).comments;

  if (!relatedVideos.length) {
    try {
      const player = await getVideoPlayer(videoId);
      const seedQuery = [player.videoDetails.author, player.videoDetails.title]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (seedQuery) {
        const fallback = await searchVideos(seedQuery);
        relatedVideos = fallback.videos
          .filter((video) => Boolean(video.videoId) && video.videoId !== videoId)
          .slice(0, 24);
      }
    } catch {
      // Keep empty related list when fallback search fails.
    }
  }

  return {
    relatedVideos,
    chapters,
    comments,
    commentsContinuationToken: continuation,
    raw: data,
  };
}

export async function getRelatedFromVideo(videoId: string) {
  const data = await getNextData(videoId);
  return data.relatedVideos;
}

export async function getHomeFeed(continuationToken?: string, params?: string) {
  const SEARCH_CONTINUATION_PREFIX = "search:";
  const token = continuationToken || "";

  const isSearchContinuation =
    Boolean(token) &&
    (token.startsWith(SEARCH_CONTINUATION_PREFIX) ||
      // Legacy continuation generated before token-prefix support.
      token.includes("C3NlYXJjaC1mZWVk"));

  if (continuationToken && isSearchContinuation) {
    const rawToken = token.startsWith(SEARCH_CONTINUATION_PREFIX)
      ? continuationToken.slice(SEARCH_CONTINUATION_PREFIX.length)
      : continuationToken;

    const fallbackNext = await searchVideos("trending videos", rawToken);
    return {
      videos: fallbackNext.videos,
      shorts: [],
      continuationToken: fallbackNext.continuationToken
        ? `${SEARCH_CONTINUATION_PREFIX}${fallbackNext.continuationToken}`
        : undefined,
    };
  }

  const body = continuationToken
    ? { continuation: continuationToken }
    : {
        browseId: "FEwhat_to_watch",
        ...(params ? { params } : {}),
      };

  const data = await innertubePost<any>("browse", body);
  const parsed = parseHomeFeedResponse(data);

  // Logged-out/new visitors often receive only feed nudge content with no videos.
  // In that case, fallback to search feed so UI never appears empty.
  if (!parsed.videos.length && !continuationToken) {
    const fallback = await searchVideos("trending videos");
    return {
      videos: fallback.videos,
      shorts: fallback.videos
        .filter((video) => !video.isLive && Number(video.durationSeconds || 0) > 0 && Number(video.durationSeconds || 0) <= 70)
        .slice(0, 16)
        .map((video) => ({
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnails[video.thumbnails.length - 1] || video.thumbnails[0] || "",
          viewCount: video.viewCount,
          viewCountNumber: video.viewCountNumber,
          channelName: video.channelName,
        })),
      continuationToken: fallback.continuationToken
        ? `${SEARCH_CONTINUATION_PREFIX}${fallback.continuationToken}`
        : undefined,
    };
  }

  return parsed;
}

export async function getTrending(categoryParams?: string) {
  const body: Record<string, any> = {
    browseId: "FEtrending",
  };

  if (categoryParams) {
    body.params = categoryParams;
  }

  const data = await innertubePost<any>("browse", body);
  return parseTrendingResponse(data);
}

export async function getChannelPage(channelId: string, params?: string) {
  const data = await innertubePost<any>("browse", {
    browseId: channelId,
    ...(params ? { params } : {}),
  });
  return parseChannelPageResponse(data);
}

export async function getPlaylist(playlistId: string, continuationToken?: string) {
  const body = continuationToken
    ? { continuation: continuationToken }
    : { browseId: `VL${playlistId}` };

  const data = await innertubePost<any>("browse", body);
  return parsePlaylistResponse(data);
}

export async function getComments(videoId: string, continuationToken?: string) {
  const body = continuationToken ? { continuation: continuationToken } : { videoId };
  const data = await innertubePost<any>("next", body);
  const parsed = parseCommentsResponse(data);

  if (!continuationToken && parsed.comments.length === 0 && parsed.continuationToken) {
    const nextData = await innertubePost<any>("next", { continuation: parsed.continuationToken });
    const nextParsed = parseCommentsResponse(nextData);
    return {
      comments: nextParsed.comments,
      continuationToken: nextParsed.continuationToken || parsed.continuationToken,
    };
  }

  return parsed;
}

export async function getLiveChatReplay(videoId: string, continuation?: string) {
  const data = await innertubePost<any>("live_chat/get_live_chat_replay", {
    videoId,
    ...(continuation ? { continuation } : {}),
  });

  return {
    actions: data?.continuationContents?.liveChatContinuation?.actions || [],
    continuation:
      data?.continuationContents?.liveChatContinuation?.continuations?.[0]?.liveChatReplayContinuationData
        ?.continuation,
    raw: data,
  };
}

export async function getTranscript(videoId: string, params?: string) {
  const transcriptParams = params || buildTranscriptParamsFromVideoId(videoId);

  try {
    const data = await innertubePost<any>("get_transcript", {
      params: transcriptParams,
    });

    const segments = parseTranscriptResponse(data);
    if (segments.length) return segments;
  } catch {
    // Fall back to caption track fetching if transcript endpoint is blocked.
  }

  const player = await getVideoPlayer(videoId);
  const track = player.captions[0];
  if (!track?.baseUrl) {
    return [];
  }

  const xml = await fetch(track.baseUrl, { cache: "no-store" }).then((res) => res.text());
  const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  const segments: Array<{ startMs: number; text: string }> = [];

  let match = regex.exec(xml);
  while (match) {
    segments.push({
      startMs: Math.floor(Number(match[1]) * 1000),
      text: decodeHtmlEntities(match[2]),
    });
    match = regex.exec(xml);
  }

  return segments;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim()) return [];

  const endpoint = new URL("https://suggestqueries-clients6.youtube.com/complete/search");
  endpoint.searchParams.set("client", "youtube");
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("callback", "func");

  const text = await fetch(endpoint, { cache: "no-store" }).then((res) => res.text());
  const payloadMatch = text.match(/^[^(]+\(([\s\S]*)\)$/);
  if (!payloadMatch?.[1]) return [];

  try {
    const json = JSON.parse(payloadMatch[1]);
    const suggestions = json?.[1] || [];
    return suggestions
      .map((item: any) => (Array.isArray(item) ? item[0] : ""))
      .filter((item: string) => Boolean(item))
      .slice(0, 10);
  } catch {
    return [];
  }
}
