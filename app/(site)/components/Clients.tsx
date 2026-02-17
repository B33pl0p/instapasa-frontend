export default function Clients() {
  const clients = [
    { name: "Fashion Store", logo: "FS" },
    { name: "Handmade Crafts", logo: "HC" },
    { name: "Beauty Shop", logo: "BS" },
    { name: "Local Boutique", logo: "LB" }
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 bg-black">
      <div className="max-w-[1600px] mx-auto text-center">
        <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
          <span className="text-blue-400 text-sm font-semibold">Trusted By Growing Businesses</span>
        </div>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Powering{" "}
          <span className="text-blue-500">
            Instagram Commerce
          </span>
        </h3>
        <p className="text-gray-500 mb-12 max-w-3xl mx-auto text-base sm:text-lg">
          From small startups to established brands, businesses are turning Instagram DMs into their primary sales channel
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {clients.map((client, i) => (
            <div
              key={i}
              className="bg-[#0a0a0a] border border-gray-900 hover:border-gray-800 rounded-2xl p-6 sm:p-8 transition-colors flex flex-col items-center justify-center"
            >
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-blue-400">{client.logo}</span>
              </div>
              <span className="text-gray-400 font-medium text-sm text-center">{client.name}</span>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-gray-900">
          <div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">200+</div>
            <div className="text-gray-500 text-sm lg:text-base">Active Stores</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">10K+</div>
            <div className="text-gray-500 text-sm lg:text-base">Orders Delivered</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">3x</div>
            <div className="text-gray-400 text-xs sm:text-sm lg:text-base">Higher Conversion</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-500 mb-1 sm:mb-2">95%</div>
            <div className="text-gray-400 text-xs sm:text-sm lg:text-base">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
