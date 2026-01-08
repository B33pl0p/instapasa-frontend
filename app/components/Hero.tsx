export default function Hero() {
  return (
    <section
      className="h-[80vh] bg-cover bg-center relative"
      style={{ backgroundImage: "url('/lakhey.png')" }}
    >
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center  gap-6">
        <div className="bg-[rgba(255,255,255,0.13)] justify-center  rounded-2xl px-6 py-8 w-3/4  ">
            <h2 className="text-3xl md:text-5xl  font-bold mb-4">
            We Build, Your Dreams
            </h2>

            <p className="text-sm md:text-lg max-w-xl mb-6">
            Don’t think about the HOW. Focus on the WHAT.
            <br />
            Let’s build something together.
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-white text-black px-6 py-3 rounded-md">
            Get in Touch
          </button>
          <button className="border border-white px-6 py-3 rounded-md">
            Our Services
          </button>
        </div>
      </div>
    </section>
  );
}
