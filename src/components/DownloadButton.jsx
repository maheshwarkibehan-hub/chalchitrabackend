import React from 'react';
import { useVideoDownload } from '../hooks/useVideoDownload';
import { useSelector } from 'react-redux';

// ============================================================================
// CONSTANTS & STYLES
// ============================================================================

const BUTTON_DISABLED_CLASS = 'cursor-not-allowed';
const BUTTON_ACTIVE_CLASS = 'cursor-pointer';

const getButtonClassName = (isDownloaded, isDownloading) => {
  const baseClasses = "relative overflow-hidden px-4 py-3 rounded-full font-semibold text-[10px] flex items-center gap-2 transition-colors";
  
  if (isDownloaded) return `${baseClasses} bg-green-200 ${BUTTON_DISABLED_CLASS}`;
  if (isDownloading) return `${baseClasses} bg-gray-200 ${BUTTON_DISABLED_CLASS}`;
  return `${baseClasses} bg-gray-200 hover:bg-gray-300 ${BUTTON_ACTIVE_CLASS}`;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Renders appropriate button content based on download state
 * @param {boolean} isDownloaded - Whether video is already downloaded
 * @param {boolean} isDownloading - Whether download is in progress
 * @param {number} progress - Download progress percentage (0-100)
 * @returns {React.ReactElement} Button content
 */
const renderButtonContent = (isDownloaded, isDownloading, progress) => {
  if (isDownloaded) {
    return (
      <>
        <i className="ri-check-line"></i>
        Downloaded
      </>
    );
  }

  if (isDownloading) {
    return <>{progress}%</>;
  }

  return (
    <>
      <i className="ri-download-line"></i>
      Download
    </>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DownloadButton Component
 * Handles video download with progress tracking
 * Shows download percentage while in progress, and checkmark when complete
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.videoId - ID of video to download
 * @param {Object} props.videoData - Video metadata containing title, url, etc
 * @returns {React.ReactElement} Download button with progress bar and error display
 */
const DownloadButton = ({ videoId, videoData }) => {
  const { downloading, progress, error, downloadVideo } = useVideoDownload(videoData);
  
  const isDownloaded = useSelector(state => !!state.downloads?.downloadedVideos?.[videoId]);

  /**
   * Handles download button click
   * Prevents default event propagation and initiates download
   */
  const handleDownloadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDownloaded && !downloading) {
      downloadVideo(videoId);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDownloadClick}
        disabled={downloading || isDownloaded}
        className={getButtonClassName(isDownloaded, downloading)}
        aria-label={isDownloaded ? "Video downloaded" : "Download video"}
        title={isDownloaded ? "Downloaded" : "Download video"}
      >
        {downloading && (
          <div 
            className="absolute left-0 top-0 h-full bg-blue-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        )}
        
        <span className="relative z-10 flex items-center gap-2">
          {renderButtonContent(isDownloaded, downloading, progress)}
        </span>
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default DownloadButton;