"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SPONSORBLOCK_CATEGORIES, type SponsorSegmentCategory } from "@/lib/sponsorblock";

export type HistoryVideo = {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration?: number;
  watchedAt: string;
  progressPercent: number;
  progressSeconds: number;
};

export type PlaylistVideo = {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration?: number;
};

export type LocalPlaylist = {
  id: string;
  name: string;
  createdAt: string;
  videos: PlaylistVideo[];
};

export type Preferences = {
  defaultVideoQuality: "Auto" | "144p" | "360p" | "480p" | "720p" | "1080p";
  defaultAudioQuality: "Low" | "Medium" | "High";
  defaultPlaybackSpeed: number;
  stableVolumeEnabled: boolean;
  autoplayEnabled: boolean;
  sponsorBlockEnabled: boolean;
  sponsorBlockCategories: SponsorSegmentCategory[];
  captionsEnabled: boolean;
  ambientModeEnabled: boolean;
  theme: "dark" | "light" | "system";
  pauseWatchHistory: boolean;
  contentLanguage: string;
};

export type CurrentlyPlaying = {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: string;
};

type AppStore = {
  watchHistory: HistoryVideo[];
  searchHistory: string[];
  localPlaylists: LocalPlaylist[];
  watchLaterVideos: PlaylistVideo[];
  likedVideos: PlaylistVideo[];
  preferences: Preferences;
  currentlyPlaying: CurrentlyPlaying;
  miniPlayerActive: boolean;
  sidebarExpanded: boolean;

  addSearchHistory: (query: string) => void;
  removeSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  addWatchHistory: (video: Omit<HistoryVideo, "watchedAt"> & { watchedAt?: string }) => void;
  updateWatchProgress: (videoId: string, progressSeconds: number, duration?: number) => void;
  clearWatchHistory: () => void;
  removeWatchHistoryItem: (videoId: string) => void;

  createLocalPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, video: PlaylistVideo) => void;
  removeFromPlaylist: (playlistId: string, videoId: string) => void;

  toggleWatchLater: (video: PlaylistVideo) => void;
  toggleLikedVideo: (video: PlaylistVideo) => void;

  updatePreferences: (patch: Partial<Preferences>) => void;
  updateCurrentlyPlaying: (patch: Partial<CurrentlyPlaying>) => void;
  setMiniPlayerActive: (active: boolean) => void;
  toggleSidebar: () => void;
};

const defaultPreferences: Preferences = {
  defaultVideoQuality: "Auto",
  defaultAudioQuality: "Medium",
  defaultPlaybackSpeed: 1,
  stableVolumeEnabled: false,
  autoplayEnabled: true,
  sponsorBlockEnabled: true,
  sponsorBlockCategories: SPONSORBLOCK_CATEGORIES,
  captionsEnabled: false,
  ambientModeEnabled: true,
  theme: "light",
  pauseWatchHistory: false,
  contentLanguage: "en",
};

const defaultCurrentlyPlaying: CurrentlyPlaying = {
  videoId: "",
  currentTime: 0,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  quality: "Auto",
};

function upsertUniqueById<T extends { videoId: string }>(arr: T[], item: T, max = 200): T[] {
  const filtered = arr.filter((entry) => entry.videoId !== item.videoId);
  return [item, ...filtered].slice(0, max);
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      watchHistory: [],
      searchHistory: [],
      localPlaylists: [],
      watchLaterVideos: [],
      likedVideos: [],
      preferences: defaultPreferences,
      currentlyPlaying: defaultCurrentlyPlaying,
      miniPlayerActive: false,
      sidebarExpanded: true,

      addSearchHistory: (query) =>
        set((state) => {
          const normalized = query.trim();
          if (!normalized) return state;
          const next = [normalized, ...state.searchHistory.filter((q) => q.toLowerCase() !== normalized.toLowerCase())].slice(0, 20);
          return { searchHistory: next };
        }),

      removeSearchHistory: (query) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((entry) => entry !== query),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),

      addWatchHistory: (video) =>
        set((state) => {
          if (state.preferences.pauseWatchHistory) return state;

          const watchedVideo: HistoryVideo = {
            ...video,
            watchedAt: video.watchedAt || new Date().toISOString(),
          };

          return {
            watchHistory: upsertUniqueById(state.watchHistory, watchedVideo, 200),
          };
        }),

      updateWatchProgress: (videoId, progressSeconds, duration) =>
        set((state) => {
          const existing = state.watchHistory.find((item) => item.videoId === videoId);
          if (!existing) return state;

          const percent = duration && duration > 0 ? Math.min(100, (progressSeconds / duration) * 100) : existing.progressPercent;

          const updated: HistoryVideo = {
            ...existing,
            progressSeconds,
            progressPercent: percent,
            watchedAt: new Date().toISOString(),
          };

          return {
            watchHistory: upsertUniqueById(state.watchHistory, updated, 200),
          };
        }),

      clearWatchHistory: () => set({ watchHistory: [] }),

      removeWatchHistoryItem: (videoId) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((video) => video.videoId !== videoId),
        })),

      createLocalPlaylist: (name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed) return state;

          const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const playlist: LocalPlaylist = {
            id,
            name: trimmed,
            createdAt: new Date().toISOString(),
            videos: [],
          };

          return {
            localPlaylists: [playlist, ...state.localPlaylists],
          };
        }),

      addToPlaylist: (playlistId, video) =>
        set((state) => ({
          localPlaylists: state.localPlaylists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            if (playlist.videos.some((item) => item.videoId === video.videoId)) return playlist;
            return {
              ...playlist,
              videos: [...playlist.videos, video],
            };
          }),
        })),

      removeFromPlaylist: (playlistId, videoId) =>
        set((state) => ({
          localPlaylists: state.localPlaylists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            return {
              ...playlist,
              videos: playlist.videos.filter((video) => video.videoId !== videoId),
            };
          }),
        })),

      toggleWatchLater: (video) =>
        set((state) => {
          const exists = state.watchLaterVideos.some((item) => item.videoId === video.videoId);
          if (exists) {
            return {
              watchLaterVideos: state.watchLaterVideos.filter((item) => item.videoId !== video.videoId),
            };
          }
          return {
            watchLaterVideos: [video, ...state.watchLaterVideos],
          };
        }),

      toggleLikedVideo: (video) =>
        set((state) => {
          const exists = state.likedVideos.some((item) => item.videoId === video.videoId);
          if (exists) {
            return {
              likedVideos: state.likedVideos.filter((item) => item.videoId !== video.videoId),
            };
          }
          return {
            likedVideos: [video, ...state.likedVideos],
          };
        }),

      updatePreferences: (patch) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...patch,
          },
        })),

      updateCurrentlyPlaying: (patch) =>
        set((state) => ({
          currentlyPlaying: {
            ...state.currentlyPlaying,
            ...patch,
          },
        })),

      setMiniPlayerActive: (active) => set({ miniPlayerActive: active }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarExpanded: !state.sidebarExpanded,
        })),
    }),
    {
      name: "yt-clone-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchHistory: state.watchHistory,
        searchHistory: state.searchHistory,
        localPlaylists: state.localPlaylists,
        watchLaterVideos: state.watchLaterVideos,
        likedVideos: state.likedVideos,
        preferences: state.preferences,
        currentlyPlaying: state.currentlyPlaying,
        miniPlayerActive: state.miniPlayerActive,
        sidebarExpanded: state.sidebarExpanded,
      }),
    },
  ),
);

export const storeActions = {
  addWatchProgressSnapshot(videoId: string, currentTime: number) {
    const state = useAppStore.getState();
    if (!videoId) return;
    state.updateCurrentlyPlaying({ videoId, currentTime });
  },

  getResumePosition(videoId: string): number {
    const state = useAppStore.getState();
    if (state.currentlyPlaying.videoId === videoId) {
      return state.currentlyPlaying.currentTime;
    }

    const history = state.watchHistory.find((item) => item.videoId === videoId);
    return history?.progressSeconds || 0;
  },
};
