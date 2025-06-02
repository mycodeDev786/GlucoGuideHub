"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react"; // Import ChevronDown for the dropdown icon
import Image from "next/image"; // Import Image component for optimized images
import { assets } from "@/assets/assets";

const navItems = [
  { href: "/gi-calculator", label: "GI Calculator" },
  { href: "/meal-planner", label: "Meal Planner" },
  { href: "/medicine-reminder", label: "Medicine Reminder" },
  { href: "/sugar-tracking", label: "Sugar Tracking" },
  { href: "/forum", label: "Forum" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown
  const pathname = usePathname();

  // Placeholder for authentication state
  // In a real app, you'd get this from your authentication context or hook
  const isLoggedIn = true; // Set to true for demonstration
  const userImage = assets.c3; // Placeholder user image

  const handleLogout = () => {
    console.log("User logged out");
    // Implement your actual logout logic here (e.g., clear tokens, redirect)
  };

  return (
    <header className="bg-purple-600 text-white shadow">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          GlucoGuideHub
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition duration-300 hover:text-yellow-300 ${
                pathname === item.href
                  ? "underline underline-offset-4 text-yellow-300"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Image
                  src={userImage}
                  alt="User Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-purple-800 rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-yellow-300 text-purple-800 font-semibold px-4 py-1 rounded hover:bg-yellow-400 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-purple-500 transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96 p-4" : "max-h-0 p-0"
        }`}
      >
        <div className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition hover:text-yellow-300 ${
                pathname === item.href ? "text-yellow-300 font-semibold" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="transition hover:text-yellow-300"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full text-left bg-yellow-300 text-purple-800 font-semibold px-4 py-1 rounded hover:bg-yellow-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-yellow-300 text-purple-800 font-semibold px-4 py-1 rounded hover:bg-yellow-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
