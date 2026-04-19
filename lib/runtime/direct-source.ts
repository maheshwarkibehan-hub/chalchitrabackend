import type { AppDataSource } from "@/lib/runtime/types";
import {
  getChannelPage,
  getComments,
  getHomeFeed,
  getLiveChatReplay,
  getNextData,
  getPlaylist,
  getSearchSuggestions,
  getTranscript,
  getTrending,
  getVideoPlayer,
  searchVideos,
} from "@/lib/innertube";
import { getSponsorSegments } from "@/lib/sponsorblock";
import { getReturnYouTubeDislike } from "@/lib/returnyoutubedislike";

export const directSource: AppDataSource = {
  search: (query, continuationToken) => searchVideos(query, continuationToken),
  player: (videoId) => getVideoPlayer(videoId),
  next: (videoId) => getNextData(videoId),
  home: (continuationToken, params) => getHomeFeed(continuationToken, params),
  trending: (params) => getTrending(params),
  channel: (channelId, params) => getChannelPage(channelId, params),
  playlist: (playlistId, continuationToken) => getPlaylist(playlistId, continuationToken),
  comments: (videoId, continuationToken) => getComments(videoId, continuationToken),
  transcript: (videoId, params) => getTranscript(videoId, params),
  suggestions: (query) => getSearchSuggestions(query),
  chapters: async (videoId) => {
    const data = await getNextData(videoId);
    return data.chapters;
  },
  liveChatReplay: (videoId, continuation) => getLiveChatReplay(videoId, continuation),
  sponsorSegments: (videoId) => getSponsorSegments(videoId),
  dislikeVotes: (videoId) => getReturnYouTubeDislike(videoId),
};
