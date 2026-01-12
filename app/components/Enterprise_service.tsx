"use client";
import InstagramLoginButton from "./instagramLoginButton";

export default function Enterpriseservice() {
  return (
    <div className="flex flex-col px-20 py-8 items-start self-stretch gap-16">

          <div className="flex text-[36px] items-center gap-4 self-stretch font-bold font-sans leading-[1.2] tracking-[-0.72px]">
            Enterprise Chat Bot
          </div>

          <div className="flex flex-col items-center gap-16">

            <div className="flex flex-col gap-8 items-start self-stretch justify-between items-start w-full">
              <div className="text-[24px] font-extrabold leading-[1.45] tracking-[-0.12] ">
              Secure, scalable AI assistants for Large Businesses and Organizations
              </div>

              <p className="text-semibold leading-[1.45] tracking-[-0.11]">
                Lakhey Labs provides enterprise-grade AI chatbot solutions for companies, institutions, and organizations that need reliable, and secure AI solutions to interact with customers 24/7.                   
              </p>
              <button className="flex px-4 py-2 items-center gap-2 rounded-lg bg-[#8A38F5]">
                Enterprise solution
              </button>
            </div>


            <div className="w-full aspect-[1152/1124.35]">
             <img
                src="/enterprise.png"
                alt="Enterprise mock up"
                className="h-full w-full rounded-lg"
              />
            </div>

          </div>

        </div>
  )
}
