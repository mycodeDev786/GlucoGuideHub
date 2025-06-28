// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    stayLoggedIn: false,
    user: null, // This will now store a plain object with selected user properties
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    setStayLoggedIn: (state, action) => {
      state.stayLoggedIn = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    setUser: (state, action) => {
      const firebaseUser = action.payload;

      // Ensure firebaseUser is a truthy object and not an empty object
      // Firebase User objects usually have a 'uid' property
      if (
        firebaseUser &&
        typeof firebaseUser === "object" &&
        Object.keys(firebaseUser).length > 0 &&
        firebaseUser.uid
      ) {
        state.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          // Add any other simple, serializable properties you need
        };
        state.isAuthenticated = true;
      } else {
        // If firebaseUser is null, undefined, or an empty object,
        // or doesn't have a UID (indicating it's not a valid user object)
        state.user = null;
        state.isAuthenticated = false;
        console.warn(
          "setUser was called with an invalid or empty user payload:",
          firebaseUser
        );
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.stayLoggedIn = false;
    },
  },
});

export const {
  setStayLoggedIn,
  setAuthLoading,
  setAuthError,
  setUser,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
