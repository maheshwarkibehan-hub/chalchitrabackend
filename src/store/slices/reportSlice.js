import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "report";
const SLICE_ERROR_PREFIX = "[reportSlice]";
const TIMESTAMP_KEY = "reportedAt";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates report data structure
 * @param {Object} data - Report data to validate
 * @returns {boolean} Whether data is valid
 */
const isValidReportData = (data) => {
  return data && (data.videoId || data.reason);
};

/**
 * Creates report object with consolidated data
 * @param {Object} payload - Report payload
 * @returns {Object} Consolidated report object
 */
const createReportObject = (payload) => {
  const { videoId, videoData, reason, reasonTitle, description, reportedAt } =
    payload;

  return {
    id: videoId,
    ...videoData,
    reason,
    reasonTitle,
    description,
    [TIMESTAMP_KEY]: reportedAt || new Date().toISOString(),
  };
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  reportedVideos: {}, // { videoId: reportData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Report Redux Slice
 * Manages reported videos with reason, description, and timestamp
 * Stores reports by videoId for easy lookup and management
 */
const reportSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * reportVideo Reducer
     * Adds report for a video with metadata
     * @param {Object} state - Current report state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { videoId, videoData, reason, reasonTitle, description, reportedAt? }
     */
    reportVideo: (state, action) => {
      if (!isValidReportData(action.payload)) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid report data for video: ${action.payload.videoId}`
        );
        return;
      }

      const { videoId } = action.payload;
      state.reportedVideos[videoId] = createReportObject(action.payload);
    },

    /**
     * removeReport Reducer
     * Removes report for a video
     * @param {Object} state - Current report state
     * @param {Object} action - Redux action
     * @param {string|number} action.payload - Video ID to remove report for
     */
    removeReport: (state, action) => {
      const videoId = action.payload;
      delete state.reportedVideos[videoId];
    },

    /**
     * clearAllReports Reducer
     * Removes all video reports
     * @param {Object} state - Current report state
     */
    clearAllReports: (state) => {
      state.reportedVideos = {};
    },
  },
});

export const { reportVideo, removeReport, clearAllReports } =
  reportSlice.actions;
export default reportSlice.reducer;