// app/(auth)/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lakhey Labs – Login",
  description: "Login to Lakhey Labs",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-black text-[#E8E8E8] font-sans flex flex-col`}
      >
        <Navbar isLogIn={true} />
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
