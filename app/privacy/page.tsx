import Footer from "../components/footer";
import PrivacyHeader from "../components/privacy_header";
import Link from "next/link";
import Navbar from "../components/navbar";
import PrivacyPolicies from "../components/privacy_policies";
import PrivacyHero from "../components/privacy-hero";



export default function PrivacyPolicyPage() {
  return (

    <main className="min-h-screen w-full bg-[#111111] text-gray-100">

      {<header className="border-b border-gray-800 bg-[#111111]">
         { /* <Navbar/> */}
         <PrivacyHeader/>
       </header>
      }
    <PrivacyHero/>
    <PrivacyPolicies/>
    <Footer/>
    </main>
  );

}
