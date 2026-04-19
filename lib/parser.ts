/* eslint-disable @typescript-eslint/no-explicit-any */

type AnyRecord = Record<string, any>;

export type ParsedVideo = {
  videoId: string;
  title: string;
  thumbnails: string[];
  duration: string;
  durationSeconds?: number;
  isShort?: boolean;
  viewCount: string;
  viewCountNumber?: number;
  channelName: string;
  channelId: string;
  channelAvatar?: string;
  publishedTime: string;
  description?: string;
  isLive?: boolean;
};

export type ParsedChannel = {
  channelId: string;
  title: string;
  thumbnails: string[];
  subscriberCount: string;
  description?: string;
};

export type ParsedPlaylistItem = {
  playlistId: string;
  title: string;
  thumbnails: string[];
  videoCount: string;
};

export type ParsedShort = {
  videoId: string;
  title: string;
  thumbnail: string;
  viewCount: string;
  viewCountNumber?: number;
  channelName?: string;
};

export type ParsedComment = {
  commentId: string;
  text: string;
  author: string;
  authorAvatar?: string;
  likeCount: string;
  replyCount: number;
  publishedTime: string;
};

export type ParsedChapter = {
  title: string;
  timeRangeStartMillis: number;
  thumbnail?: string;
};

export type ParsedChannelPage = {
  channelId: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  subscriberCount: string;
  totalViews: string;
  joinedDate: string;
  tabs: Array<{ title: string; selected: boolean; params?: string }>;
  videos: ParsedVideo[];
};

function getText(value?: AnyRecord): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.simpleText) return value.simpleText;
  if (Array.isArray(value.runs)) return value.runs.map((run: AnyRecord) => run.text ?? "").join("");
  return "";
}

function parseLengthTextToSeconds(lengthText?: string): number | undefined {
  if (!lengthText) return undefined;
  const parts = lengthText.split(":").map((value) => Number(value));
  if (parts.some((part) => Number.isNaN(part))) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

function extractThumb(thumbnailObj?: AnyRecord): string[] {
  const thumbs = thumbnailObj?.thumbnails;
  if (!Array.isArray(thumbs)) return [];
  return thumbs.map((thumb: AnyRecord) => thumb.url).filter(Boolean);
}

function extractBestThumb(thumbnailObj?: AnyRecord): string {
  const thumbs = extractThumb(thumbnailObj);
  if (!thumbs.length) return "";
  return thumbs[thumbs.length - 1] || thumbs[0] || "";
}

export function findRenderersByKey(root: unknown, rendererKey: string): AnyRecord[] {
  const out: AnyRecord[] = [];

  function walk(node: unknown) {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    if (node && typeof node === "object") {
      const record = node as AnyRecord;
      if (rendererKey in record && record[rendererKey]) {
        out.push(record[rendererKey]);
      }
      for (const value of Object.values(record)) {
        walk(value);
      }
    }
  }

  walk(root);
  return out;
}

export function parseVideoRenderer(videoRenderer: AnyRecord): ParsedVideo {
  const overlays = videoRenderer.thumbnailOverlays || [];
  const timeStatus = overlays
    .map((overlay: AnyRecord) => overlay.thumbnailOverlayTimeStatusRenderer)
    .find(Boolean);

  const durationText = getText(timeStatus?.text) || getText(videoRenderer.lengthText);
  const hasShortsStyle = String(timeStatus?.style || "").toUpperCase().includes("SHORTS");
  const isShort =
    hasShortsStyle ||
    /^shorts?$/i.test(durationText.trim()) ||
    (!durationText && /#shorts?\b/i.test(getText(videoRenderer.title) || ""));

  const viewCountText =
    getText(videoRenderer.viewCountText) ||
    getText(videoRenderer.shortViewCountText) ||
    getText(videoRenderer.videoInfo?.find((item: AnyRecord) => item?.title));

  return {
    videoId: videoRenderer.videoId ?? "",
    title: getText(videoRenderer.title),
    thumbnails: extractThumb(videoRenderer.thumbnail),
    duration: durationText || (hasShortsStyle ? "SHORTS" : ""),
    durationSeconds: parseLengthTextToSeconds(durationText),
    isShort,
    viewCount: viewCountText,
    viewCountNumber: Number((viewCountText || "").replace(/\D/g, "")) || 0,
    channelName:
      getText(videoRenderer.ownerText) ||
      getText(videoRenderer.shortBylineText) ||
      getText(videoRenderer.longBylineText),
    channelId:
      videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
      videoRenderer.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
      videoRenderer.longBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
      "",
    channelAvatar: extractBestThumb(videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail),
    publishedTime:
      getText(videoRenderer.publishedTimeText) ||
      getText(videoRenderer.publishedTimeText?.runs?.[0]?.text) ||
      "",
    description: getText(videoRenderer.descriptionSnippet),
    isLive: Boolean(videoRenderer.badges?.some((badge: AnyRecord) => badge.metadataBadgeRenderer?.label?.includes("LIVE"))),
  };
}

export function parseChannelRenderer(channelRenderer: AnyRecord): ParsedChannel {
  return {
    channelId: channelRenderer.channelId ?? "",
    title: getText(channelRenderer.title),
    thumbnails: extractThumb(channelRenderer.thumbnail),
    subscriberCount: getText(channelRenderer.subscriberCountText),
    description: getText(channelRenderer.descriptionSnippet),
  };
}

export function parsePlaylistRenderer(playlistRenderer: AnyRecord): ParsedPlaylistItem {
  return {
    playlistId: playlistRenderer.playlistId ?? "",
    title: getText(playlistRenderer.title),
    thumbnails: extractThumb(playlistRenderer.thumbnails?.[0] || playlistRenderer.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail),
    videoCount: getText(playlistRenderer.videoCountText),
  };
}

export function parseSearchResponse(data: AnyRecord): {
  videos: ParsedVideo[];
  channels: ParsedChannel[];
  playlists: ParsedPlaylistItem[];
  continuationToken?: string;
} {
  const videos = findRenderersByKey(data, "videoRenderer").map(parseVideoRenderer);
  const channels = findRenderersByKey(data, "channelRenderer").map(parseChannelRenderer);
  const playlists = findRenderersByKey(data, "playlistRenderer").map(parsePlaylistRenderer);

  const continuationRenderer = findRenderersByKey(data, "continuationItemRenderer")[0];
  const continuationToken =
    continuationRenderer?.continuationEndpoint?.continuationCommand?.token ||
    continuationRenderer?.button?.buttonRenderer?.command?.continuationCommand?.token;

  return { videos, channels, playlists, continuationToken };
}

export function parseHomeFeedResponse(data: AnyRecord): {
  videos: ParsedVideo[];
  shorts: ParsedShort[];
  continuationToken?: string;
} {
  const videos = findRenderersByKey(data, "videoRenderer").map(parseVideoRenderer);
  const reelShorts = findRenderersByKey(data, "reelItemRenderer").map((reel) => {
    const viewCountText = getText(reel.viewCountText);
    return {
      videoId:
        reel.videoId ||
        reel.navigationEndpoint?.reelWatchEndpoint?.videoId ||
        reel.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId ||
        "",
      title: getText(reel.headline) || getText(reel.title) || "Short",
      thumbnail: extractBestThumb(reel.thumbnail) || extractBestThumb(reel.thumbnailRenderer?.thumbnail),
      viewCount: viewCountText,
      viewCountNumber: Number((viewCountText || "").replace(/\D/g, "")) || 0,
      channelName:
        getText(reel.channelNameText) ||
        getText(reel.accessibility?.accessibilityData?.label),
    };
  });

  const derivedShorts: ParsedShort[] = videos
    .filter((video) => video.isShort)
    .map((video) => ({
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnails[video.thumbnails.length - 1] || video.thumbnails[0] || "",
      viewCount: video.viewCount,
      viewCountNumber: video.viewCountNumber,
      channelName: video.channelName,
    }));

  const shortMap = new Map<string, ParsedShort>();
  for (const short of [...reelShorts, ...derivedShorts]) {
    if (!short.videoId || !short.thumbnail || shortMap.has(short.videoId)) continue;
    shortMap.set(short.videoId, short);
  }
  const shorts = Array.from(shortMap.values());

  const continuationRenderer = findRenderersByKey(data, "continuationItemRenderer")[0];
  const continuationToken =
    continuationRenderer?.continuationEndpoint?.continuationCommand?.token ||
    continuationRenderer?.button?.buttonRenderer?.command?.continuationCommand?.token;

  return { videos, shorts, continuationToken };
}

export function parseTrendingResponse(data: AnyRecord): {
  videos: ParsedVideo[];
  tabs: Array<{ title: string; params?: string }>;
} {
  const videos = findRenderersByKey(data, "videoRenderer").map(parseVideoRenderer);
  const tabs = findRenderersByKey(data, "tabRenderer").map((tab) => ({
    title: getText(tab.title),
    params: tab.endpoint?.browseEndpoint?.params,
  }));

  return { videos, tabs };
}

export function parseRelatedVideosFromNext(data: AnyRecord): ParsedVideo[] {
  const compactVideos = findRenderersByKey(data, "compactVideoRenderer");
  return compactVideos.map((videoRenderer) =>
    parseVideoRenderer({
      ...videoRenderer,
      lengthText: videoRenderer.lengthText,
      shortBylineText: videoRenderer.shortBylineText,
    }),
  );
}

export function parseChaptersFromNext(data: AnyRecord): ParsedChapter[] {
  const markers = findRenderersByKey(data, "macroMarkersListItemRenderer");
  return markers.map((marker) => ({
    title: getText(marker.title),
    timeRangeStartMillis: marker.timeDescriptionA11yLabel
      ? extractMillisFromText(marker.timeDescriptionA11yLabel)
      : Number(marker.onTap?.watchEndpoint?.startTimeSeconds || 0) * 1000,
    thumbnail: extractBestThumb(marker.thumbnail),
  }));
}

function extractMillisFromText(value: string): number {
  const match = value.match(/(\d+):(\d{2})(?::(\d{2}))?/);
  if (!match) return 0;
  if (match[3]) {
    return (Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])) * 1000;
  }
  return (Number(match[1]) * 60 + Number(match[2])) * 1000;
}

export function parseCommentRenderer(commentThreadRenderer: AnyRecord): ParsedComment {
  const comment = commentThreadRenderer.comment?.commentRenderer;
  return {
    commentId: comment?.commentId || "",
    text: getText(comment?.contentText),
    author: getText(comment?.authorText),
    authorAvatar: extractThumb(comment?.authorThumbnail)?.[0],
    likeCount: getText(comment?.voteCount),
    replyCount: commentThreadRenderer.replies?.commentRepliesRenderer?.moreText
      ? Number(getText(commentThreadRenderer.replies.commentRepliesRenderer.moreText).replace(/\D/g, "")) || 0
      : 0,
    publishedTime: getText(comment?.publishedTimeText),
  };
}

export function parseCommentsResponse(data: AnyRecord): {
  comments: ParsedComment[];
  continuationToken?: string;
} {
  const threads = findRenderersByKey(data, "commentThreadRenderer");
  const comments = threads.map(parseCommentRenderer);

  const continuationRenderer = findRenderersByKey(data, "continuationItemRenderer")[0];
  const continuationToken =
    continuationRenderer?.continuationEndpoint?.continuationCommand?.token ||
    findRenderersByKey(data, "commentRenderer")[0]?.actionButtons?.commentActionButtonsRenderer?.replyButton?.buttonRenderer?.navigationEndpoint?.continuationCommand?.token;

  return { comments, continuationToken };
}

export function parseChannelPageResponse(data: AnyRecord): ParsedChannelPage {
  const metadata = data.metadata?.channelMetadataRenderer || {};
  const header = data.header?.c4TabbedHeaderRenderer || {};
  const tabs = findRenderersByKey(data, "tabRenderer").map((tab) => ({
    title: getText(tab.title),
    selected: Boolean(tab.selected),
    params: tab.endpoint?.browseEndpoint?.params,
  }));

  const videos = findRenderersByKey(data, "videoRenderer").map(parseVideoRenderer);

  return {
    channelId: metadata.externalId || metadata.channelId || "",
    name: metadata.title || getText(header.title),
    description: metadata.description || "",
    avatar: extractBestThumb(header.avatar),
    banner: extractBestThumb(header.banner),
    subscriberCount: getText(header.subscriberCountText),
    totalViews: getText(header.videosCountText),
    joinedDate: getText(header.joinedDateText),
    tabs,
    videos,
  };
}

export function parsePlaylistResponse(data: AnyRecord): {
  title: string;
  description: string;
  videoCount: string;
  videos: ParsedVideo[];
  continuationToken?: string;
} {
  const header = data.header?.playlistHeaderRenderer || {};
  const contents = findRenderersByKey(data, "playlistVideoRenderer");

  const videos = contents.map((item) =>
    parseVideoRenderer({
      videoId: item.videoId,
      title: item.title,
      thumbnail: item.thumbnail,
      lengthText: item.lengthText,
      shortBylineText: item.shortBylineText,
      viewCountText: item.videoInfo?.[0] ? { simpleText: item.videoInfo[0] } : undefined,
      publishedTimeText: item.videoInfo?.[1] ? { simpleText: item.videoInfo[1] } : undefined,
    }),
  );

  const continuationRenderer = findRenderersByKey(data, "continuationItemRenderer")[0];
  const continuationToken = continuationRenderer?.continuationEndpoint?.continuationCommand?.token;

  return {
    title: getText(header.title),
    description: getText(header.descriptionText),
    videoCount: getText(header.numVideosText),
    videos,
    continuationToken,
  };
}

export function parseTranscriptResponse(data: AnyRecord): Array<{
  startMs: number;
  text: string;
}> {
  const segments = findRenderersByKey(data, "transcriptSegmentRenderer");
  return segments.map((segment) => ({
    startMs: Number(segment.startMs) || 0,
    text: getText(segment.snippet),
  }));
}
