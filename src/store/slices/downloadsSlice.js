import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "downloads";
const STORAGE_KEY = "downloadedVideos";
const SLICE_ERROR_PREFIX = "[downloadsSlice]";
const TIMESTAMP_KEY = "downloadedAt";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Loads downloaded videos from localStorage with error handling
 * @returns {Object} Parsed downloads object or empty object if error
 */
const loadDownloadsFromStorage = () => {
  try {
    const downloads = localStorage.getItem(STORAGE_KEY);
    return downloads ? JSON.parse(downloads) : {};
  } catch (error) {
    console.error(
      `${SLICE_ERROR_PREFIX} Error loading downloads from storage:`,
      error
    );
    return {};
  }
};

/**
 * Saves downloads to localStorage with error handling
 * @param {Object} downloadedVideos - Downloads object to save
 */
const saveDownloadsToStorage = (downloadedVideos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(downloadedVideos));
  } catch (error) {
    console.error(
      `${SLICE_ERROR_PREFIX} Error saving downloads to storage:`,
      error
    );
  }
};

/**
 * Validates download data structure
 * @param {Object} data - Download data to validate
 * @returns {boolean} Whether data is valid
 */
const isValidDownloadData = (data) => {
  return data && (data.videoId || data.title);
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  downloadedVideos: loadDownloadsFromStorage(), // { videoId: videoData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Downloads Redux Slice
 * Manages downloaded videos with persistent localStorage storage
 * Automatically syncs state changes to localStorage
 */
const downloadsSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addDownload Reducer
     * Adds downloaded video with metadata and timestamp
     * @param {Object} state - Current downloads state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { videoId, videoData, downloadedAt?, fileSize? }
     */
    addDownload: (state, action) => {
      const { videoId, videoData, downloadedAt, fileSize } = action.payload;

      if (!isValidDownloadData({ videoId, ...videoData })) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid download data for video: ${videoId}`
        );
        return;
      }

      state.downloadedVideos[videoId] = {
        videoId,
        ...videoData,
        [TIMESTAMP_KEY]: downloadedAt || new Date().toISOString(),
        fileSize: fileSize || videoData.fileSize || "Unknown",
      };

      saveDownloadsToStorage(state.downloadedVideos);
    },

    /**
     * removeDownload Reducer
     * Removes a downloaded video
     * @param {Object} state - Current downloads state
     * @param {Object} action - Redux action
     * @param {string|number} action.payload - Video ID to remove
     */
    removeDownload: (state, action) => {
      const videoId = action.payload;

      delete state.downloadedVideos[videoId];

      saveDownloadsToStorage(state.downloadedVideos);
    },

    /**
     * clearAllDownloads Reducer
     * Removes all downloads and clears localStorage
     * @param {Object} state - Current downloads state
     */
    clearAllDownloads: (state) => {
      state.downloadedVideos = {};
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addDownload, removeDownload, clearAllDownloads } =
  downloadsSlice.actions;
export default downloadsSlice.reducer;