import type { LocationData } from "@/components/LocationSelector";

/**
 * City landing pages for /panchang/:citySlug.
 *
 * This is the scalable SEO-page pattern for the site: adding one entry here
 * automatically creates a real, prerendered landing page (via PanchangCityPage),
 * a sitemap entry (via src/seo/routes.ts), and internal links from the
 * panchang hub page. No other code changes are needed.
 */
export interface PanchangCity {
  slug: string;
  name: string;
  region: string;
  location: LocationData;
}

export const panchangCities: PanchangCity[] = [
  {
    slug: "new-delhi",
    name: "New Delhi",
    region: "Delhi",
    location: { name: "New Delhi", stateCode: "DL", countryCode: "IN", lat: 28.6139, lon: 77.209, timezone: "Asia/Kolkata" },
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    region: "Maharashtra",
    location: { name: "Mumbai", stateCode: "MH", countryCode: "IN", lat: 19.076, lon: 72.8777, timezone: "Asia/Kolkata" },
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    region: "Karnataka",
    location: { name: "Bengaluru", stateCode: "KA", countryCode: "IN", lat: 12.9716, lon: 77.5946, timezone: "Asia/Kolkata" },
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    region: "West Bengal",
    location: { name: "Kolkata", stateCode: "WB", countryCode: "IN", lat: 22.5726, lon: 88.3639, timezone: "Asia/Kolkata" },
  },
  {
    slug: "chennai",
    name: "Chennai",
    region: "Tamil Nadu",
    location: { name: "Chennai", stateCode: "TN", countryCode: "IN", lat: 13.0827, lon: 80.2707, timezone: "Asia/Kolkata" },
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    region: "Telangana",
    location: { name: "Hyderabad", stateCode: "TS", countryCode: "IN", lat: 17.385, lon: 78.4867, timezone: "Asia/Kolkata" },
  },
  {
    slug: "pune",
    name: "Pune",
    region: "Maharashtra",
    location: { name: "Pune", stateCode: "MH", countryCode: "IN", lat: 18.5204, lon: 73.8567, timezone: "Asia/Kolkata" },
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    region: "Uttar Pradesh",
    location: { name: "Varanasi", stateCode: "UP", countryCode: "IN", lat: 25.3176, lon: 82.9739, timezone: "Asia/Kolkata" },
  },
];

export const getPanchangCity = (slug: string): PanchangCity | undefined =>
  panchangCities.find((city) => city.slug === slug);
