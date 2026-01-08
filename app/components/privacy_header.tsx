import Link from "next/link";

export default function PrivacyHeader() {
  return (
    <main>
      {<header>
     <div className="max-w-6xl mx-auto px-4 md:px-16 py-4 md:py-6 flex-row md:flex items-center justify-between">
       <div className="text-2xl md:text-[52px] font-black leading-[1.1] md:tracking-[-0.05em]">
         Lakhey Labs
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