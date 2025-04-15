// components/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-purple-700 text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
        <div className="text-lg font-semibold tracking-wide">
          © {new Date().getFullYear()} GlucoGuideHub
        </div>
        <div className="flex space-x-4">
          <Link
            href="/privacy"
            className="hover:text-yellow-300 transition duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-yellow-300 transition duration-300"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="hover:text-yellow-300 transition duration-300"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
