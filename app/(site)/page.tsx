import Clients from "./components/Clients";
import FeatureSection from "./components/FeatureSection";
// import Footer from "./components/footer";
import Hero from "./components/Hero";
// import Navbar from "./components/navbar";
import Pricing from "./components/Pricing";

export default function Home() {
  return (
    <div className="w-full min-w-full m-0 p-0 overflow-x-hidden">
      {/* <Navbar/> */}
      <Hero />
      <Clients />
      <FeatureSection />
      <Pricing />
      {/* <Footer /> */}
    </div>
  );
}
