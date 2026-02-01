import type { Metadata } from "next";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

export const metadata: Metadata = {
  title: "Lakhey Labs",
  description: "We Build, Your Dreams",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#161616] font-sans text-[#E8E8E8] antialiased m-0 p-0">
      <Navbar />
      <div className="w-full">
        {children}
      </div>
      <Footer />
    </div>
  );
}
