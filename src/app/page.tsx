import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import {
  CrisisBanner,
  Features,
  Footer,
  HowItWorks,
  JourneyTimeline,
  Pricing,
  Testimonials,
} from "@/components/marketing/sections";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Features />
        <JourneyTimeline />
        <Testimonials />
        <Pricing />
        <CrisisBanner />
      </main>
      <Footer />
    </>
  );
}
