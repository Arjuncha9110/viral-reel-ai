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
        title="Daily Panchang & Vedic Guidance Online | Divine Panchang"
        description="Free daily panchang with today's tithi, nakshatra, yoga, karana, rahu kaal, and sunrise, plus kundali, dasha, and numerology tools for clear Vedic guidance."
        path="/"
        type="website"
        keywords="daily panchang, today panchang, vedic panchang, panchang with daily guidance, rahu kaal today, tithi today, nakshatra today, janam kundali"
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
