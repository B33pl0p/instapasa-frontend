import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
      <span className="font-semibold">Lakhey Labs</span>
      <div className="flex gap-6 text-sm text-gray-400">
        <a>Services</a>


          <Link
            href="/privacy"
            className=" hover:text-gray-100 underline-offset-4 hover:underline" >
            Privacy Policy
          </Link>

        <a>About Us</a>
        <a>Contact</a>
      </div>
    </footer>
  );
}
