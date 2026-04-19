import { useState } from "react";
import { useDispatch } from "react-redux";
import { addDownload } from "../store/slices/downloadsSlice";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useVideoDownload]";
const API_BASE = "http://localhost:5000/api";
const DOWNLOAD_ENDPOINT = "/download";
const COMPLETION_DELAY = 2000; // milliseconds to reset after download
const STREAM_EVENT_TYPES = {
  PROGRESS: "progress",
  COMPLETE: "complete",
  ERROR: "error",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates download parameters
 * @param {string} videoId - Video ID to download
 * @param {Object} videoData - Video metadata
 * @returns {Object} { isValid: boolean, error: string|null }
 */
const validateDownloadParams = (videoId, videoData) => {
  if (!videoId) {
    return { isValid: false, error: "Missing videoId" };
  }
  if (!videoData) {
    return { isValid: false, error: "Missing videoData" };
  }
  return { isValid: true, error: null };
};

/**
 * Parses streaming response chunks
 * @param {string} chunk - Raw text chunk from stream
 * @returns {Object|null} Parsed JSON or null if invalid
 */
const parseStreamChunk = (chunk) => {
  try {
    return JSON.parse(chunk);
  } catch (err) {
    console.warn(`${HOOK_NAME} Failed to parse stream chunk:`, chunk);
    return null;
  }
};

/**
 * Triggers browser download for file
 * @param {string} downloadUrl - URL of file to download
 * @param {string} filename - Name for downloaded file
 */
const triggerBrowserDownload = (downloadUrl, filename) => {
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename || "video.mp4";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Saves download info to Redux store
 * @param {string} videoId - Video ID
 * @param {Object} videoData - Video metadata
 * @param {string} filename - Downloaded filename
 * @param {Function} dispatch - Redux dispatch
 */
const saveDownloadToStore = (videoId, videoData, filename, dispatch) => {
  dispatch(
    addDownload({
      videoId,
      videoData: {
        ...videoData,
        filename,
      },
      downloadedAt: new Date().toISOString(),
    })
  );
};

/**
 * Handles download errors with context logging
 * @param {Error} error - Error object
 * @param {string} videoId - Video being downloaded
 * @param {Function} setError - Error state setter
 */
const handleDownloadError = (error, videoId, setError) => {
  const errorMessage = error.message || "Download failed";
  console.error(`${HOOK_NAME} Download failed for video ${videoId}:`, error);
  setError(errorMessage);
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useVideoDownload Hook
 * Manages video download with progress tracking
 * Handles streaming response parsing and file downloads
 *
 * @param {Object} videoData - Video metadata object
 * @returns {Object} { downloading: boolean, progress: number, error: string|null, downloadVideo: Function, reset: Function }
 */
export const useVideoDownload = (videoData) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  /**
   * Initiates video download with streaming progress
   * @param {string} videoId - YouTube video ID to download
   * @returns {Promise<void>}
   */
  const downloadVideo = async (videoId) => {
    // Validate parameters
    const { isValid, error: validationError } = validateDownloadParams(
      videoId,
      videoData
    );

    if (!isValid) {
      console.error(`${HOOK_NAME}`, validationError);
      setError(validationError);
      return;
    }

    setDownloading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${DOWNLOAD_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, quality: "best" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Download request failed`);
      }

      // Parse streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          const data = parseStreamChunk(line);
          if (!data) continue;

          switch (data.type) {
            case STREAM_EVENT_TYPES.PROGRESS:
              setProgress(Math.round(data.progress));
              break;

            case STREAM_EVENT_TYPES.COMPLETE:
              if (data.success) {
                setProgress(100);

                // Construct download URL
                const baseURL = API_BASE.replace("/api", "");
                const downloadURL = `${baseURL}${data.downloadUrl}`;

                // Trigger browser download
                triggerBrowserDownload(downloadURL, data.filename);

                // Save to Redux store
                saveDownloadToStore(
                  videoId,
                  videoData,
                  data.filename,
                  dispatch
                );

                // Reset state after delay
                setTimeout(() => {
                  setDownloading(false);
                  setProgress(0);
                }, COMPLETION_DELAY);
              } else {
                throw new Error(data.message || "Download failed on server");
              }
              break;

            case STREAM_EVENT_TYPES.ERROR:
              throw new Error(data.message || "Server error during download");
          }
        }
      }
    } catch (err) {
      handleDownloadError(err, videoId, setError);
      setDownloading(false);
      setProgress(0);
    }
  };

  /**
   * Resets download state to initial values
   */
  const reset = () => {
    setDownloading(false);
    setProgress(0);
    setError(null);
  };

  return {
    downloading,
    progress,
    error,
    downloadVideo,
    reset,
  };
};
