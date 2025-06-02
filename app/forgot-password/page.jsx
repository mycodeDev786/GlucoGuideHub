"use client";

import Link from "next/link";
import { useState } from "react";
// Import Firebase auth
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
// Assuming you have firebaseConfig.js in a lib folder
import { app } from "../lib/firebaseConfig";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // To display success messages

  const auth = getAuth(app); // Get the auth instance

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setMessage(""); // Clear previous messages

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A password reset link has been sent to your email.");
      setEmail(""); // Clear the email input after successful submission
    } catch (firebaseError) {
      // Handle Firebase errors
      switch (firebaseError.code) {
        case "auth/invalid-email":
          setError("The email address is not valid.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email address.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          console.error(
            "Firebase password reset error:",
            firebaseError.message
          );
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
        Forgot Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Send Reset Link
        </button>
        <div className="text-sm text-center mt-2">
          <Link href="/login" className="text-purple-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
