import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhatsOnSection from "@/components/WhatsOnSection";
import ItinerariesSection from "@/components/ItinerariesSection";
import Dubai101Section from "@/components/Dubai101Section";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="film-grain" aria-hidden="true" />
      <Nav overlay />
      <main className="overflow-x-hidden">
        <Hero />
        <WhatsOnSection />
        <ItinerariesSection />
        <Dubai101Section />
      </main>
      <Footer />
    </>
  );
}
