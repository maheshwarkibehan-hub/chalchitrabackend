import { useEffect, useState } from "react";
import { SINGLE_VIDEO_DETAIL_API } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchSingleVideoData]";
const API_PARTS = "snippet,statistics";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts relevant video data from API response
 * @param {Object} item - Video item from API
 * @returns {Object} Structured video data
 */
const extractVideoData = (item) => {
  return {
    videoId: item?.id,
    snippet: item?.snippet,
    statistics: item?.statistics,
  };
};

/**
 * Handles video fetch errors with context logging
 * @param {Error} error - Error from fetch
 * @param {string} videoId - Video ID being fetched
 */
const handleVideoFetchError = (error, videoId) => {
  console.error(`${HOOK_NAME} Failed to fetch video ${videoId}:`, error);
};

/**
 * Validates API response before extraction
 * @param {Object} json - API response object
 * @returns {Object|null} First video item or null if invalid
 */
const extractFirstItem = (json) => {
  return json?.items?.[0] || null;
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchSingleVideoData Hook
 * Fetches detailed information for a single YouTube video
 * Includes snippet and statistics data
 *
 * @param {string} videoId - YouTube video ID
 * @returns {Object} { data: Object|null, loading: boolean, error: string|null }
 */
function useFetchSingleVideoData(videoId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }

    const fetchSingleVideoData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = SINGLE_VIDEO_DETAIL_API(videoId);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch video`);
        }

        const json = await response.json();
        const item = extractFirstItem(json);

        if (!item) {
          throw new Error("No video data found in response");
        }

        const cleanData = extractVideoData(item);
        setData(cleanData);
      } catch (err) {
        handleVideoFetchError(err, videoId);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleVideoData();
  }, [videoId]);

  return { data, loading, error };
}

export default useFetchSingleVideoData;
