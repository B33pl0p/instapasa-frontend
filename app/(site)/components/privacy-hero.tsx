export default function PrivacyHero() {
  return (
     <div
    className="flex flex-col items-center gap-4 md:gap-8 px-4 md:px-16 py-4 md:py-8 text-white w-full "
    style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),url('/lakhey.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="flex flex-col w-full py-4 md:py-4 justify-center items-center gap-4 md:gap-8 rounded-lg bg-[rgba(255,255,255,0.13)]">
     <div className="text-xl md:text-[32px] font-bold leading-[1.1]"> We Build,  Your Dreams
     </div>
    </div>

  </div>
  )
}