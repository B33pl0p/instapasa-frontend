import Link from "next/link";

export default function PrivacyHeader() {
  return (
    <main>
      {<header>
     <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-4 md:py-6 flex-row md:flex items-center justify-between">
       <div className="text-2xl md:text-[52px] font-black leading-[1.1] md:tracking-[-0.05em]">
         InstaPasa
       </div>

        <nav className="flex gap-6 text-sm md:text-sm text-gray-300">
          <Link
            href="/"
            className=" hover:text-gray-100 underline-offset-4 hover:underline" >
            Home
          </Link>
           <button>Services</button>
           <button>About Us</button>
           <button>Contact</button>
       </nav>
     </div>
     </header>
      }

    </main>
  )
}