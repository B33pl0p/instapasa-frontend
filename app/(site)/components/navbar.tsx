"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth";



export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-[#161616]/95 backdrop-blur-md shadow-lg border-b border-gray-800" 
        : "bg-transparent"
    }`}>
      <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
          <Link
            href="/"
            className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-2" 
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 w-7 sm:w-8 h-7 sm:h-8 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">
              L
            </span>
            <span className="hidden sm:inline text-sm sm:text-base md:text-lg">Lakhey Labs</span>
          </Link>
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/#about" className="hover:text-purple-400 transition-colors duration-200 text-sm lg:text-base">
            About Us
          </Link>
          <Link href="/#contact" className="hover:text-purple-400 transition-colors duration-200 text-sm lg:text-base">
            Contact
          </Link>
          <Link
            href="/services"
            className="hover:text-purple-400 transition-colors duration-200 px-3 lg:px-4 py-2 rounded-lg border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-sm lg:text-base">
            Our Services
          </Link>
          
          {isAuthenticated ? (
            <Link
              href="/dashboard/message"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 lg:px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/30 text-sm lg:text-base"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 lg:px-6 py-2 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-200 text-sm lg:text-base"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 lg:px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/30 text-sm lg:text-base"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        open ? "max-h-96 border-t border-gray-800" : "max-h-0"
      }`}>
        <div className="bg-[#161616]/98 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3">
          <Link 
            href="/#about" 
            className="block py-2 hover:text-purple-400 transition-colors text-sm sm:text-base"
            onClick={() => setOpen(false)}
          >
            About Us
          </Link>
          <Link 
            href="/#contact" 
            className="block py-2 hover:text-purple-400 transition-colors text-sm sm:text-base"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/services"
            className="block py-2 px-3 sm:px-4 rounded-lg border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all text-center text-sm sm:text-base"
            onClick={() => setOpen(false)}
          >
            Our Services
          </Link>
          
          {isAuthenticated ? (
            <Link
              href="/dashboard/message"
              className="block bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-center transition-all text-sm sm:text-base"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all text-center text-sm sm:text-base"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-center transition-all text-sm sm:text-base"
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
