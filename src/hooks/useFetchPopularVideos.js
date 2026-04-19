import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  addPopularMovies,
  setLoading,
  resetPopularMovies,
  resetCategoryMovies,
} from "../store/slices/moviesSlice";
import { API_KEY, YOUTUBE_POPULAR_VIDEOS_API } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchPopularVideos]";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates if fetch should proceed based on category
 * @param {string} category - Video category filter
 * @returns {boolean} True if should fetch popular videos
 */
const shouldFetchPopularVideos = (category) => {
  return category === "All";
};

/**
 * Handles fetch errors and dispatches empty state
 * @param {Error} error - Error object from fetch
 * @param {Function} dispatch - Redux dispatch function
 */
const handleFetchError = (error, dispatch) => {
  console.error(`${HOOK_NAME} Fetch Error:`, error);
  dispatch(addPopularMovies({ items: [], nextPageToken: null }));
};

/**
 * Resets state to initial empty state
 * @param {Function} dispatch - Redux dispatch function
 */
const resetState = (dispatch) => {
  dispatch(resetPopularMovies());
  dispatch(resetCategoryMovies());
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchPopularVideos Hook
 * Fetches popular videos from YouTube API when category is "All"
 * Manages loading state and error handling
 *
 * @param {string} category - Current category filter (only fetches if "All")
 * @returns {void} - Updates Redux store directly
 */
const useFetchPopularVideos = (category) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!shouldFetchPopularVideos(category)) return;

    const fetchPopularVideos = async () => {
      resetState(dispatch);
      dispatch(setLoading(true));

      try {
        const response = await fetch(YOUTUBE_POPULAR_VIDEOS_API + API_KEY);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch popular videos`);
        }

        const data = await response.json();

        dispatch(
          addPopularMovies({
            items: data.items || [],
            nextPageToken: data.nextPageToken || null,
          })
        );
      } catch (error) {
        handleFetchError(error, dispatch);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPopularVideos();
  }, [category, dispatch]);

  return null;
};

export default useFetchPopularVideos;