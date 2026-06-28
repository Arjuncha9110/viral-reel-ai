import { useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const KundaliFAQ = () => {
    const faqs = [
        {
            question: "What is Navamsa (D9) chart?",
            answer: "Navamsa (D9) is the 9th divisional chart and the most important varga chart in Vedic astrology. It represents marriage, spouse, dharma (life purpose), and inner spiritual strength. The D9 chart shows the fruit of your karmic actions and reveals the deeper qualities of planets. A planet strong in both D1 and D9 gives excellent results. Navamsa is essential for marriage compatibility and understanding your soul's journey."
        },
        {
            question: "Why is D10 important for career analysis?",
            answer: "Dasamsa (D10) is the divisional chart specifically for career, profession, status, and achievements. It magnifies the 10th house of the birth chart, revealing your professional destiny, work environment, authority, and public recognition. Analyzing D10 helps astrologers predict career success, job changes, business ventures, and professional challenges with remarkable accuracy."
        },
        {
            question: "Which divisional chart represents marriage?",
            answer: "Navamsa (D9) is the primary chart for marriage analysis. It reveals spouse characteristics, marriage timing, marital harmony, and relationship dynamics. Additionally, Saptamsa (D7) shows progeny and children from marriage. For a complete marriage analysis, astrologers examine D1 (7th house), D9 (spouse nature), and D7 (children) together."
        },
        {
            question: "What is Shashtiamsha (D60)?",
            answer: "Shashtiamsha (D60) is the 60th divisional chart, considered the most subtle and powerful varga. It reveals past-life karma, deep karmic patterns, and the ultimate fruit of planetary positions. D60 is used for precise timing of events and understanding the soul's journey across lifetimes. It's called the 'chart of karma' and shows the invisible forces shaping your destiny."
        },
        {
            question: "Why are divisional charts used in Vedic astrology?",
            answer: "Divisional charts (Vargas) provide microscopic precision in analyzing specific life areas. While the birth chart (D1) shows the overall life blueprint, divisional charts zoom into particular domains like marriage, career, children, education, and wealth. They reveal hidden strengths, karmic patterns, and subtle planetary influences. This multi-layered approach makes Vedic astrology incredibly accurate for predictions and remedies."
        },
        {
            question: "How many divisional charts are there?",
            answer: "There are 16 main divisional charts (Shodasha Vargas) in classical Vedic astrology: D1 (Rasi), D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa), D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa), D12 (Dwadashamsa), D16 (Shodashamsa), D20 (Vimshamsa), D24 (Chaturvimshamsa), D27 (Bhamsha), D30 (Trimshamsha), D40 (Khavedamsa), D45 (Akshavedamsa), and D60 (Shashtiamsha). Each serves a specific purpose in chart analysis."
        },
        {
            question: "What is the difference between Lagna and Navamsa?",
            answer: "Lagna (D1) is the birth chart showing your overall life, personality, and general fortune. Navamsa (D9) is the 9th divisional chart revealing marriage, dharma, and the deeper strength of planets. Think of D1 as the promise and D9 as the fulfillment. A planet may appear strong in D1 but weak in D9, indicating initial success but later challenges. Both charts must be analyzed together for accurate predictions."
        }
    ];

    // Generate Schema.org FAQ JSON-LD
    useEffect(() => {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };

        // Inject schema into page head
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(faqSchema);
        script.id = "kundali-faq-schema";

        // Remove existing schema if present
        const existing = document.getElementById("kundali-faq-schema");
        if (existing) {
            existing.remove();
        }

        document.head.appendChild(script);

        return () => {
            const schemaScript = document.getElementById("kundali-faq-schema");
            if (schemaScript) {
                schemaScript.remove();
            }
        };
    }, []);

    return (
        <section className="mt-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                    <HelpCircle className="h-7 w-7 text-primary" />
                    Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">
                    Common questions about divisional charts and Vedic astrology
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-border/50 rounded-xl px-6 bg-card hover:border-primary/30 transition-colors"
                    >
                        <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                    Have more questions? Consult with a qualified Vedic astrologer for personalized guidance.
                </p>
            </div>
        </section>
    );
};

export default KundaliFAQ;
