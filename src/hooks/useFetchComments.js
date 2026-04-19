import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComments, setLoading } from "../store/slices/commentsSlice";
import { API_KEY } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useComments]";
const COMMENTS_API_ENDPOINT = "https://youtube.googleapis.com/youtube/v3/commentThreads";
const MAX_RESULTS = 100;
const API_PARTS = "snippet,replies";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates if fetch should proceed
 * @param {string} videoId - Video ID to validate
 * @param {Object} storedComments - Already fetched comments
 * @returns {boolean} True if should fetch
 */
const shouldFetchComments = (videoId, storedComments) => {
  if (!videoId) return false;
  if (storedComments && storedComments[videoId]) return false;
  return true;
};

/**
 * Builds comments API URL with parameters
 * @param {string} videoId - YouTube video ID
 * @returns {string} Complete API URL
 */
const buildCommentsApiUrl = (videoId) => {
  const params = new URLSearchParams({
    part: API_PARTS,
    videoId,
    maxResults: MAX_RESULTS,
    key: API_KEY,
  });
  return `${COMMENTS_API_ENDPOINT}?${params.toString()}`;
};

/**
 * Handles comments fetch errors
 * @param {Error} error - Error from fetch
 * @param {string} videoId - Video ID being fetched
 * @param {Function} dispatch - Redux dispatch
 */
const handleCommentsFetchError = (error, videoId, dispatch) => {
  console.error(`${HOOK_NAME} Failed to fetch comments for video ${videoId}:`, error);
  dispatch(setLoading(false));
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useComments Hook
 * Fetches YouTube video comments with thread replies
 * Caches results in Redux to avoid duplicate API calls
 *
 * @param {string} videoId - YouTube video ID
 * @returns {Object} { comments: Array|null, isLoading: boolean }
 */
export function useComments(videoId) {
  const dispatch = useDispatch();
  const storedComments = useSelector((state) => state.comments.storeComments);
  const isLoading = useSelector((state) => state.comments.isLoading);

  useEffect(() => {
    if (!shouldFetchComments(videoId, storedComments)) return;

    const fetchComments = async () => {
      try {
        dispatch(setLoading(true));

        const url = buildCommentsApiUrl(videoId);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch comments`);
        }

        const json = await response.json();

        if (!json.items) {
          console.warn(`${HOOK_NAME} No comments found for video: ${videoId}`);
          dispatch(setLoading(false));
          return;
        }

        dispatch(
          addComments({
            videoId,
            data: json,
          })
        );
      } catch (error) {
        handleCommentsFetchError(error, videoId, dispatch);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchComments();
  }, [videoId, dispatch, storedComments]);

  return {
    comments: storedComments?.[videoId] || null,
    isLoading,
  };
}

