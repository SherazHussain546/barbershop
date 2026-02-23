
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Barbers } from "@/components/sections/Barbers";
import { AIRecommender } from "@/components/sections/AIRecommender";
import { Gallery } from "@/components/sections/Gallery";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <Services />
      <AIRecommender />
      <Barbers />
      <Gallery />
      <Footer />
    </main>
  );
}
