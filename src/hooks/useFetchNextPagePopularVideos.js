import { useDispatch } from "react-redux";
import { addPopularMovies, setLoading } from "../store/slices/moviesSlice";
import { API_KEY } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchNextPagePopularVideos]";
const POPULAR_VIDEOS_API = "https://youtube.googleapis.com/youtube/v3/videos";
const CHART_TYPE = "mostPopular";
const REGION_CODE = "PK";
const MAX_RESULTS = 50;
const API_PARTS = "snippet,contentDetails,statistics";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates pagination token
 * @param {string} nextPageToken - Pagination token from API
 * @returns {boolean} True if token is valid
 */
const isValidPageToken = (nextPageToken) => {
  return !!nextPageToken;
};

/**
 * Builds pagination URL for popular videos
 * @param {string} nextPageToken - Next page token from previous response
 * @returns {string} Complete API URL
 */
const buildPaginationUrl = (nextPageToken) => {
  const params = new URLSearchParams({
    part: API_PARTS,
    chart: CHART_TYPE,
    maxResults: MAX_RESULTS,
    regionCode: REGION_CODE,
    pageToken: nextPageToken,
    key: API_KEY,
  });
  return `${POPULAR_VIDEOS_API}?${params.toString()}`;
};

/**
 * Handles pagination fetch errors
 * @param {Error} error - Error from fetch
 * @param {Function} dispatch - Redux dispatch
 */
const handlePaginationError = (error, dispatch) => {
  console.error(`${HOOK_NAME} Pagination fetch failed:`, error);
  dispatch(setLoading(false));
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchNextPagePopularVideos Hook
 * Returns function to fetch next page of popular videos
 * Used for infinite scroll pagination
 *
 * @returns {Function} Async function(nextPageToken) to fetch more popular videos
 */
const useFetchNextPagePopularVideos = () => {
  const dispatch = useDispatch();

  /**
   * Fetches next page of popular videos
   * @param {string} nextPageToken - Pagination token from previous response
   * @returns {Promise<void>}
   */
  const fetchMorePopularVideos = async (nextPageToken) => {
    if (!isValidPageToken(nextPageToken)) {
      console.warn(`${HOOK_NAME} Invalid page token received`);
      return;
    }

    dispatch(setLoading(true));

    try {
      const url = buildPaginationUrl(nextPageToken);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch next page`);
      }

      const data = await response.json();

      dispatch(
        addPopularMovies({
          items: data.items || [],
          nextPageToken: data.nextPageToken || null,
        })
      );
    } catch (error) {
      handlePaginationError(error, dispatch);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return fetchMorePopularVideos;
};

export default useFetchNextPagePopularVideos;