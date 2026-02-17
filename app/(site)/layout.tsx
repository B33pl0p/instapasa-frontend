import type { Metadata } from "next";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

export const metadata: Metadata = {
  title: "InstaPasa - Instagram E-Commerce Made Easy",
  description: "Transform your Instagram into a complete e-commerce platform with chat-based shopping and automated order management",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-black font-sans text-[#E8E8E8] antialiased">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
