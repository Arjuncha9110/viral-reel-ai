import { panchangCities } from "@/data/panchangCities";
import { blogPosts } from "@/data/blogPosts";

/**
 * Single source of truth for every public, indexable route.
 *
 * Used by:
 *  - scripts/prerender.mjs  → prerenders each route to static HTML at build time
 *  - scripts/prerender.mjs  → generates sitemap.xml
 *
 * When adding a new page: add the route in App.tsx AND add an entry here.
 * Routes that are programmatic (cities, blog posts) are derived automatically
 * from their data files, so new cities/posts need no change here.
 */
export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SeoRoute {
  path: string;
  changefreq: ChangeFreq;
  priority: number;
}

export const seoRoutes: SeoRoute[] = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/panchang", changefreq: "daily", priority: 0.9 },
  { path: "/panchang-live", changefreq: "daily", priority: 0.8 },
  ...panchangCities.map((city) => ({
    path: `/panchang/${city.slug}`,
    changefreq: "daily" as ChangeFreq,
    priority: 0.8,
  })),
  { path: "/choghadiya", changefreq: "daily", priority: 0.8 },
  { path: "/ekadashi", changefreq: "weekly", priority: 0.8 },
  { path: "/weekly-zodiac", changefreq: "weekly", priority: 0.8 },
  { path: "/daily-guidance", changefreq: "daily", priority: 0.8 },
  { path: "/kundali", changefreq: "weekly", priority: 0.8 },
  { path: "/janam-kundli", changefreq: "weekly", priority: 0.7 },
  { path: "/kundali-report", changefreq: "monthly", priority: 0.6 },
  { path: "/match", changefreq: "weekly", priority: 0.7 },
  { path: "/dasha", changefreq: "weekly", priority: 0.7 },
  { path: "/sade-sati", changefreq: "weekly", priority: 0.7 },
  { path: "/numerology/name", changefreq: "weekly", priority: 0.7 },
  { path: "/numerology/birth", changefreq: "weekly", priority: 0.7 },
  { path: "/eclipse", changefreq: "weekly", priority: 0.6 },
  { path: "/moon-cycle", changefreq: "weekly", priority: 0.6 },
  { path: "/nadi-shodhana", changefreq: "monthly", priority: 0.5 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    changefreq: "monthly" as ChangeFreq,
    priority: 0.7,
  })),
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/contact", changefreq: "monthly", priority: 0.4 },
  { path: "/terms", changefreq: "yearly", priority: 0.2 },
  { path: "/privacy", changefreq: "yearly", priority: 0.2 },
  { path: "/refund", changefreq: "yearly", priority: 0.2 },
];
