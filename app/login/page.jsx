"use client";

import Link from "next/link";
import { useState } from "react";
// Import Firebase auth
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// Assuming you have firebaseConfig.js in a lib folder
import { app } from "../lib/firebaseConfig";

// Import icons (you'll need to install @heroicons/react)
// npm install @heroicons/react
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const auth = getAuth(app); // Get the auth instance

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User logged in successfully, you can redirect or show a success message
      console.log("User logged in successfully!");
      router.push("/");
      // Example: redirect to a dashboard page
      // router.push('/dashboard');
    } catch (firebaseError) {
      // Handle Firebase errors
      switch (firebaseError.code) {
        case "auth/invalid-email":
          setError("The email address is not valid.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email address.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-credential": // Firebase 9.0+ often uses this for general auth failures
          setError("Invalid login credentials.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          console.error("Firebase login error:", firebaseError.message);
      }
    } finally {
      setLoading(false);
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
