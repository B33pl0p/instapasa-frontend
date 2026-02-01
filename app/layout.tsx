import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./dashboard/lib/StoreProvider";



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lakhey Labs",
  description: "We Build, Your Dreams",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en" className="w-full">
      <body
        className={`${inter.variable} w-full m-0 p-0`}
      >
        <StoreProvider>
          {children}
        </StoreProvider>

      </body>
    </html>
  );
}