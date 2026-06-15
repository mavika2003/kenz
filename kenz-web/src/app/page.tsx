import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhoSection from "@/components/WhoSection";
import BookSection from "@/components/BookSection";
import ChaptersGrid from "@/components/ChaptersGrid";
import InvestBlock from "@/components/InvestBlock";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import HomeRedirect from "@/components/HomeRedirect";

export default function Home() {
  return (
    <>
      <HomeRedirect />
      <RevealObserver />
      <Nav />
      <main>
        <Hero />
        <WhoSection />
        <BookSection />
        <ChaptersGrid />
        <InvestBlock />
      </main>
      <Footer />
    </>
  );
}
