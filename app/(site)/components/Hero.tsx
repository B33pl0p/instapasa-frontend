import Link from "next/link";


export default function Hero() {
  return (
    <section
      className="min-h-[90vh] bg-cover bg-center relative flex items-center"
      style={{ backgroundImage: "url('/lakhey.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-purple-900/40" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-purple-200">Instagram E-Commerce Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            <span className="text-white">Sell on Instagram with</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
              Chat-Based Shopping
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
            Transform your Instagram DMs into a powerful sales channel. 
            <br className="hidden sm:block" />
            Automated product browsing, instant checkout, and <span className="text-purple-300 font-semibold">24/7 order management</span> - all through chat.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm px-2">
            <div className="px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              💬 Chat-Based Shopping
            </div>
            <div className="px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              🛍️ Product Catalog
            </div>
            <div className="px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hidden xs:inline-block">
              📦 Order Management
            </div>
            <div className="px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hidden sm:inline-block">
              💳 Payment Integration
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4 px-2">
            <Link 
              href="/signup"
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 w-full sm:w-auto">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Selling
                <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </Link>
            
            <Link 
              href="/services"
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2">
                How It Works
                <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Stats or Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8 sm:pt-12">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs sm:text-sm text-gray-400">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-gray-400">Shopping</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
              <div className="text-xs sm:text-sm text-gray-400">Native</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
