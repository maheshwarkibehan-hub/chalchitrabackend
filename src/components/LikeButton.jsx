/**
 * LikeButton Component
 *
 * Allows authenticated users to like/unlike videos.
 * Shows like count and opens auth modal if user not logged in.
 *
 * @param {string} videoId - YouTube video ID
 * @param {object} videoData - Video metadata to save with like
 * @param {string} likeCount - Current video like count
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { likeVideo, unlikeVideo } from "../store/slices/likedSlice";
import { formatViews } from "../utils/constants";
import AuthenticationModal from "./AuthenticationModal";

// CSS class constants
const BUTTON_BASE_CLASSES =
  "px-4 py-1 cursor-pointer rounded-full text-[12px] flex items-center gap-2 transition-all";
const LIKED_CLASSES = "bg-blue-100";
const UNLIKED_CLASSES = "bg-gray-200 hover:bg-gray-300";

/**
 * Create video payload for like action
 */
function createVideoLikePayload(videoId, videoData, likeCount) {
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
      likeCount,
    },
  };
}

/**
 * Validate required data before liking
 */
function validateLikeData(videoId, videoData) {
  if (!videoId) {
    console.error("[LikeButton] Missing videoId");
    return false;
  }
  if (!videoData) {
    console.error("[LikeButton] Missing video data");
    return false;
  }
  return true;
}

function LikeButton({ videoId, videoData, likeCount }) {
  const dispatch = useDispatch();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isVideoLiked = useSelector((state) => !!state.liked.likedVideos[videoId]);
  const isUserLoggedIn = useSelector((state) => state.user);

  /**
   * Handle like action or show auth modal if not logged in
   */
  const handleLikeClick = () => {
    if (!isUserLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (isVideoLiked) {
      dispatch(unlikeVideo(videoId));
    } else {
      if (!validateLikeData(videoId, videoData)) return;
      const payload = createVideoLikePayload(videoId, videoData, likeCount);
      dispatch(likeVideo(payload));
    }
  };

  const buttonClasses = `${BUTTON_BASE_CLASSES} ${
    isVideoLiked ? LIKED_CLASSES : UNLIKED_CLASSES
  }`;

  return (
    <>
      <button onClick={handleLikeClick} className={buttonClasses}>
        <i
          className={`text-lg transition-all ${
            isVideoLiked
              ? "ri-thumb-up-fill text-black-600"
              : "ri-thumb-up-line text-gray-700"
          }`}
        />
        <span className={isVideoLiked ? "text-black-600 font-bold" : ""}>
          {likeCount ? formatViews(likeCount) : "Like"}
        </span>
      </button>
      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

export default LikeButton;
