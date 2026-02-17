import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 max-w-[1600px] mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white w-10 h-10 rounded-md flex items-center justify-center p-1.5">
                <img src="/instaPasaLogo.png" alt="InstaPasa" className="w-full h-full object-contain" />
              </span>
              <span className="text-xl sm:text-2xl font-bold">InstaPasa</span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm">
              Transform your Instagram into a complete e-commerce platform. Chat-based shopping, instant checkout, and automated order management.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <img src="/Social link 1.svg" alt="Instagram" className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <img src="/Social link 2.svg" alt="Twitter" className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <img src="/Social link 3.svg" alt="LinkedIn" className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm">Product</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
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
                <Link href="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-950/10 to-transparent border border-gray-900 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Ready to Sell on Instagram?</h3>
              <p className="text-gray-400 text-sm sm:text-base">Start your chat-based store today. No credit card required.</p>
            </div>
            <Link 
              href="/signup" 
              className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-md font-semibold text-sm sm:text-base transition-colors whitespace-nowrap w-full sm:w-auto text-center"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <p className="text-gray-500">
            © {new Date().getFullYear()} InstaPasa by Lakhey Labs. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-gray-500">
            <span>Made with ❤️ in Nepal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
