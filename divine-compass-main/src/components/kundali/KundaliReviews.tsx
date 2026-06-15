import { useState, useEffect } from "react";
import { MessageSquareHeart, ShieldCheck, Star, Quote, Send, CheckCircle, Phone, Mail } from "lucide-react";
import { COUNTRY_CODES } from "@/data/countryCodes";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "dp_kundali_reviews";

interface Review {
  name: string;
  location: string;
  title: string;
  body: string;
  stars: number;
  email?: string;
  phone?: string;       // stored as full number e.g. "9110295352"
  countryCode?: string; // e.g. "+91"
  isUser?: boolean;
}

const maskPhone = (countryCode: string, phone: string): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 3) return countryCode + " " + phone;
  const visible = digits.slice(0, 2);
  const masked = "*".repeat(Math.min(digits.length - 2, 4));
  return `${countryCode} ${visible}${masked}`;
};

const seedReviews: Review[] = [
  {
    name: "Meera S.",
    location: "Pune, Maharashtra",
    title: "Finally, a chart I can actually read",
    body: "I have tried multiple Kundali tools and most just throw numbers at you. This one gives the chart, the divisional layers, and enough context to understand what you are actually looking at. I came back three times in one week.",
    stars: 5,
  },
  {
    name: "Aditya V.",
    location: "Bengaluru, Karnataka",
    title: "Good for both beginners and people who already know Vedic",
    body: "The North Indian chart style with the planetary table underneath works well. The FAQ section answered questions I had been carrying for years about Navamsa and Dasamsa. Feels respectful of the tradition.",
    stars: 5,
  },
  {
    name: "Priya N.",
    location: "Delhi",
    title: "Calm and readable — no fear-based language",
    body: "What I appreciate most is that nothing here is designed to make you anxious. The placements are shown clearly, the interpretation is measured, and I can cross-check with Dasha and Sade Sati on the same platform.",
    stars: 5,
  },
];

const trustPoints = [
  {
    heading: "North & South Indian chart styles",
    detail: "Switch between chart modes depending on what you are accustomed to reading.",
  },
  {
    heading: "Divisional chart layers (D1 through D60)",
    detail: "Examine Navamsa, Dasamsa, Saptamsa, and other varga charts in one place.",
  },
  {
    heading: "No fear-based or manipulative claims",
    detail: "Every interpretation is framed for reflection, not alarm. The chart is a map, not a verdict.",
  },
];

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={n + " star" + (n > 1 ? "s" : "")}
        >
          <Star
            className={
              "h-5 w-5 transition-colors " +
              (n <= (hovered || value)
                ? "fill-sacred-amber text-sacred-amber"
                : "text-border")
            }
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, index }: { review: Review; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="relative rounded-2xl border border-border/70 bg-background/80 px-5 py-5 shadow-sm"
  >
    <Quote className="absolute right-4 top-4 h-6 w-6 text-primary/10" />
    <div className="mb-2.5 flex items-center gap-0.5 text-sacred-amber">
      {Array.from({ length: review.stars }).map((_, s) => (
        <Star key={s} className="h-3.5 w-3.5 fill-current" />
      ))}
    </div>
    <p className="mb-1.5 text-sm font-semibold text-foreground leading-snug">
      {review.title}
    </p>
    <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
    <div className="mt-4 flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-sacred-amber/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
        {review.name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">{review.name}</p>
        <p className="text-xs text-muted-foreground tracking-wide">{review.location}</p>
        {review.phone && review.countryCode && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
            <Phone className="h-2.5 w-2.5" />
            {maskPhone(review.countryCode, review.phone)}
          </p>
        )}
      </div>
      {review.isUser && (
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Your review
        </span>
      )}
    </div>
  </motion.div>
);

const KundaliReviews = () => {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stars, setStars] = useState(5);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUserReviews(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim() || !title.trim()) return;
    const newReview: Review = {
      name: name.trim(),
      location: location.trim() || "India",
      title: title.trim(),
      body: body.trim(),
      stars,
      email: email.trim(),
      phone: phone.trim(),
      countryCode,
      isUser: true,
    };
    const updated = [...userReviews, newReview];
    setUserReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSubmitted(true);
    setShowForm(false);
    setName(""); setLocation(""); setTitle(""); setBody(""); setStars(5); setEmail(""); setPhone(""); setCountryCode("+91");
  };

  const allReviews = [...seedReviews, ...userReviews];

  return (
    <motion.section
      className="mt-16 space-y-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
    >
      <div className="text-center space-y-3">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <MessageSquareHeart className="h-4 w-4" />
          <span className="font-medium tracking-wide">Reviews &amp; Feedback</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          What visitors value in this Kundali experience
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          This page is built around one principle: the chart should be genuinely usable,
          not just generated. Share your experience and help others discover Vedic astrology.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-start">

        <SpiritualCard hover={false}>
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-1 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary flex-shrink-0">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Visitor feedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {allReviews.length} reviews from our users
                  </p>
                </div>
              </div>

              {!submitted && (
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                >
                  <MessageSquareHeart className="h-4 w-4" />
                  {showForm ? "Cancel" : "Write a review"}
                </button>
              )}

              {submitted && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Review added!
                </div>
              )}
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                    <p className="text-sm font-semibold text-foreground">Share your experience</p>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Rating</label>
                      <StarPicker value={stars} onChange={setStars} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Your name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul K."
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                          <Mail className="h-3 w-3" /> Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                          <Phone className="h-3 w-3" /> Phone *
                        </label>
                        <div className="flex h-[42px] rounded-xl border border-border bg-background overflow-hidden focus-within:border-primary/50 transition">
                          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                            className="h-full w-[72px] shrink-0 border-r border-border bg-muted/40 px-2 text-xs font-bold text-foreground outline-none cursor-pointer">
                            {COUNTRY_CODES.map(c => <option key={c.iso3} value={c.code}>{c.code}</option>)}
                          </select>
                          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                            placeholder="9110295352"
                            className="flex-1 min-w-0 h-full px-3 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Review title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="One line about your experience"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Your review *</label>
                      <textarea
                        required
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="What did you find most useful? What could be improved?"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sacred-amber px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-110"
                    >
                      <Send className="h-4 w-4" />
                      Submit Review
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {allReviews.map((review, i) => (
                <ReviewCard key={review.name + i} review={review} index={i} />
              ))}
            </div>
          </div>
        </SpiritualCard>

        <SpiritualCard hover={false} className="border-sacred-amber/25 bg-sacred-amber/5">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Why this experience works
                </h3>
                <p className="text-sm text-muted-foreground">
                  A few strengths that make it easier to trust and return to.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {trustPoints.map((point, i) => (
                <motion.div
                  key={point.heading}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-xl border border-border/60 bg-background/90 px-4 py-4"
                >
                  <p className="text-sm font-semibold text-foreground mb-1">{point.heading}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{point.detail}</p>
                </motion.div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-background/80 px-4 py-4 text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">Used this chart?</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your feedback helps others understand what to expect and improves the experience for everyone.
              </p>
              {!submitted ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                >
                  <Star className="h-4 w-4" />
                  Write a review
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Thank you for sharing!
                </div>
              )}
            </div>
          </div>
        </SpiritualCard>
      </div>
    </motion.section>
  );
};

export default KundaliReviews;
