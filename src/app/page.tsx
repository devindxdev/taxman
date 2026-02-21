import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { Features } from "@/components/Features";
import { UserSegments } from "@/components/UserSegments";
import { SocialProof } from "@/components/SocialProof";
import { CTA } from "@/components/CTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <UserSegments />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
