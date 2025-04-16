"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
        Forgot Password
      </h2>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
        />
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
