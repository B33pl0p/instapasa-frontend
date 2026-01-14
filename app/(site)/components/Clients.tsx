export default function Clients() {
  return (
    <section className="py-16 px-6 md:px-12 text-center">
      <h3 className="text-xl mb-8">Our Clients</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-zinc-800 py-6 rounded-lg"
          >
            Logopipsum
          </div>
        ))}
      </div>
    </section>
  );
}
