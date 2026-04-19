import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "filter";
const DEFAULT_CATEGORY = "All";
const SLICE_ERROR_PREFIX = "[filterSlice]";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates category string
 * @param {string} category - Category to validate
 * @returns {boolean} Whether category is valid
 */
const isValidCategory = (category) => {
  return typeof category === "string" && category.trim().length > 0;
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  category: DEFAULT_CATEGORY,
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Filter Redux Slice
 * Manages active category filter for video content
 * Persists filter state across navigation
 */
const filterSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * setCategory Reducer
     * Updates the active video category filter
     * @param {Object} state - Current filter state
     * @param {Object} action - Redux action
     * @param {string} action.payload - New category
     */
    setCategory: (state, action) => {
      if (!isValidCategory(action.payload)) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid category received: ${action.payload}`
        );
        return;
      }

      state.category = action.payload.trim();
    },
  },
});

export const { setCategory } = filterSlice.actions;
export default filterSlice.reducer;
