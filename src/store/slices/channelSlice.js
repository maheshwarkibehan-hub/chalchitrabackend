import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "channel";
const SLICE_ERROR_PREFIX = "[channelSlice]";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates channel data structure
 * @param {Object} data - Channel data to validate
 * @returns {boolean} Whether data is valid
 */
const isValidChannelData = (data) => {
  return data && (data.id || data.snippet || data.statistics);
};

/**
 * Merges channel data with existing data
 * Preserves old data while updating with new values
 * @param {Object} existingData - Existing channel data
 * @param {Object} newData - New channel data
 * @returns {Object} Merged channel data
 */
const mergeChannelData = (existingData, newData) => {
  return {
    ...existingData,
    snippet: newData.snippet || existingData?.snippet,
    statistics: newData.statistics || existingData?.statistics,
  };
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  channels: {}, // { channelId: channelData }
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Channel Redux Slice
 * Manages cached channel metadata (snippet, statistics)
 * Preserves existing data when updating with new information
 */
const channelSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addChannelData Reducer
     * Adds or updates channel data with merge functionality
     * Preserves existing data while adding new snippet/statistics
     * @param {Object} state - Current channel state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - { id, snippet?, statistics? }
     */
    addChannelData: (state, action) => {
      const { id, snippet, statistics } = action.payload;

      if (!isValidChannelData(action.payload)) {
        console.warn(
          `${SLICE_ERROR_PREFIX} Invalid channel data received for ID: ${id}`
        );
        return;
      }

      state.channels[id] = mergeChannelData(state.channels[id], {
        snippet,
        statistics,
      });
    },
  },
});

export const { addChannelData } = channelSlice.actions;
export default channelSlice.reducer;
