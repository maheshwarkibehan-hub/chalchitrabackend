import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addChannelData } from "../store/slices/channelSlice";
import { API_KEY } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useChannel]";
const CHANNEL_API_ENDPOINT = "https://youtube.googleapis.com/youtube/v3/channels";
const CHANNEL_API_PARTS = "snippet,statistics";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Builds channel API URL with necessary parameters
 * @param {string} channelId - YouTube channel ID
 * @returns {string} Complete API URL
 */
const buildChannelApiUrl = (channelId) => {
  const params = new URLSearchParams({
    part: CHANNEL_API_PARTS,
    id: channelId,
    key: API_KEY,
  });
  return `${CHANNEL_API_ENDPOINT}?${params.toString()}`;
};

/**
 * Extracts relevant channel data from API response
 * @param {Object} item - Channel data item from API
 * @returns {Object|null} Structured channel data or null if invalid
 */
const extractChannelData = (item) => {
  if (!item) return null;

  return {
    id: item.id,
    snippet: item.snippet,
    statistics: item.statistics,
  };
};

/**
 * Handles channel fetch errors with context logging
 * @param {Error} error - Error from fetch
 * @param {string} channelId - Channel ID being fetched
 */
const handleChannelFetchError = (error, channelId) => {
  console.error(`${HOOK_NAME} Failed to fetch channel ${channelId}:`, error);
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useChannel Hook
 * Fetches and caches YouTube channel data
 * Only fetches if channel data not already in Redux store
 *
 * @param {string} channelId - YouTube channel ID to fetch
 * @returns {void} - Updates Redux store with channel data
 */
export function useChannel(channelId) {
  const dispatch = useDispatch();
  const storedChannel = useSelector(
    (state) => state.channel.channels[channelId]
  );

  useEffect(() => {
    // Skip if no channel ID provided
    if (!channelId) return;

    // Skip if channel already cached in Redux
    if (storedChannel) return;

    const fetchChannel = async () => {
      try {
        const url = buildChannelApiUrl(channelId);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch channel`);
        }

        const json = await response.json();
        const channelItem = json.items?.[0];

        if (!channelItem) {
          console.warn(`${HOOK_NAME} No channel data found for ID: ${channelId}`);
          return;
        }

        const channelData = extractChannelData(channelItem);
        if (channelData) {
          dispatch(addChannelData(channelData));
        }
      } catch (error) {
        handleChannelFetchError(error, channelId);
      }
    };

    fetchChannel();
  }, [channelId, dispatch, storedChannel]);
}

