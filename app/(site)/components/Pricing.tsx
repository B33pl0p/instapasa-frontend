import Link from "next/link";

export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-[#161616] m-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-3 sm:px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4 sm:mb-6">
            <span className="text-purple-400 text-xs sm:text-sm font-semibold">Simple Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
            Start Selling Today for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NPR 5,000/month
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            All features included. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition duration-300"></div>
            
            <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#161616] border border-purple-500/30 rounded-3xl p-6 sm:p-8 md:p-12">
              {/* Price Header */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">NPR 5,000</span>
                  <span className="text-lg sm:text-2xl text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400 text-base sm:text-lg">Everything you need to run your Instagram store</p>
                <div className="mt-4 sm:mt-6">
                  <Link
                    href="/signup"
                    className="inline-block group relative px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm sm:text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Free Trial
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">14-day free trial • No credit card required</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Core Features */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <span>Core Features</span>
                  </h4>
                  
                  <Feature icon="✓" text="Instagram DM Automation" />
                  <Feature icon="✓" text="AI-Powered Chat Assistant" />
                  <Feature icon="✓" text="Unlimited Products" />
                  <Feature icon="✓" text="Product Catalog Management" />
                  <Feature icon="✓" text="Product Images & Variants" />
                  <Feature icon="✓" text="Real-Time Inventory Tracking" />
                  <Feature icon="✓" text="Automated Stock Updates" />
                </div>

                {/* Order & Payment */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Orders & Payments</span>
                  </h4>
                  
                  <Feature icon="✓" text="Order Management Dashboard" />
                  <Feature icon="✓" text="Real-Time Order Tracking" />
                  <Feature icon="✓" text="Customer Order History" />
                  <Feature icon="✓" text="Payment QR Code Integration" />
                  <Feature icon="✓" text="eSewa, Khalti, FonePay Support" />
                  <Feature icon="✓" text="Automated Payment Confirmation" />
                  <Feature icon="✓" text="Order Status Updates" />
                </div>

                {/* Analytics & Support */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                    </div>
                    Analytics & Insights
                  </h4>
                  
                  <Feature icon="✓" text="Sales Analytics Dashboard" />
                  <Feature icon="✓" text="Revenue Tracking" />
                  <Feature icon="✓" text="Product Performance Metrics" />
                  <Feature icon="✓" text="Customer Behavior Insights" />
                  <Feature icon="✓" text="Message Analytics" />
                  <Feature icon="✓" text="Conversion Rate Tracking" />
                  <Feature icon="✓" text="Export Reports" />
                </div>

                {/* Advanced Features */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Advanced Features
                  </h4>
                  
                  <Feature icon="✓" text="24/7 Automated Shopping" />
                  <Feature icon="✓" text="Multi-Channel Support (Instagram + Messenger)" />
                  <Feature icon="✓" text="Persistent Menu Configuration" />
                  <Feature icon="✓" text="Custom Business Settings" />
                  <Feature icon="✓" text="Bulk Product Upload" />
                  <Feature icon="✓" text="Product Image Management" />
                  <Feature icon="✓" text="Customer Support Integration" />
                </div>
              </div>

              {/* Bottom Banner */}
              <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>14-Day Free Trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No Credit Card Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Cancel Anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>All Features Included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            <FAQItem 
              question="Can I try before committing?"
              answer="Yes! We offer a 14-day free trial with full access to all features. No credit card required to start."
            />
            <FAQItem 
              question="What payment methods do you support?"
              answer="We integrate with popular Nepali payment gateways including eSewa, Khalti, and FonePay. You can upload your QR codes and start accepting payments immediately."
            />
            <FAQItem 
              question="Is there a limit on products or orders?"
              answer="No limits! You can add unlimited products to your catalog and process as many orders as your business needs."
            />
            <FAQItem 
              question="Do I need technical knowledge to set up?"
              answer="Not at all! Our platform is designed for everyone. Simply connect your Instagram account, add your products, and you're ready to sell. The setup takes less than 10 minutes."
            />
            <FAQItem 
              question="Can I cancel my subscription anytime?"
              answer="Yes, you can cancel anytime with no questions asked. Your data will be safely stored for 30 days in case you want to return."
            />
            <FAQItem 
              question="What kind of support do you provide?"
              answer="We provide email support for all users, with priority support for annual subscribers. Our team typically responds within 24 hours."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-300">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-start gap-3">
        <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {question}
      </h4>
      <p className="text-gray-400 leading-relaxed ml-9">{answer}</p>
    </div>
  );
}
