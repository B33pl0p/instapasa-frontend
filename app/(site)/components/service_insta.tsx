"use client";
import InstagramLoginButton from "../components/instagramLoginButton";

export default function Instaservice() {
  return (
    <>
    <div className="flex flex-col h-[64px] px-16 py-8 items-start gap-16 self-stretch bg-[#1B1B1B]"></div>
    <div className="flex flex-col items-start gap-16 max-w-7xl mx-auto px-4 md:px-16 py-4 md:py-8">

          <div className="flex text-[36px] items-start gap-4 font-bold font-sans leading-[1.2] tracking-[-0.72px]">
            Instagram Chat Bot
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">

            <div className="flex flex-col gap-8 justify-between self-stretch items-start w-full md:w-[476.19px]">
              <div className="flex flex-col items-start gap-8 "> 
              <div className="text-[24px] font-extrabold leading-[1.45] tracking-[-0.12] ">
                Smart DM automation for growing brands
              </div>

              <p className="text-semibold text-gray-300 leading-[1.45] tracking-[-0.11]">
                At Lakhey Labs, we build AI-powered chatbots specially designed for Instagram-based businesses that want to save time, respond faster, and convert more customers — without hiring extra staff.
                <br /> <br />
                Our 24/7 Instagram bots use RAG (Retrieval-Augmented Generation) technology, meaning they answer questions using your real business information, not generic scripts.
                <br /> <br />
                <span className="font-bold text-white">Are you a self made startup? - Let us help you make your customers feel heard
                </span>
              </p>
              </div>
              <InstagramLoginButton />
            </div>


            <div>
              <div className="w-[651px] h-[642px]">
                 <img
                      src="/image 7.png"
                      alt="Instagram mock up"
                      className=" md:h-[642.35px] rounded-lg "
                      />
              </div>
            </div>


          </div>

        </div>
        </>
  )
}
