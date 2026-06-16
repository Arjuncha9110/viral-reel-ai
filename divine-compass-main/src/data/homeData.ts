import { Calendar, Hash, Star, ScrollText, Orbit, Clock, Eye, Shield, Zap, Timer } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export const features = [
  {
    title: "Daily Panchang",
    description: "Tithi, Nakshatra, Yoga, Karana, and all auspicious timings for your day — presented in a calm ritual-style layout.",
    icon: Calendar,
    path: "/panchang",
    glyph: "☀",
    badge: "Today's Guide",
  },
  {
    title: "Choghadiya",
    description: "Find the most auspicious time windows throughout your day and night for new beginnings and important tasks.",
    icon: Timer,
    path: "/choghadiya",
    glyph: "⌛",
    badge: "Timing Guide",
  },
  {
    title: "Janam Kundali",
    description: "Generate your Vedic birth chart with accurate planetary placements in North or South Indian style.",
    icon: ScrollText,
    path: "/kundali",
    glyph: "⊕",
    badge: "Birth Chart",
  },
  {
    title: "Sade Sati",
    description: "Track Saturn's 7.5-year transit over your Moon sign and understand its transformative phases.",
    icon: Orbit,
    path: "/sade-sati",
    glyph: "♄",
    badge: "Saturn Transit",
  },
  {
    title: "Dasha Calculator",
    description: "Explore your Vimshottari Dasha periods and the planetary influences governing each chapter of life.",
    icon: Clock,
    path: "/dasha",
    glyph: "◎",
    badge: "Life Periods",
  },
  {
    title: "Name Numerology",
    description: "Decode the hidden vibrations of your name — personality, soul urge, and destiny numbers revealed.",
    icon: Hash,
    path: "/numerology/name",
    glyph: "𝕹",
    badge: "Name Reading",
  },
  {
    title: "Birth Numerology",
    description: "Discover your Life Path, Destiny, and Maturity numbers from your date of birth.",
    icon: Star,
    path: "/numerology/birth",
    glyph: "✦",
    badge: "Numbers",
  },
];

export const trustSignals = [
  { icon: Eye, label: "2M+ Readings Generated" },
  { icon: Shield, label: "Vedic Tradition–Based" },
  { icon: Zap, label: "Instant, Always Free" },
];

export const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Divine Panchang",
    url: siteConfig.websiteUrl,
    description: "Daily Panchang, numerology, Vedic astrology tools, and calm spiritual guidance.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Divine Panchang",
    url: siteConfig.websiteUrl,
    logo: `${siteConfig.websiteUrl}/logo-srichakra.png?v=6`,
    sameAs: [siteConfig.youtubeUrl, siteConfig.instagramUrl],
  },
];
