import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#161616] to-black border-t border-gray-800 m-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
                L
              </span>
              <span className="text-xl sm:text-2xl font-black">Lakhey Labs</span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm">
              Transform your Instagram into a complete e-commerce platform. Chat-based shopping, instant checkout, and automated order management.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <img src="/Social link 1.svg" alt="Instagram" className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <img src="/Social link 2.svg" alt="Twitter" className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <img src="/Social link 3.svg" alt="LinkedIn" className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm">Product</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Contact Sales
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Ready to Sell on Instagram?</h3>
              <p className="text-gray-400 text-sm sm:text-base">Start your chat-based store today. No credit card required.</p>
            </div>
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 whitespace-nowrap w-full sm:w-auto text-center"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Lakhey Labs. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-gray-500">
            <span>Made with ❤️ in Nepal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
