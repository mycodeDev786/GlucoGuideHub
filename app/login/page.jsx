// app/login/page.jsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { app } from "../lib/firebaseConfig";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";
import { useRouter } from "next/navigation";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import {
  setStayLoggedIn,
  setAuthLoading,
  setAuthError,
  setUser,
  logout as authLogout,
} from "../store/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);

  const router = useRouter();
  const auth = getAuth(app);

  const dispatch = useDispatch();
  const { stayLoggedIn, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const savedStayLoggedIn = localStorage.getItem("stayLoggedIn");
    if (savedStayLoggedIn) {
      dispatch(setStayLoggedIn(JSON.parse(savedStayLoggedIn))); // Update Redux state from localStorage
    }
  }, [dispatch]); // Add dispatch to dependency array

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setAuthError(null));
    dispatch(setAuthLoading(true));

    try {
      await setPersistence(
        auth,
        stayLoggedIn ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // This is the crucial line:
      // Ensure userCredential.user is not an empty object {} before dispatching
      // If it's a valid Firebase User, it will have a 'uid' property.
      if (userCredential && userCredential.user) {
        const user = userCredential.user;
        const serializedUser = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
        };

        dispatch(setUser(serializedUser));

        // Save stayLoggedIn preference to localStorage AFTER successful login
        localStorage.setItem("stayLoggedIn", JSON.stringify(stayLoggedIn));
      } else {
        // This case should ideally not happen with signInWithEmailAndPassword success
        console.warn(
          "Login successful but userCredential.user was null or invalid.",
          userCredential
        );
        dispatch(setAuthError("Login successful but user data was not found."));
        // Maybe dispatch setUser(null) or a specific action to clear user state
        dispatch(setUser(null)); // Explicitly clear user if something went wrong
      }

      console.log("User logged in successfully!");
      router.push("/");
    } catch (firebaseError) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      switch (firebaseError.code) {
        case "auth/invalid-email":
          errorMessage = "The email address is not valid.";
          break;
        case "auth/user-not-found":
          errorMessage = "No user found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid login credentials.";
          break;
        default:
          errorMessage = ` login error: ${firebaseError.message}`; // More specific error message
          console.error("Firebase login error:", firebaseError.message);
      }
      dispatch(setAuthError(errorMessage));
      // In case of error, ensure user state is cleared
      dispatch(setUser(null));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <Loader isLoading={loading} />
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
        Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            type={passwordShown ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {passwordShown ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </span>
        </div>

        <div className="flex items-center">
          <input
            id="stayLoggedIn"
            name="stayLoggedIn"
            type="checkbox"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            checked={stayLoggedIn}
            onChange={(e) => dispatch(setStayLoggedIn(e.target.checked))}
          />
          <label
            htmlFor="stayLoggedIn"
            className="ml-2 block text-sm text-gray-900"
          >
            Stay logged in
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Login
        </button>
        <div className="flex justify-between text-sm mt-2">
          <Link href="/signup" className="text-purple-600 hover:underline">
            Sign Up
          </Link>
          <Link
            href="/forgot-password"
            className="text-purple-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}
