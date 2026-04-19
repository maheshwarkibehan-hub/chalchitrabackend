import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  subscribeChannel,
  unsubscribeChannel,
} from "../store/slices/subscriptionSlice";
import AuthenticationModal from "../components/AuthenticationModal";
import ConfirmationModal from "../components/ConfirmationModal";

// ============================================================================
// STYLES & CONSTANTS
// ============================================================================

const getButtonClassName = (isSubscribed, isDisabled) => {
  const baseClasses = "px-4 py-2 rounded-full text-[10px] cursor-pointer font-semibold transition-all duration-200";
  
  if (isDisabled) return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
  if (isSubscribed) return `${baseClasses} bg-gray-200 text-black hover:bg-gray-300`;
  return `${baseClasses} bg-black text-white hover:bg-gray-800`;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts channel subscription payload from channel info
 * @param {string} channelId - Channel ID to subscribe to
 * @param {Object} channelInfo - Channel metadata object
 * @returns {Object} Formatted subscription payload
 */
const createSubscriptionPayload = (channelId, channelInfo) => {
  if (!channelInfo?.snippet) {
    console.error("[SubscribeButton] Channel info missing snippet data");
    return null;
  }

  return {
    channelId,
    channelData: {
      id: channelId,
      title: channelInfo.snippet.title,
      thumbnail:
        channelInfo.snippet.thumbnails?.medium?.url ||
        channelInfo.snippet.thumbnails?.default?.url,
      subscriberCount: channelInfo.statistics?.subscriberCount || "0",
      description: channelInfo.snippet.description || "",
    },
  };
};

/**
 * Validates required data for subscription action
 * @param {string} channelId - Channel to validate
 * @param {Object} channelInfo - Channel metadata to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
const validateSubscriptionData = (channelId, channelInfo) => {
  if (!channelId) {
    return { isValid: false, error: "[SubscribeButton] Missing channelId" };
  }

  if (!channelInfo?.snippet) {
    return { isValid: false, error: "[SubscribeButton] Channel data not loaded yet" };
  }

  return { isValid: true, error: null };
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SubscribeButton Component
 * Handles channel subscription/unsubscription with authentication and confirmation flows
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.channelId - ID of channel to subscribe to
 * @param {Object} props.channelInfo - Channel metadata containing title, thumbnail, etc
 * @returns {React.ReactElement} Subscribe button with modal dialogs
 */
const SubscribeButton = ({ channelId, channelInfo }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isUserLoggedIn = useSelector((state) => state.user);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check if user is on subscriptions page
  const isSubscriptionsPage = location.pathname === "/subscriptions";

  // Check if user is subscribed to this channel
  const isSubscribed = useSelector(
    (state) => !!state.subscription.subscribedChannels[channelId]
  );

  // Disable button if channel data hasn't loaded yet for subscribe action
  const isDisabled = !isSubscribed && (!channelId || !channelInfo?.snippet);

  /**
   * Handles unsubscribe action and closes confirmation modal
   */
  const handleUnsubscribeClick = () => {
    dispatch(unsubscribeChannel(channelId));
    setShowConfirmModal(false);
  };

  /**
   * Main subscription handler - manages subscribe/unsubscribe flow
   * Checks auth status, validation, and subscription state
   */
  const handleSubscribeClick = () => {
    // Redirect to auth if not logged in
    if (!isUserLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    // Validate channel ID exists
    if (!channelId) {
      console.error("[SubscribeButton] Missing channelId");
      return;
    }

    // Handle unsubscribe action
    if (isSubscribed) {
      // Show confirmation on subscriptions page, direct unsubscribe elsewhere
      if (isSubscriptionsPage) {
        setShowConfirmModal(true);
      } else {
        dispatch(unsubscribeChannel(channelId));
      }
    } else {
      // Handle subscribe action
      const { isValid, error } = validateSubscriptionData(channelId, channelInfo);
      
      if (!isValid) {
        console.error(error);
        return;
      }

      const payload = createSubscriptionPayload(channelId, channelInfo);
      if (payload) {
        dispatch(subscribeChannel(payload));
      }
    }
  };

  /**
   * Renders button content based on subscription state
   */
  const renderButtonContent = () => {
    if (isDisabled) {
      return <>
        <i className="animate-spin mr-1"></i>
      </>;
    }

    if (isSubscribed) {
      return <>
        <i className="ri-check-line mr-1"></i>
        Subscribed
      </>;
    }

    return "Subscribe";
  };

  return (
    <>
      <button
        onClick={handleSubscribeClick}
        disabled={isDisabled}
        className={getButtonClassName(isSubscribed, isDisabled)}
        title={isSubscribed ? "Unsubscribe" : "Subscribe"}
      >
        {renderButtonContent()}
      </button>

      {/* Authentication Modal - shown when user tries to subscribe without login */}
      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Confirmation Modal - shown when unsubscribing from subscriptions page */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleUnsubscribeClick}
        title="Unsubscribe?"
        message={`Are you sure you want to unsubscribe from ${
          channelInfo?.snippet?.title || "this channel"
        }?`}
        cancelLabel="Cancel"
        confirmLabel="Unsubscribe"
      />
    </>
  );
};

export default SubscribeButton;
