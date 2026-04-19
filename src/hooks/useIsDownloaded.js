import { useSelector } from 'react-redux';

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = '[useDownloads]';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely accesses downloads state
 * @param {Object} state - Redux state
 * @returns {Object} Downloads object or empty object
 */
const getDownloadsState = (state) => {
  return state?.downloads?.downloadedVideos || {};
};

/**
 * Converts object to sorted array
 * @param {Object} downloadsObj - Downloads object
 * @returns {Array} Sorted array of downloads
 */
const sortDownloadsByDate = (downloadsObj) => {
  return Object.values(downloadsObj).sort((a, b) => 
    new Date(b.downloadedAt) - new Date(a.downloadedAt)
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * useIsDownloaded Hook
 * Checks if a specific video is already downloaded
 *
 * @param {string} videoId - YouTube video ID to check
 * @returns {boolean} True if video is downloaded, false otherwise
 */
export const useIsDownloaded = (videoId) => {
  return useSelector(state => {
    const downloadsObj = getDownloadsState(state);
    return !!downloadsObj[videoId];
  });
};

/**
 * useDownloadInfo Hook
 * Retrieves complete download information for a video
 *
 * @param {string} videoId - YouTube video ID
 * @returns {Object|null} Download data object or null if not downloaded
 */
export const useDownloadInfo = (videoId) => {
  return useSelector(state => {
    const downloadsObj = getDownloadsState(state);
    return downloadsObj[videoId] || null;
  });
};

/**
 * useAllDownloads Hook
 * Retrieves all downloaded videos sorted by date (newest first)
 *
 * @returns {Array} Array of all downloaded videos, sorted by date
 */
export const useAllDownloads = () => {
  return useSelector(state => {
    const downloadsObj = getDownloadsState(state);
    return sortDownloadsByDate(downloadsObj);
  });
};

/**
 * useDownloadsCount Hook
 * Gets total number of downloaded videos
 *
 * @returns {number} Total count of downloaded videos
 */
export const useDownloadsCount = () => {
  return useSelector(state => {
    const downloadsObj = getDownloadsState(state);
    return Object.keys(downloadsObj).length;
  });
};