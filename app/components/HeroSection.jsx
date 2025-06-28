"use client";

import { assets } from "@/assets/assets";
import { ArrowRight, ChevronDown } from "lucide-react";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Array of images for the moving background
const movingBackgroundImages = [assets.hero, assets.c1];

// Animation variants for background images
const backgroundImageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? "100%" : "-100%", // Start off-screen
    opacity: 0,
    scale: 1.1,
  }),
  animate: {
    x: "0%", // Move to center
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%", // Move off-screen in the opposite direction
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  }),
};

export default function HeroSection() {
  const isRTL = false;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for moving to the right, -1 for moving to the left
  const router = useRouter();
  // Effect to automatically change background images]
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirection(1); // Always move to the "right" for continuous loop
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % movingBackgroundImages.length
      );
    }, 4000); // Change image every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden  text-white">
      {/* Moving Background Images */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex} // Key is important for AnimatePresence to detect changes
          custom={direction}
          variants={backgroundImageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 z-0"
        >
          <Image
            src={movingBackgroundImages[currentIndex]}
            alt={`Background image ${currentIndex + 1}`}
            fill
            unoptimized
            className="object-cover  transform scale-110" // Added blur and scale for a subtle effect
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

      {/* Center content */}
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-6">
        {/* Top navigation - Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="z-20  text-4xl font-bold rounded-lg p-2" // Added some styling for the logo container
        >
          {/* <Image
            src={assets.logo}
            alt="Logo"
            width={300}
            height={300}
            unoptimized
            className="object-contain"
          /> */}
        </motion.div>

        {/* Main idea/tagline */}

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 drop-shadow-2xl">
          Empowering Your Diabetes Journey
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-xl">
          Smart tools for sugar tracking, personalized meal planning & timely
          medicine reminders.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <motion.button
            onClick={() => {
              router.push("meal-planner");
            }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="bg-white text-black cursor-pointer font-semibold px-6 py-3 rounded-md flex items-center gap-2 hover:bg-gray-200 transition"
          >
            Get Started <ArrowRight size={20} />
          </motion.button>
          <motion.button
            onClick={() => {
              router.push("gi-calculator");
            }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="bg-black cursor-pointer text-white border border-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-white hover:text-black transition"
          >
            GI Tracker <ChevronDown size={20} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
