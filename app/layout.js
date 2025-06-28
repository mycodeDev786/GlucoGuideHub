import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";

import Header from "../app/components/Header";
import Footer from "../app/components/Footer";
import AuthSync from "./components/AuthSync";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://www.glucoguidehub.com/" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <AuthSync />
          <Header />
          <main className="">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
