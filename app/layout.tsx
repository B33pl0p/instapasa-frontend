import type { Metadata, Viewport } from "next";
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
      <body
        className={`${inter.variable} `}
      >
        <StoreProvider>
          {children}
        </StoreProvider>

      </body>
    </html>
  );
}