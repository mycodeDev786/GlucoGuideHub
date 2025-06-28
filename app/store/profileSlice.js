// store/profileSlice.js
import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profileData: null, // { bio, occupation, socialLinks, etc. }
    loading: false,
    error: null,
  },
  reducers: {
    setProfileData: (state, action) => {
      state.profileData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProfileLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProfileError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProfile: (state) => {
      state.profileData = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setProfileData,
  setProfileLoading,
  setProfileError,
  clearProfile,
} = profileSlice.actions;
export default profileSlice.reducer;
