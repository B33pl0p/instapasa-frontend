// app/(auth)/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../(site)/components/navbar";
import Footer from "../(site)/components/footer";

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
      <div className="flex min-h-screen flex-col justify-between bg-[#161616] font-sans text-[#E8E8E8] antialiased">
            <Navbar 
            isLogin={true}/>
            {children}
            <Footer />
          </div>
  );
}