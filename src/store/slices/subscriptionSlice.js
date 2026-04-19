import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "subscription";
const STORAGE_KEY = "subscriptions";
const SLICE_ERROR_PREFIX = "[subscriptionSlice]";
const TIMESTAMP_KEY = "subscribedAt";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Loads subscriptions from localStorage with error handling
 * @returns {Object} Parsed subscriptions object or empty object if error
 */
const loadSubscriptionsFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error loading subscriptions:`, error);
    return {};
  }
};

/**
 * Saves subscriptions to localStorage with error handling
 * @param {Object} subscriptions - Subscriptions object to save
 */
const saveSubscriptionsToStorage = (subscriptions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error(`${SLICE_ERROR_PREFIX} Error saving subscriptions:`, error);
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  subscribedChannels: loadSubscriptionsFromStorage(), // { channelId: channelData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Subscription Redux Slice
 * Manages subscribed channels with persistent localStorage storage
 * Automatically syncs state changes to localStorage
 */
const subscriptionSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * subscribeChannel Reducer
     * Adds channel to subscriptions with timestamp
     * @param {Object} state - Current subscription state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { channelId, channelData }
     */
    subscribeChannel: (state, action) => {
      const { channelId, channelData } = action.payload;

      state.subscribedChannels[channelId] = {
        ...channelData,
        [TIMESTAMP_KEY]: new Date().toISOString(),
      };

      saveSubscriptionsToStorage(state.subscribedChannels);
    },

    /**
     * unsubscribeChannel Reducer
     * Removes channel from subscriptions
     * @param {Object} state - Current subscription state
     * @param {Object} action - Redux action
     * @param {string|number} action.payload - Channel ID to remove
     */
    unsubscribeChannel: (state, action) => {
      const channelId = action.payload;

      delete state.subscribedChannels[channelId];

      saveSubscriptionsToStorage(state.subscribedChannels);
    },

    /**
     * clearAllSubscriptions Reducer
     * Removes all subscriptions and clears localStorage
     * @param {Object} state - Current subscription state
     */
    clearAllSubscriptions: (state) => {
      state.subscribedChannels = {};
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { subscribeChannel, unsubscribeChannel, clearAllSubscriptions } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;