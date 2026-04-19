import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "movies";
const SLICE_ERROR_PREFIX = "[moviesSlice]";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates pagination data
 * @param {Object} data - Pagination data to validate
 * @returns {boolean} Whether data is valid
 */
const isValidPaginationData = (data) => {
  return data && Array.isArray(data.items);
};

/**
 * Sanitizes items array with fallback
 * @param {Array} items - Items to sanitize
 * @returns {Array} Valid items array
 */
const sanitizeItems = (items) => {
  return Array.isArray(items) ? items : [];
};

/**
 * Extracts next page token from response
 * @param {*} token - Token to extract
 * @returns {string|null} Valid token or null
 */
const extractNextPageToken = (token) => {
  return token || null;
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  popularMovies: [],
  popularNextPageToken: null,
  categoryMovies: [],
  categoryNextPageToken: null,
  isLoading: false,
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Movies Redux Slice
 * Manages popular and category-filtered videos with pagination
 * Maintains separate collections and page tokens for pagination
 */
const movieSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addPopularMovies Reducer
     * Appends popular videos and updates pagination token
     * @param {Object} state - Current movies state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { items?, nextPageToken? }
     */
    addPopularMovies: (state, action) => {
      const { items = [], nextPageToken } = action.payload;

      if (!isValidPaginationData({ items })) {
        console.warn(`${SLICE_ERROR_PREFIX} Invalid popular movies data`);
        return;
      }

      state.popularMovies = [
        ...state.popularMovies,
        ...sanitizeItems(items),
      ];
      state.popularNextPageToken = extractNextPageToken(nextPageToken);
      state.isLoading = false;
    },

    /**
     * setCategoryMovies Reducer
     * Replaces category movies with new set (for new category)
     * @param {Object} state - Current movies state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { items?, nextPageToken? }
     */
    setCategoryMovies: (state, action) => {
      const { items = [], nextPageToken } = action.payload;

      if (!isValidPaginationData({ items })) {
        console.warn(`${SLICE_ERROR_PREFIX} Invalid category movies data`);
        return;
      }

      state.categoryMovies = sanitizeItems(items);
      state.categoryNextPageToken = extractNextPageToken(nextPageToken);
      state.isLoading = false;
    },

    /**
     * addMoreCategoryMovies Reducer
     * Appends more category videos for pagination
     * @param {Object} state - Current movies state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { items?, nextPageToken? }
     */
    addMoreCategoryMovies: (state, action) => {
      const { items = [], nextPageToken } = action.payload;

      if (!isValidPaginationData({ items })) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid category pagination data`
        );
        return;
      }

      state.categoryMovies = [
        ...state.categoryMovies,
        ...sanitizeItems(items),
      ];
      state.categoryNextPageToken = extractNextPageToken(nextPageToken);
      state.isLoading = false;
    },

    /**
     * setLoading Reducer
     * Updates loading state
     * @param {Object} state - Current movies state
     * @param {Object} action - Redux action
     * @param {boolean} action.payload - Loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    /**
     * resetPopularMovies Reducer
     * Clears popular movies and resets token
     * @param {Object} state - Current movies state
     */
    resetPopularMovies: (state) => {
      state.popularMovies = [];
      state.popularNextPageToken = null;
    },

    /**
     * resetCategoryMovies Reducer
     * Clears category movies and resets token
     * @param {Object} state - Current movies state
     */
    resetCategoryMovies: (state) => {
      state.categoryMovies = [];
      state.categoryNextPageToken = null;
    },
  },
});

export default movieSlice.reducer;
export const {
  addPopularMovies,
  setCategoryMovies,
  addMoreCategoryMovies,
  setLoading,
  resetPopularMovies,
  resetCategoryMovies,
} = movieSlice.actions;