import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

import Header from "../app/components/Header";
import Footer from "../app/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GlucoGuideHub",
  description: "Empowering Your Diabetes Journey",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
