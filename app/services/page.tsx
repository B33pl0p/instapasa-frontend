"use client"
import PrivacyHero from "../components/privacy-hero";
import InstagramLoginButton from "../components/instagramLoginButton";

export default function PrivacyPolicyPage() {
  return (

    <main>
        <PrivacyHero/>
        
        <div className="flex flex-col px-8 py-16 items-start self-stretch gap-16">

          <div className="flex text-[36px] items-start gap-4 self-stretch font-bold font-sans leading-[1.2] tracking-[-0.72px]">
            Instagram Chat Bot
          </div>

          <div className="flex items-start gap-8 ">

            <div className="flex flex-col gap-8 justify-between items-start w-[476.19px]">
              <div className="text-[24px] font-extrabold leading-[1.45] tracking-[-0.12] ">
                Smart DM automation for growing brands
              </div>

              <p className="">
                At Lakhey Labs, we build AI-powered chatbots specially designed for Instagram-based businesses that want to save time, respond faster, and convert more customers — without hiring extra staff.
                <br /> <br />
                Our 24/7 Instagram bots use RAG (Retrieval-Augmented Generation) technology, meaning they answer questions using your real business information, not generic scripts.
                <br /> <br />
                <span className="font-bold">Are you a self made startup? - Let us help you make your customers feel heard
                </span>

              </p>
            </div>


            <div>
              <div>
                 <img
                      src="/image 7.png"
                      alt="Instagram mock up"
                     className="w-[651.81px] h-[642.35px]"
                      />
              </div>
              <InstagramLoginButton></InstagramLoginButton>
            </div>


          </div>

        </div>


    </main>

  );

}