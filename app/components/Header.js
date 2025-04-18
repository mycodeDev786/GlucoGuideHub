"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/meal-planner", label: "Meal Planner" },
  { href: "/medicine-reminder", label: "Medicine Reminder" },
  { href: "/sugar-tracking", label: "Sugar Tracking" },
  { href: "/forum", label: "Forum" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-purple-600 text-white shadow">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="text-2xl font-bold tracking-wide">GlucoGuideHub</div>

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
          <Link
            href="/login"
            className="bg-yellow-300 text-purple-800 font-semibold px-4 py-1 rounded hover:bg-yellow-400 transition"
          >
            Login
          </Link>
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
          <Link
            href="/login"
            className="bg-yellow-300 text-purple-800 font-semibold px-4 py-1 rounded hover:bg-yellow-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
