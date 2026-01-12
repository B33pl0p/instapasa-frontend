import Image from "next/image";
import mobile from "@/public/mobile.png";
export default function FeatureSection() {
  return (
    <section className="py-20 px-6 md:px-12">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* IMAGE */}
        <div
          className="
            order-1 md:order-2
            relative
            w-full
            max-w-sm
            mx-auto
            md:max-w-none
            aspect-16/16
            md:aspect-auto
            md:h-130
            rounded-2xl
            overflow-hidden
            bg-gray-300
          "
        >
          <Image
            src={mobile}
            alt="mobile picture"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* TEXT */}
        <div
          className="
            order-2 md:order-1
            text-center
            md:text-left
            max-w-xl
            mx-auto
            md:mx-0
          "
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-snug">
            We Help You{" "}
            <span className="text-brand underline underline-offset-4">
              Interact
            </span>{" "}
            with Customers so You Can{" "}
            <span className="underline underline-offset-4">
              Focus on Making Your Product
            </span>
          </h2>

          <p className="text-gray-300 mb-8">
            Are you a new startup or a family run business finding customers on
            Instagram? We help you sell by making sure your potential customers
            feel heard with instant responses 24/7.
          </p>

          <button className="bg-black text-white px-8 py-3 rounded-full">
            Get in Touch
          </button>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 text-center md:text-left">
        <div>
          <h4 className="font-semibold mb-2">Here text</h4>
          <p className="text-gray-400">
            Writing for websites is both simple and complex.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">There text</h4>
          <p className="text-gray-400">
            Think about keywords you should rank for.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Everywhere text</h4>
          <p className="text-gray-400">
            Content threads through your entire website.
          </p>
        </div>
      </div>
    </section>
  );
}
