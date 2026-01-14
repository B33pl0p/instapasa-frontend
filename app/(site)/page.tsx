import Clients from "./components/Clients";
import FeatureSection from "./components/FeatureSection";
// import Footer from "./components/footer";
import Hero from "./components/Hero";
// import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div>
      {/* <Navbar/> */}
      <Hero />
      <Clients />
      <FeatureSection />
      {/* <Footer /> */}
    </div>
  );
}
