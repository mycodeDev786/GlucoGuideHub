"use client";

import Link from "next/link";
import { useState } from "react";
// Import Firebase auth
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// You'll need to set up your Firebase configuration file
import { app } from "../lib/firebaseConfig"; // Assuming you have firebaseConfig.js in a lib folder

// Import icons (you'll need to install @heroicons/react)
// npm install @heroicons/react
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth(app); // Get the auth instance

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // User signed up successfully, you can redirect or show a success message
      console.log("User signed up successfully!");
      // Example: redirect to a dashboard page
      // router.push('/dashboard');
    } catch (firebaseError) {
      // Handle Firebase errors
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("The email address is already in use by another account.");
          break;
        case "auth/weak-password":
          setError(
            "The password is too weak. Please use at least 6 characters."
          );
          break;
        case "auth/invalid-email":
          setError("The email address is not valid.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          console.error("Firebase signup error:", firebaseError.message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
        Create an Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
            className="w-full p-2 border rounded pr-10" // Add padding for icon
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
        <div className="relative">
          <input
            type={confirmPasswordShown ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full p-2 border rounded pr-10" // Add padding for icon
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={toggleConfirmPasswordVisibility}
          >
            {confirmPasswordShown ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Sign Up
        </button>
        <p className="text-sm text-center mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
