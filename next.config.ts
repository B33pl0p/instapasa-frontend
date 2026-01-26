import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  env: {
  	NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.lakhey.tech', 
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-iad3-1.xx.fbcdn.net',
      },
      {
        protocol :'https',
        hostname: 'lakhey-bot-images-bucket.s3.us-east-1.amazonaws.com',
      }
    ],
  },
};

export default nextConfig;
