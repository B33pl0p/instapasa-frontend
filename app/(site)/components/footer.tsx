import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
      
      <div className="flex gap-6 text-sm text-gray-400">
        <Link
            href="/"
            className=" hover:text-gray-100 underline-offset-4 hover:underline" >
            <span className="font-semibold">Lakhey Labs</span>
          </Link>
        

        <Link
            href="/services"
            className=" hover:text-gray-100 underline-offset-4 hover:underline" >
            Services
          </Link>


          <Link
            href="/privacy"
            className=" hover:text-gray-100 underline-offset-4 hover:underline" >
            Privacy Policy
          </Link>

        <a>About Us</a>
        <a>Contact</a>
      </div>

      <div className="flex items-center gap-6">
        <img src="/insta.svg" alt="Instagram" className="h-5 w-5" />
        <img src="/linkedin.svg" alt="Linkedin" className="h-5 w-5" />
        <img src="/Xtwitter.svg" alt="X" className="h-5 w-5" />
      </div>

    </footer>
  );
}
