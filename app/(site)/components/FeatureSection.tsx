"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDashboardSlide, setCurrentDashboardSlide] = useState(0);

  const screenshots = [
    { src: "/mockups/screen1products.png", alt: "Product Catalog Dashboard", label: "Products" },
    { src: "/mockups/screen2productdetails.png", alt: "Product Details Management", label: "Product Details" },
    { src: "/mockups/screen3ordercreated.png", alt: "Order Creation & Tracking", label: "Order Created" },
    { src: "/mockups/screen4brandimage.png", alt: "Brand & Business Settings", label: "Brand Settings" }
  ];

  const dashboardScreenshots = [
    { src: "/dashboards/peroducts_section.png", alt: "Product Management Dashboard", label: "Products Management" },
    { src: "/dashboards/orders_section.png", alt: "Order Tracking Dashboard", label: "Orders & Tracking" },
    { src: "/dashboards/buyer_mgmt_section.png", alt: "Customer Management Dashboard", label: "Customer Management" },
    { src: "/dashboards/analytics_section.png", alt: "Analytics Dashboard", label: "Analytics & Insights" },
    { src: "/dashboards/messageandAIescalation.png", alt: "Message & AI Dashboard", label: "Messages & AI" },
    { src: "/dashboards/business_congif.png", alt: "Business Configuration", label: "Business Config" }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [screenshots.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDashboardSlide((prev) => (prev + 1) % dashboardScreenshots.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [dashboardScreenshots.length]);

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 bg-black">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Problem Statement */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Stop Losing Money<br className="hidden sm:block" />
            <span className="text-gray-500">While You Sleep</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-4xl mx-auto">
            Every ignored DM is lost revenue. Every delayed response sends customers to competitors.
            <br className="hidden sm:block" />
            Your Instagram shouldn't have business hours.
          </p>
        </div>

        {/* Main Feature: AI Automation */}
        <div className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <span className="text-blue-400 text-sm font-semibold">AI Automation</span>
              </div>
              
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Your 24/7<br />Sales Assistant
              </h3>

              <p className="text-lg text-gray-400 mb-8">
                AI that doesn't just reply—it *sells*. Shows products, handles questions, takes orders, 
                and knows when to hand off to you for the personal touch.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Smart Product Recommendations</h4>
                    <p className="text-gray-500 text-sm">AI shows relevant products with images, prices, and variants right in chat</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Intelligent Handover</h4>
                    <p className="text-gray-500 text-sm">AI flags tricky situations. You jump in, resolve it, hand back to AI</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Instant Checkout</h4>
                    <p className="text-gray-500 text-sm">Cart → Payment QR → Order confirmed. All in Instagram. No apps needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Screenshots Slideshow */}
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="bg-gradient-to-br from-blue-950/20 to-transparent border border-blue-500/20 rounded-xl p-4 lg:p-6 flex flex-col items-center">
                {/* Mobile Frame */}
                <div className="relative w-full max-w-sm lg:max-w-md xl:max-w-lg">
                  {/* Current Slide Label */}
                  <div className="mb-3 text-center">
                    <p className="text-blue-400 text-sm font-semibold">{screenshots[currentSlide].label}</p>
                  </div>
                  
                  {/* Slideshow Images */}
                  <div className="relative aspect-[9/19.5] rounded-xl overflow-hidden shadow-2xl">
                    {screenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Image
                          src={screenshot.src}
                          alt={screenshot.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-2 mt-3">
                    {screenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-blue-400 w-8' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-center">
            
            {/* Dashboard Screenshots Slideshow */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} order-2 lg:order-1 lg:col-span-2`}>
              <div className="bg-gradient-to-br from-blue-950/20 to-transparent border border-blue-500/20 rounded-2xl p-3 lg:p-4 flex flex-col items-center">
                {/* Desktop Frame */}
                <div className="relative w-full">
                  {/* Current Slide Label */}
                  <div className="mb-3 mt-1">
                    <p className="text-blue-400 text-base font-semibold">{dashboardScreenshots[currentDashboardSlide].label}</p>
                  </div>
                  
                  {/* Slideshow Images */}
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl">
                    {dashboardScreenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentDashboardSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Image
                          src={screenshot.src}
                          alt={screenshot.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-2 mt-3">
                    {dashboardScreenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentDashboardSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentDashboardSlide 
                            ? 'bg-blue-400 w-8' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to dashboard slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} order-1 lg:order-2 lg:col-span-1`}>
              <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <span className="text-blue-400 text-sm font-semibold">Complete Business Dashboard</span>
              </div>
              
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Run Your Entire<br />Business From One Place
              </h3>

              <p className="text-lg text-gray-400 mb-8">
                Products. Orders. Customers. Analytics. Everything you need to scale your 
                Instagram business without drowning in spreadsheets.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Product Catalog with Variants</h4>
                    <p className="text-gray-500 text-sm">Sizes, colors, SKUs—manage everything. Stock updates automatically in chat</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Order Management</h4>
                    <p className="text-gray-500 text-sm">Pending → Processing → Shipped → Delivered. Track every order in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Know Your Customers</h4>
                    <p className="text-gray-500 text-sm">Tag VIPs, track spending, identify at-risk buyers. Real relationship management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <span className="text-blue-400 text-sm font-semibold">Real Analytics</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Know Your Numbers.<br />Grow Your Business.
            </h3>

            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Stop guessing. See exactly what's working—revenue, best sellers, 
              customer patterns, conversion rates, everything that matters.
            </p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Sales Metrics</h4>
              <p className="text-gray-500 text-sm">Total revenue, order count, average order value, best-selling products</p>
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Customer Insights</h4>
              <p className="text-gray-500 text-sm">VIP buyers, at-risk customers, repeat rate, spending patterns</p>
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Chat Performance</h4>
              <p className="text-gray-500 text-sm">Conversion rate, abandoned chats, most asked questions</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-950/20 to-transparent border border-blue-500/20 rounded-3xl p-8 sm:p-12 max-w-5xl mx-auto">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Never Miss<br />Another Sale?
            </h3>
            <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
              Join Instagram sellers who sleep better knowing their AI is closing deals 24/7.
              <br className="hidden sm:block" />
              Setup takes 10 minutes. First 100 orders free.
            </p>
            <Link 
              href="/signup"
              className="inline-block px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform">
              Start Free Trial →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
