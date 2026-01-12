"use client";

import { useState } from "react";
import Link from "next/link";



export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <h1 className="text-2xl md:text-[52px] font-black leading-[1.1] md:tracking-[-0.05em]">
         <Link
            href="/"
            className=" hover:text-gray-300 underline-offset-4 hover:bg-indigo/20" 
            >Lakhey Labs
          </Link>
      </h1>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        <a className="hover:text-brand">About Us</a>
        <a className="hover:text-brand">Contact</a>
        <Link
              href="/services"
              className="hover:text-brand bg-[#8A38F5] border border-transparent hover:border-white px-4 py-1 rounded-md">Our Services</Link>
      </div>

      {/* Mobile */}
      <button
        className="md:hidden"
        onClick={() => setOpen(prev => !prev)}
      >
        ☰
      </button>

      {open && (
        <div className="absolute top-16 left-0 top-full w-full bg-gray-800 flex flex-col items-center gap-4 py-6 md:hidden z-50">
          <a>About Us</a>
          <a>Contact</a>
          <a>Our Services</a>
        </div>
      )}
    </nav>
  );
}
