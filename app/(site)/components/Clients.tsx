export default function Clients() {
  const clients = [
    { name: "Fashion Store", logo: "FS" },
    { name: "Handmade Crafts", logo: "HC" },
    { name: "Beauty Shop", logo: "BS" },
    { name: "Local Boutique", logo: "LB" }
  ];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-[#161616] m-0">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-3 sm:px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-3 sm:mb-4">
          <span className="text-purple-400 text-xs sm:text-sm font-semibold">Trusted By Growing Businesses</span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          Powering{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Instagram Commerce
          </span>
        </h3>
        <p className="text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          From small startups to established brands, businesses are turning Instagram DMs into their primary sales channel
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
          {clients.map((client, i) => (
            <div
              key={i}
              className="group bg-gradient-to-br from-[#1a1a1a] to-[#161616] border border-gray-800 hover:border-purple-500/50 rounded-2xl p-4 sm:p-8 transition-all duration-300 hover:transform hover:scale-105 flex flex-col items-center justify-center"
            >
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <span className="text-xl sm:text-2xl font-bold text-purple-400">{client.logo}</span>
              </div>
              <span className="text-gray-300 font-medium text-xs sm:text-sm md:text-base text-center line-clamp-2">{client.name}</span>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-16 border-t border-gray-800">
          <div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">200+</div>
            <div className="text-gray-400 text-xs sm:text-sm">Active Stores</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">10K+</div>
            <div className="text-gray-400 text-xs sm:text-sm">Orders Delivered</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">3x</div>
            <div className="text-gray-400 text-xs sm:text-sm">Higher Conversion</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">95%</div>
            <div className="text-gray-400 text-xs sm:text-sm">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
