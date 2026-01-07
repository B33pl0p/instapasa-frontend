export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
      <span className="font-semibold">Lakhey Labs</span>
      <div className="flex gap-6 text-sm text-gray-400">
        <a>Services</a>
        <a>Privacy Policy</a>
        <a>About Us</a>
        <a>Contact</a>
      </div>
    </footer>
  );
}
