import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./dashboard/lib/StoreProvider";



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstaPasa - Instagram E-Commerce Made Easy",
  description: "Transform your Instagram into a complete e-commerce platform with chat-based shopping and automated order management",
  icons: {
    icon: "/instaPasaLogo.png",
    shortcut: "/instaPasaLogo.png",
    apple: "/instaPasaLogo.png",
  },
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