"use client";
import InstagramLoginButton from "./instagramLoginButton";

export default function Enterpriseservice() {
  return (
    <>
     <div className="flex flex-col h-[64px] px-16 py-8 items-start gap-16 self-stretch bg-[#1B1B1B]"></div>
    <div className="flex flex-col items-start gap-16 max-w-7xl mx-auto px-4 md:px-16 py-4 md:py-8">

          <div className="flex text-[36px] items-start gap-4 font-bold font-sans leading-[1.2] tracking-[-0.72px]">
            Enterprise Chat Bot
          </div>

          <div className="flex flex-col items-start gap-12 md:gap-16">

            <div className="flex flex-col gap-8 items-start justify-between items-start w-[476.19px] md:w-full">
              <div className="text-[24px] font-extrabold leading-[1.45] tracking-[-0.12] ">
              Secure, scalable AI assistants for Large Businesses and Organizations
              </div>

              <p className="text-semibold leading-[1.45] tracking-[-0.11]">
                Lakhey Labs provides enterprise-grade AI chatbot solutions for companies, institutions, and organizations that need reliable, and secure AI solutions to interact with customers 24/7.                   
              </p>
              <button className="flex px-4 py-2 items-center gap-2 rounded-lg bg-[#8A38F5] hover:scale-110">
                Enterprise solution
              </button>
            </div>


            <div>
              <div className="flex-1 flex justify-center"> 
               <img
                  src="/enterprise.png"
                  alt="Enterprise mock up"
                  className="rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>
    </>
  )
}
