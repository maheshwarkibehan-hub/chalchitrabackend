import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSearchResults, setLoading } from "../store/slices/searchSlice";
import { API_KEY } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchSearchResults]";
const SEARCH_API_ENDPOINT = "https://youtube.googleapis.com/youtube/v3/search";
const MAX_RESULTS = 25;
const API_PARTS = "snippet";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates search query before fetching
 * @param {string} searchQuery - Search query string
 * @returns {boolean} True if query is valid (non-empty)
 */
const isValidSearchQuery = (searchQuery) => {
  return !!searchQuery?.trim();
};

/**
 * Builds search API URL with query parameters
 * @param {string} searchQuery - Search query term
 * @returns {string} Complete API URL
 */
const buildSearchUrl = (searchQuery) => {
  const params = new URLSearchParams({
    part: API_PARTS,
    maxResults: MAX_RESULTS,
    q: searchQuery,
    key: API_KEY,
  });
  return `${SEARCH_API_ENDPOINT}?${params.toString()}`;
};

/**
 * Handles search fetch errors
 * @param {Error} error - Error from fetch
 * @param {string} searchQuery - Query that failed
 * @param {Function} dispatch - Redux dispatch
 */
const handleSearchError = (error, searchQuery, dispatch) => {
  console.error(`${HOOK_NAME} Search failed for query "${searchQuery}":`, error);
  dispatch(setSearchResults([]));
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchSearchResults Hook
 * Searches YouTube videos by query term
 * Updates Redux store with search results
 *
 * @param {string} searchQuery - Search query string
 * @returns {void} - Updates Redux store directly
 */
const useFetchSearchResults = (searchQuery) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isValidSearchQuery(searchQuery)) {
      dispatch(setSearchResults([]));
      return;
    }

    const fetchSearchResults = async () => {
      dispatch(setLoading(true));

      try {
        const url = buildSearchUrl(searchQuery);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch search results`);
        }

        const data = await response.json();
        dispatch(setSearchResults(data.items || []));
      } catch (error) {
        handleSearchError(error, searchQuery, dispatch);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchSearchResults();
  }, [searchQuery, dispatch]);

  return null;
};

export default useFetchSearchResults;
