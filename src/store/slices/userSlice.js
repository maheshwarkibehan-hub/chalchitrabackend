import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

const SLICE_NAME = "user";

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = null; // null when no user logged in

// ============================================================================
// SLICE
// ============================================================================

/**
 * User Redux Slice
 * Manages authenticated user state (login/logout)
 * Stores user object with uid, firstName, and email when logged in
 */
const userSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    /**
     * addUser Reducer
     * Stores user data when authentication succeeds
     * @param {null|Object} state - Current user state
     * @param {Object} action - Redux action
     * @param {Object} action.payload - User object { uid, firstName, email }
     * @returns {Object} New user state
     */
    addUser: (state, action) => {
      return action.payload;
    },

    /**
     * removeUser Reducer
     * Clears user data on logout
     * @param {Object} state - Current user state
     * @returns {null} Null state for logged out user
     */
    removeUser: (state) => {
      return null;
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
