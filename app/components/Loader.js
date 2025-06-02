// components/FullScreenLoader.js
"use client"; // This directive is important for client-side components in Next.js

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // Importing a more modern spinner icon

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
      {" "}
      {/* Increased z-index */}
      {/* Top Loading Bar */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} // Slightly longer duration
        className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 to-yellow-400 shadow-lg" // Gradient bar with shadow
      />
      {/* Spinner and Text Container */}
      <div className="relative flex flex-col items-center p-6 bg-white rounded-lg shadow-2xl animate-fade-in">
        {" "}
        {/* Card-like container with shadow */}
        {/* Modern Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-purple-600 mb-4" // Color the spinner
        >
          <Loader2 size={48} className="animate-spin-slow" />{" "}
          {/* Use Lucide icon and a slower spin */}
        </motion.div>
        <p className="text-gray-800 font-semibold text-xl tracking-wide">
          Loading Content...
        </p>
        <p className="mt-2 text-gray-500 text-sm">Please wait a moment.</p>
      </div>
    </div>
  );
};

export default Loader;
