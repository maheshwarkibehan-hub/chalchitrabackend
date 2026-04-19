import { useDispatch } from "react-redux";
import { addMoreCategoryMovies, setLoading } from "../store/slices/moviesSlice";
import { API_KEY } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchNextPageCategoryVideos]";
const SEARCH_API_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const MAX_RESULTS = 25;
const SEARCH_TYPE = "video";
const API_PARTS = "snippet";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates pagination parameters
 * @param {string} nextPageToken - Pagination token
 * @param {string} category - Category name
 * @returns {Object} { isValid: boolean, error: string|null }
 */
const validatePaginationParams = (nextPageToken, category) => {
  if (!nextPageToken) {
    return { isValid: false, error: "Missing pagination token" };
  }
  if (!category) {
    return { isValid: false, error: "Missing category" };
  }
  return { isValid: true, error: null };
};

/**
 * Builds pagination URL with category and token
 * @param {string} category - Category/search query
 * @param {string} nextPageToken - Pagination token
 * @returns {string} Complete API URL
 */
const buildCategoryPaginationUrl = (category, nextPageToken) => {
  const params = new URLSearchParams({
    part: API_PARTS,
    type: SEARCH_TYPE,
    q: category,
    maxResults: MAX_RESULTS,
    pageToken: nextPageToken,
    key: API_KEY,
  });
  return `${SEARCH_API_ENDPOINT}?${params.toString()}`;
};

/**
 * Handles pagination fetch errors
 * @param {Error} error - Error from fetch
 * @param {string} category - Category being paginated
 * @param {Function} dispatch - Redux dispatch
 */
const handlePaginationError = (error, category, dispatch) => {
  console.error(`${HOOK_NAME} Pagination failed for category "${category}":`, error);
  dispatch(setLoading(false));
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchNextPageCategoryVideos Hook
 * Returns function to fetch next page of category videos
 * Used for infinite scroll pagination within categories
 *
 * @returns {Function} Async function(nextPageToken, category) to fetch more videos
 */
const useFetchNextPageCategoryVideos = () => {
  const dispatch = useDispatch();

  /**
   * Fetches next page of category videos
   * @param {string} nextPageToken - Pagination token from previous response
   * @param {string} category - Category name to continue fetching from
   * @returns {Promise<void>}
   */
  const fetchMoreCategoryVideos = async (nextPageToken, category) => {
    const { isValid, error } = validatePaginationParams(nextPageToken, category);

    if (!isValid) {
      console.warn(`${HOOK_NAME} ${error}`);
      return;
    }

    dispatch(setLoading(true));

    try {
      const url = buildCategoryPaginationUrl(category, nextPageToken);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch next page`);
      }

      const data = await response.json();

      dispatch(
        addMoreCategoryMovies({
          items: data.items || [],
          nextPageToken: data.nextPageToken || null,
        })
      );
    } catch (error) {
      handlePaginationError(error, category, dispatch);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return fetchMoreCategoryVideos;
};

export default useFetchNextPageCategoryVideos;