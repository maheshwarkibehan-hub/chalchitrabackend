import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "comments";
const SLICE_ERROR_PREFIX = "[commentsSlice]";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates comments data
 * @param {*} data - Comments data to validate
 * @returns {boolean} Whether data is valid
 */
const isValidCommentsData = (data) => {
  return Array.isArray(data) || (typeof data === "object" && data !== null);
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  storeComments: {}, // { videoId: commentsData }
  isLoading: false,
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Comments Redux Slice
 * Manages video comments cache with loading state
 * Caches comments by videoId to avoid refetching
 */
const commentsSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addComments Reducer
     * Stores comments for a specific video
     * @param {Object} state - Current comments state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { videoId, data }
     */
    addComments: (state, action) => {
      const { videoId, data } = action.payload;

      if (!isValidCommentsData(data)) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid comments data for video: ${videoId}`
        );
        return;
      }

      state.storeComments[videoId] = data;
    },

    /**
     * setLoading Reducer
     * Updates comments loading state
     * @param {Object} state - Current comments state
     * @param {Object} action - Redux action
     * @param {boolean} action.payload - Loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { addComments, setLoading } = commentsSlice.actions;
export default commentsSlice.reducer;