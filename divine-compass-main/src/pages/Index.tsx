import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";
import { homeStructuredData } from "@/data/homeData";
import { AdSenseBanner } from "@/components/shared/AdSenseBanner";
import { Hero } from "@/components/home/Hero";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { SadeSatiPromo } from "@/components/home/SadeSatiPromo";
import { KundaliCTA } from "@/components/home/KundaliCTA";

const Index = () => {
  return (
    <Layout>
      <SeoHead
        title="Divine Panchang | Daily Panchang, Kundali & Numerology"
        description="Check today's panchang, explore Janam Kundali and numerology, and follow practical spiritual guidance from Divine Panchang."
        path="/"
        type="website"
        keywords="divine panchang, daily panchang, vedic astrology, janam kundali, numerology, rahu kaal, nakshatra"
        structuredData={homeStructuredData}
      />

      <Hero />

      {/* AdSense */}
      <div className="container mx-auto px-4 mt-8 -mb-4">
        <AdSenseBanner adSlot="homepage_top_banner" adFormat="horizontal" />
      </div>

      <FeaturesGrid />
      <SadeSatiPromo />
      <KundaliCTA />
    </Layout>
  );
};

export default Index;
