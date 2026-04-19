import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "liked";
const STORAGE_KEY = "likedVideos";
const SLICE_ERROR_PREFIX = "[likedSlice]";
const TIMESTAMP_KEY = "likedAt";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Loads liked videos from localStorage with error handling
 * @returns {Object} Parsed liked videos object or empty object if error
 */
const loadLikedVideosFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error loading liked videos:`, error);
    return {};
  }
};

/**
 * Saves liked videos to localStorage with error handling
 * @param {Object} likedVideos - Liked videos object to save
 */
const saveLikedVideosToStorage = (likedVideos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedVideos));
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error saving liked videos:`, error);
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  likedVideos: loadLikedVideosFromStorage(), // { videoId: videoData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Liked Videos Redux Slice
 * Manages user's liked videos with persistent localStorage storage
 * Automatically syncs state changes to localStorage
 */
const likedSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * likeVideo Reducer
     * Adds video to liked videos with timestamp
     * @param {Object} state - Current liked state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { videoId, videoData }
     */
    likeVideo: (state, action) => {
      const { videoId, videoData } = action.payload;

      state.likedVideos[videoId] = {
        ...videoData,
        [TIMESTAMP_KEY]: new Date().toISOString(),
      };

      saveLikedVideosToStorage(state.likedVideos);
    },

    /**
     * unlikeVideo Reducer
     * Removes video from liked videos
     * @param {Object} state - Current liked state
     * @param {Object} action - Redux action
     * @param {string|number} action.payload - Video ID to remove
     */
    unlikeVideo: (state, action) => {
      const videoId = action.payload;

      delete state.likedVideos[videoId];

      saveLikedVideosToStorage(state.likedVideos);
    },

    /**
     * clearAllLikedVideos Reducer
     * Removes all liked videos and clears localStorage
     * @param {Object} state - Current liked state
     */
    clearAllLikedVideos: (state) => {
      state.likedVideos = {};
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { likeVideo, unlikeVideo, clearAllLikedVideos } =
  likedSlice.actions;

export default likedSlice.reducer;