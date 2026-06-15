import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhoSection from "@/components/WhoSection";
import BookSection from "@/components/BookSection";
import ChaptersGrid from "@/components/ChaptersGrid";
import InvestBlock from "@/components/InvestBlock";
import ChatCTA from "@/components/ChatCTA";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export default function Home() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <main>
        <Hero />
        <WhoSection />
        <BookSection />
        <ChaptersGrid />
        <InvestBlock />
        <ChatCTA />
      </main>
      <Footer />
    </>
  );
}
