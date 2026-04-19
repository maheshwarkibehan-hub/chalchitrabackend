import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "watchLater";
const STORAGE_KEY = "watchLater";
const SLICE_ERROR_PREFIX = "[watchLaterSlice]";
const TIMESTAMP_KEY = "addedAt";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Loads watch later videos from localStorage with error handling
 * @returns {Object} Parsed watch later videos object or empty object if error
 */
const loadWatchLaterFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error loading watch later:`, error);
    return {};
  }
};

/**
 * Saves watch later videos to localStorage with error handling
 * @param {Object} watchLaterVideos - Watch later videos object to save
 */
const saveWatchLaterToStorage = (watchLaterVideos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchLaterVideos));
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error saving watch later:`, error);
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  watchLaterVideos: loadWatchLaterFromStorage(), // { videoId: videoData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Watch Later Redux Slice
 * Manages user's watch later videos with persistent localStorage storage
 * Automatically syncs state changes to localStorage
 */
const watchLaterSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addToWatchLater Reducer
     * Adds video to watch later with timestamp
     * @param {Object} state - Current watch later state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { videoId, videoData }
     */
    addToWatchLater: (state, action) => {
      const { videoId, videoData } = action.payload;

      state.watchLaterVideos[videoId] = {
        ...videoData,
        [TIMESTAMP_KEY]: new Date().toISOString(),
      };

      saveWatchLaterToStorage(state.watchLaterVideos);
    },

    /**
     * removeFromWatchLater Reducer
     * Removes video from watch later
     * @param {Object} state - Current watch later state
     * @param {Object} action - Redux action
     * @param {string|number} action.payload - Video ID to remove
     */
    removeFromWatchLater: (state, action) => {
      const videoId = action.payload;

      delete state.watchLaterVideos[videoId];

      saveWatchLaterToStorage(state.watchLaterVideos);
    },

    /**
     * clearAllWatchLater Reducer
     * Removes all watch later videos and clears localStorage
     * @param {Object} state - Current watch later state
     */
    clearAllWatchLater: (state) => {
      state.watchLaterVideos = {};
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addToWatchLater, removeFromWatchLater, clearAllWatchLater } =
  watchLaterSlice.actions;

export default watchLaterSlice.reducer;