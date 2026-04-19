import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setCategoryMovies,
  setLoading,
  resetCategoryMovies,
  resetPopularMovies,
} from "../store/slices/moviesSlice";
import { API_KEY } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchCategoryVideos]";
const SEARCH_API_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const MAX_RESULTS = 25;
const SEARCH_TYPE = "video";
const API_PARTS = "snippet";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates if category videos should be fetched
 * @param {string} category - Category name
 * @returns {boolean} True if not "All" category
 */
const shouldFetchCategoryVideos = (category) => {
  return category !== "All";
};

/**
 * Builds search API URL with category parameters
 * @param {string} category - Category/search query
 * @returns {string} Complete API URL
 */
const buildCategorySearchUrl = (category) => {
  const params = new URLSearchParams({
    part: API_PARTS,
    type: SEARCH_TYPE,
    q: category,
    maxResults: MAX_RESULTS,
    key: API_KEY,
  });
  return `${SEARCH_API_ENDPOINT}?${params.toString()}`;
};

/**
 * Handles fetch errors and dispatches empty state
 * @param {Error} error - Error from fetch
 * @param {string} category - Category being fetched
 * @param {Function} dispatch - Redux dispatch
 */
const handleFetchError = (error, category, dispatch) => {
  console.error(`${HOOK_NAME} Failed to fetch category "${category}":`, error);
  dispatch(setCategoryMovies({ items: [], nextPageToken: null }));
};

/**
 * Resets state to initial empty state
 * @param {Function} dispatch - Redux dispatch
 */
const resetState = (dispatch) => {
  dispatch(resetCategoryMovies());
  dispatch(resetPopularMovies());
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchCategoryVideos Hook
 * Fetches YouTube videos for a specific category
 * Clears previous category and popular videos data
 *
 * @param {string} category - Category name to search for
 * @returns {void} - Updates Redux store directly
 */
const useFetchCategoryVideos = (category) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!shouldFetchCategoryVideos(category)) return;

    const fetchVideos = async () => {
      resetState(dispatch);
      dispatch(setLoading(true));

      try {
        const url = buildCategorySearchUrl(category);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch category videos`);
        }

        const data = await response.json();

        dispatch(
          setCategoryMovies({
            items: data.items || [],
            nextPageToken: data.nextPageToken || null,
          })
        );
      } catch (error) {
        handleFetchError(error, category, dispatch);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchVideos();
  }, [category, dispatch]);

  return null;
};

export default useFetchCategoryVideos;