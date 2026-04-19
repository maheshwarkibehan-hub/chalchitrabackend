import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWatchLater,
  removeFromWatchLater,
} from "../store/slices/watchLaterSlice";
import AuthenticationModal from "./AuthenticationModal";
import { SAVE_IMAGE, SAVE_IMAGE2 } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const TOOLTIP_HIDE_DELAY = 2000;

const getButtonClassName = (isInWatchLater) => {
  const baseClasses = "bg-gray-200 px-3 py-2 cursor-pointer rounded-full text-[12px] flex items-center gap-2 transition-all hover:bg-gray-300";
  if (isInWatchLater) return `${baseClasses} bg-purple-100`;
  return baseClasses;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates payload for adding video to watch later list
 * @param {string} videoId - ID of video to add
 * @param {Object} videoData - Video metadata
 * @returns {Object|null} Formatted payload or null if data invalid
 */
const createWatchLaterPayload = (videoId, videoData) => {
  if (!videoData) {
    console.error("[WatchLaterButton] Missing video data");
    return null;
  }

  return {
    videoId,
    videoData: {
      id: videoId,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      channelTitle: videoData.channelTitle,
      channelId: videoData.channelId,
      publishedAt: videoData.publishedAt,
      description: videoData.description,
    },
  };
};

/**
 * Determines tooltip message based on action
 * @param {boolean} isInWatchLater - Whether video is in watch later
 * @returns {string} Appropriate tooltip message
 */
const getTooltipMessage = (isInWatchLater) => {
  return isInWatchLater ? "Removed from Watch Later" : "Added to Watch Later";
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WatchLaterButton Component
 * Allows authenticated users to add/remove videos from Watch Later list
 * Shows authentication modal if user not logged in
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.videoId - ID of video
 * @param {Object} props.videoData - Video metadata object
 * @returns {React.ReactElement} Watch Later button with auth modal and tooltip
 */
const WatchLaterButton = ({ videoId, videoData }) => {
  const dispatch = useDispatch();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isUserLoggedIn = useSelector((state) => state.user);

  // Check if video is in watch later list
  const isInWatchLater = useSelector(
    (state) => !!state.watchLater.watchLaterVideos[videoId]
  );

  /**
   * Displays tooltip with auto-hide after delay
   */
  const showTemporaryTooltip = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), TOOLTIP_HIDE_DELAY);
  };

  /**
   * Handles watch later action - toggle add/remove
   * Requires user authentication
   */
  const handleWatchLaterClick = () => {
    if (!isUserLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    // Validate video ID
    if (!videoId) {
      console.error("[WatchLaterButton] Missing videoId");
      return;
    }

    if (isInWatchLater) {
      // Remove from watch later
      dispatch(removeFromWatchLater(videoId));
      showTemporaryTooltip();
    } else {
      // Add to watch later
      const payload = createWatchLaterPayload(videoId, videoData);
      if (payload) {
        dispatch(addToWatchLater(payload));
        showTemporaryTooltip();
      }
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleWatchLaterClick}
          className={getButtonClassName(isInWatchLater)}
          type="button"
          aria-label={isInWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
          title={isInWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
        >
          {isInWatchLater ? (
            <img className="w-5" src={SAVE_IMAGE2} alt="Saved" />
          ) : (
            <img className="w-5" src={SAVE_IMAGE} alt="Not saved" />
          )}
          <span className={isInWatchLater ? "font-bold" : ""}>
            {isInWatchLater ? "Saved" : "Save"}
          </span>
        </button>

        {/* Tooltip - shown temporarily after action */}
        {showTooltip && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded whitespace-nowrap z-10">
            {getTooltipMessage(isInWatchLater)}
          </div>
        )}
      </div>

      {/* Authentication Modal - shown when user not logged in */}
      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default WatchLaterButton;
