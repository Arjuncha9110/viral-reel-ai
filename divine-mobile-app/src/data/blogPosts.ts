export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-panchang",
    title: "What is Panchang? A Complete Guide to the Hindu Calendar",
    subtitle: "Understanding the five sacred limbs of Vedic timekeeping",
    category: "Vedic Wisdom",
    readTime: "7 min read",
    date: "June 4, 2026",
    excerpt:
      "Panchang is far more than a calendar. It is a living map of time — rooted in astronomy, refined over millennia, and designed to help you move through each day in alignment with natural rhythms.",
  },
  {
    slug: "sade-sati-guide",
    title: "Sade Sati: Saturn's 7.5-Year Journey and What It Means for You",
    subtitle: "Understanding Saturn's transit, its three phases, and powerful remedies",
    category: "Astrology",
    readTime: "9 min read",
    date: "June 4, 2026",
    excerpt:
      "Sade Sati is one of the most discussed periods in Vedic astrology. Often feared, rarely understood — here is everything you need to know about Saturn's transformative passage.",
  },
  {
    slug: "how-to-read-kundali",
    title: "How to Read Your Kundali: A Beginner's Guide to the Birth Chart",
    subtitle: "Houses, planets, signs — decoded in plain language",
    category: "Kundali",
    readTime: "8 min read",
    date: "June 4, 2026",
    excerpt:
      "Your Kundali is a snapshot of the sky at the moment you were born. Each planet, each house, each sign carries a message — and reading it doesn't have to be complicated.",
  },
];
