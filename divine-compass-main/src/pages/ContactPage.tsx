import { Layout } from "@/components/layout/Layout";
import { Mail, Clock, MessageCircle } from "lucide-react";

const ContactPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-sm text-muted-foreground mb-10">We're here to help. Reach out and we'll respond as soon as possible.</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">

          <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="mt-1 text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground mb-1">Email</h2>
              <p className="text-sm mb-2">For general queries, report issues, or feedback:</p>
              <a
                href="mailto:info@divinepanchang.space"
                className="text-primary font-medium hover:underline"
              >
                info@divinepanchang.space
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="mt-1 text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground mb-1">Response Time</h2>
              <p className="text-sm">We typically respond within 24–48 hours on business days.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="mt-1 text-primary">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground mb-1">What to Include</h2>
              <p className="text-sm">When writing to us, please mention:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Your name and registered email address</li>
                <li>The page or feature you're asking about</li>
                <li>A brief description of your query or issue</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Divine Panchang is operated from India. For privacy-related requests, please refer to our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
