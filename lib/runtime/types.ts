import type { SponsorSegment } from "@/lib/sponsorblock";
import type { ReturnYouTubeDislikeResponse } from "@/lib/returnyoutubedislike";
import type {
  ParsedChannel,
  ParsedChannelPage,
  ParsedChapter,
  ParsedComment,
  ParsedPlaylistItem,
  ParsedShort,
  ParsedVideo,
} from "@/lib/parser";

export type DataMode = "auto" | "web-api" | "direct";

export type SearchResult = {
  videos: ParsedVideo[];
  channels: ParsedChannel[];
  playlists: ParsedPlaylistItem[];
  continuationToken?: string;
};

export type HomeResult = {
  videos: ParsedVideo[];
  shorts?: ParsedShort[];
  continuationToken?: string;
};

export type TrendingResult = {
  videos: ParsedVideo[];
  tabs: Array<{ title: string; params?: string }>;
};

export type NextDataResult = {
  relatedVideos: ParsedVideo[];
  chapters: ParsedChapter[];
  comments: ParsedComment[];
  commentsContinuationToken?: string;
};

export type CommentsResult = {
  comments: ParsedComment[];
  continuationToken?: string;
};

export type PlaylistResult = {
  title: string;
  description: string;
  videoCount: string;
  videos: ParsedVideo[];
  continuationToken?: string;
};

export type VideoPlayerResult = {
  videoDetails: {
    videoId: string;
    title: string;
    author: string;
    lengthSeconds: number;
    viewCount: number;
    shortDescription: string;
    thumbnail: Array<{ url: string; width: number; height: number }>;
    isLive: boolean;
    isLiveDvr: boolean;
    keywords: string[];
  };
  playabilityStatus?: Record<string, unknown>;
  streamingData: {
    expiresInSeconds: number;
    adaptiveFormats: Array<Record<string, unknown>>;
    formats: Array<Record<string, unknown>>;
    videoStreams: Array<Record<string, unknown>>;
    audioStreams: Array<Record<string, unknown>>;
  };
  captions: Array<Record<string, unknown>>;
  storyboards: string | null;
  raw: Record<string, unknown>;
};

export interface AppDataSource {
  search(query: string, continuationToken?: string): Promise<SearchResult>;
  player(videoId: string): Promise<VideoPlayerResult>;
  next(videoId: string): Promise<NextDataResult>;
  home(continuationToken?: string, params?: string): Promise<HomeResult>;
  trending(params?: string): Promise<TrendingResult>;
  channel(channelId: string, params?: string): Promise<ParsedChannelPage>;
  playlist(playlistId: string, continuationToken?: string): Promise<PlaylistResult>;
  comments(videoId: string, continuationToken?: string): Promise<CommentsResult>;
  transcript(videoId: string, params?: string): Promise<Array<{ startMs: number; text: string }>>;
  suggestions(query: string): Promise<string[]>;
  chapters(videoId: string): Promise<ParsedChapter[]>;
  liveChatReplay(videoId: string, continuation?: string): Promise<Record<string, unknown>>;
  sponsorSegments(videoId: string): Promise<SponsorSegment[]>;
  dislikeVotes(videoId: string): Promise<ReturnYouTubeDislikeResponse | null>;
}
