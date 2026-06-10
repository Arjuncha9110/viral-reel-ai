import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { blogPosts } from "@/data/blogPosts";
import { siteConfig } from "@/lib/siteConfig";

const categoryColors: Record<string, string> = {
  "Vedic Wisdom": "bg-amber-50 text-amber-700 border-amber-200",
  Astrology: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Kundali: "bg-rose-50 text-rose-700 border-rose-200",
  Numerology: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Panchang: "bg-orange-50 text-orange-700 border-orange-200",
};

const BlogPage = () => {
  return (
    <Layout>
      <SeoHead
        title="Blog | Divine Panchang — Vedic Wisdom, Astrology & Spiritual Guidance"
        description="Explore in-depth articles on Panchang, Kundali, Sade Sati, numerology, and Vedic astrology. Practical guidance for everyday spiritual seekers."
        path="/blog"
        type="website"
        keywords="panchang blog, vedic astrology articles, kundali guide, sade sati, numerology, spiritual guidance"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Divine Panchang Blog",
          url: siteConfig.websiteUrl + "/blog",
          description: "Vedic wisdom, astrology insights, and spiritual guidance.",
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Vedic Wisdom & Insights"
          subtitle="In-depth guides on Panchang, Kundali, Sade Sati, numerology, and the art of living in alignment with cosmic rhythms."
          icon={<BookOpen className="h-8 w-8" />}
        />

        <div className="mx-auto max-w-4xl">
          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <Link to={`/blog/${blogPosts[0].slug}`} className="group block">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 px-8 py-12 flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[blogPosts[0].category] ?? "bg-muted text-muted-foreground border-border"}`}>
                      <Tag className="w-3 h-3" />
                      {blogPosts[0].category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {blogPosts[0].readTime}
                    </span>
                    <span className="text-xs text-muted-foreground">{blogPosts[0].date}</span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    {blogPosts[0].excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Other posts */}
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.slice(1).map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <Link to={`/blog/${post.slug}`} className="group block h-full">
                  <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[post.category] ?? "bg-muted text-muted-foreground border-border"}`}>
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                    <h2 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
