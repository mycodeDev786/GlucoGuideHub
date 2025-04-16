"use client";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-6">
          About GlucoGuideHub
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          GlucoGuideHub is your trusted companion in managing diabetes
          effectively. Our platform empowers individuals with tools and insights
          to lead a healthy, balanced life through personalized meal plans,
          sugar tracking, medicine reminders, and a supportive community.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between mt-12 gap-8">
          <div className="text-left space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">Our Mission</h2>
            <p className="text-gray-600">
              We aim to simplify diabetes management by using technology to help
              you stay informed, organized, and connected. Our platform is built
              for real people, real routines, and real support.
            </p>
          </div>

          <img
            src="https://source.unsplash.com/400x300/?healthcare,technology"
            alt="Our Mission"
            className="rounded-xl shadow-lg"
          />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Connect with Us
          </h2>
          <div className="flex justify-center gap-6 text-blue-600 text-2xl">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-800 transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-800 transition"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} GlucoGuideHub. All rights reserved.
        </div>
      </div>
    </div>
  );
}
