import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "search";
const SLICE_ERROR_PREFIX = "[searchSlice]";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates search results array
 * @param {Array} results - Results array to validate
 * @returns {boolean} Whether results are valid
 */
const isValidSearchResults = (results) => {
  return Array.isArray(results);
};

/**
 * Validates search query string
 * @param {string} query - Query to validate
 * @returns {boolean} Whether query is valid
 */
const isValidSearchQuery = (query) => {
  return typeof query === "string";
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  searchResults: [],
  searchQuery: "",
  isLoading: false,
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Search Redux Slice
 * Manages search query, results, and loading state
 * Maintains search history and loading status for UI feedback
 */
const searchSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * setSearchResults Reducer
     * Updates search results array
     * @param {Object} state - Current search state
     * @param {Object} action - Redux action
     * @param {Array} action.payload - Search results
     */
    setSearchResults: (state, action) => {
      if (!isValidSearchResults(action.payload)) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid search results received`
        );
        return;
      }

      state.searchResults = action.payload;
    },

    /**
     * setSearchQuery Reducer
     * Updates current search query
     * @param {Object} state - Current search state
     * @param {Object} action - Redux action
     * @param {string} action.payload - Search query
     */
    setSearchQuery: (state, action) => {
      if (!isValidSearchQuery(action.payload)) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid search query received`
        );
        return;
      }

      state.searchQuery = action.payload;
    },

    /**
     * setLoading Reducer
     * Updates search loading state
     * @param {Object} state - Current search state
     * @param {Object} action - Redux action
     * @param {boolean} action.payload - Loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSearchResults, setSearchQuery, setLoading } =
  searchSlice.actions;
export default searchSlice.reducer;
