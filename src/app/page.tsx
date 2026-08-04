import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import {
  CrisisBanner,
  Features,
  Footer,
  HowItWorks,
  PathExplorer,
  Pricing,
  Testimonials,
} from "@/components/marketing/sections";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main id="main">
        <Hero />
        <PathExplorer />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <CrisisBanner />
      </main>
      <Footer />
    </>
  );
}
