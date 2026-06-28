import { useParams } from "react-router-dom";
import PanchangPage from "./PanchangPage";
import NotFound from "./NotFound";
import { getPanchangCity } from "@/data/panchangCities";

/**
 * Real, prerendered city landing pages: /panchang/new-delhi, /panchang/mumbai, ...
 * Each renders the full panchang calculated for that city with city-specific
 * title, description, and canonical URL. Add cities in src/data/panchangCities.ts.
 */
const PanchangCityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = getPanchangCity(citySlug ?? "");

  if (!city) {
    return <NotFound />;
  }

  const cityLower = city.name.toLowerCase();

  return (
    <PanchangPage
      key={city.slug}
      presetLocation={city.location}
      headerTitle={`Today's Panchang in ${city.name}`}
      headerSubtitle={`Tithi, Nakshatra, Rahu Kaal, and auspicious timings calculated for ${city.name}, ${city.region}`}
      seo={{
        title: `Today's Panchang in ${city.name} | Tithi, Nakshatra & Rahu Kaal`,
        description: `Accurate ${city.name} panchang for today: tithi, nakshatra, yoga, karana, rahu kaal, abhijit muhurat, sunrise, and sunset calculated for ${city.name}, ${city.region}.`,
        path: `/panchang/${city.slug}`,
        keywords: `${cityLower} panchang, today panchang ${cityLower}, aaj ka panchang ${cityLower}, rahu kaal today ${cityLower}, ${cityLower} tithi today`,
      }}
    />
  );
};

export default PanchangCityPage;
