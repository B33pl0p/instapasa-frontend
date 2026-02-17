"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-black relative flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-black" />
      
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 sm:py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Main Content */}
          <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <span className="text-sm font-medium text-blue-300">For Instagram Sellers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[1.1] mb-8">
              <span className="text-white block mb-2">Sell While</span>
              <span className="text-blue-500 block">
                You Sleep
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed mb-12">
              Turn your Instagram DMs into a complete e-commerce store.
              <br className="hidden sm:block" />
              AI handles sales. You handle growth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/signup"
                className="group px-8 py-4 bg-white text-black font-semibold text-base rounded-full transition-all hover:scale-105 w-full sm:w-auto">
                <span className="flex items-center justify-center gap-2">
                  Start Free Trial
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link 
                href="/services"
                className="px-8 py-4 text-white font-semibold text-base hover:text-blue-400 transition-colors w-full sm:w-auto text-center">
                See how it works →
              </Link>
            </div>
          </div>

          {/* Bold Stats Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Stat 1 */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 lg:p-8 xl:p-10 hover:border-blue-500/40 transition-all">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-400 font-semibold mb-2 text-base lg:text-lg">Always Selling</div>
              <div className="text-gray-500 text-sm lg:text-base">Your AI handles customers while you sleep. Never miss a sale at 2 AM again.</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 lg:p-8 xl:p-10 hover:border-blue-500/40 transition-all">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">3x</div>
              <div className="text-blue-400 font-semibold mb-2 text-base lg:text-lg">Conversion Rate</div>
              <div className="text-gray-500 text-sm lg:text-base">Instant responses mean more completed purchases. No more "bought elsewhere".</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 lg:p-8 xl:p-10 hover:border-blue-500/40 transition-all">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">0</div>
              <div className="text-blue-400 font-semibold mb-2 text-base lg:text-lg">Missed Messages</div>
              <div className="text-gray-500 text-sm lg:text-base">Every DM gets a response. Every customer feels heard. Every sale counts.</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
