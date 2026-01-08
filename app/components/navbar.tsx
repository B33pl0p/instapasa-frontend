"use client";

import { useState } from "react";
import InstagramLoginButton from "./instagramLoginButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relaive z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <h1 className="text-lg font-bold">Lakhey Labs</h1>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        <a className="hover:text-brand">Services</a>
        <a className="hover:text-brand">About Us</a>
        <a className="hover:text-brand">Contact</a>
        <InstagramLoginButton />
      </div>

      {/* Mobile */}
      <button
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {open && (
        <div className="absolute top-16 left-0 w-full bg-dark flex flex-col items-center gap-4 py-6 md:hidden">
          <a>Services</a>
          <a>About Us</a>
          <a>Contact</a>
          <InstagramLoginButton />
        </div>
      )}
    </nav>
  );
}
