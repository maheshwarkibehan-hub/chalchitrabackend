import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "sidebar";
const SLICE_ERROR_PREFIX = "[sideBarToggleSlice]";
const DEFAULT_SIDEBAR_STATE = true;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  isSidebarOpen: DEFAULT_SIDEBAR_STATE,
};

// ============================================================================
// SLICE
// ============================================================================

/**
 * Sidebar Toggle Redux Slice
 * Manages sidebar open/closed state
 * Persists UI state for responsive navigation
 */
const sideBarSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * toggleSidebar Reducer
     * Toggles sidebar open/closed state
     * @param {Object} state - Current sidebar state
     */
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    /**
     * closeSideBar Reducer
     * Closes sidebar
     * @param {Object} state - Current sidebar state
     */
    closeSideBar: (state) => {
      state.isSidebarOpen = false;
    },
  },
});

export const { toggleSidebar, closeSideBar } = sideBarSlice.actions;
export default sideBarSlice.reducer;
