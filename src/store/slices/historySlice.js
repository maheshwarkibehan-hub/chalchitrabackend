import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "history";
const STORAGE_KEY = "videoHistory";
const SLICE_ERROR_PREFIX = "[historySlice]";
const TIMESTAMP_KEY = "watchedAt";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Loads history from localStorage with error handling
 * @returns {Object} Parsed video history object or empty object if error
 */
const loadHistoryFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error loading history:`, error);
    return {};
  }
};

/**
 * Saves history to localStorage with error handling
 * @param {Object} watchedVideos - Video history object to save
 */
const saveHistoryToStorage = (watchedVideos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedVideos));
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error saving history:`, error);
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  watchedVideos: loadHistoryFromStorage(), // { videoId: videoData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Video History Redux Slice
 * Manages user's watch history with persistent localStorage storage
 * Automatically syncs state changes to localStorage
 */
const historySlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addToHistory Reducer
     * Adds or updates video in history with timestamp
     * @param {Object} state - Current history state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { videoId, videoData }
     */
    addToHistory: (state, action) => {
      const { videoId, videoData } = action.payload;

      state.watchedVideos[videoId] = {
        ...videoData,
        [TIMESTAMP_KEY]: new Date().toISOString(),
      };

      saveHistoryToStorage(state.watchedVideos);
    },

    /**
     * removeFromHistory Reducer
     * Removes video from history
     * @param {Object} state - Current history state
     * @param {Object} action - Redux action
     * @param {string|number} action.payload - Video ID to remove
     */
    removeFromHistory: (state, action) => {
      const videoId = action.payload;

      delete state.watchedVideos[videoId];

      saveHistoryToStorage(state.watchedVideos);
    },

    /**
     * clearAllHistory Reducer
     * Removes all history entries and clears localStorage
     * @param {Object} state - Current history state
     */
    clearAllHistory: (state) => {
      state.watchedVideos = {};
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addToHistory, removeFromHistory, clearAllHistory } =
  historySlice.actions;

export default historySlice.reducer;