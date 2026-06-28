import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import CinematicMoments from "@/components/CinematicMoments";
import ExperiencesBento from "@/components/ExperiencesBento";
import HowItWorks from "@/components/HowItWorks";
import NeighborhoodsSection from "@/components/NeighborhoodsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="film-grain" aria-hidden="true" />
      <Nav overlay />
      <main className="overflow-x-hidden">
        <Hero />
        <CinematicMoments />
        <ExperiencesBento />
        <HowItWorks />
        <NeighborhoodsSection />
      </main>
      <Footer />
    </>
  );
}
