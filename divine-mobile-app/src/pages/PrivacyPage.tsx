import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";

const PrivacyPage = () => {
  return (
    <Layout>
        <SeoHead
            title="Privacy Policy | Divine Panchang"
            description="How Divine Panchang collects, uses, and protects your information."
            path="/privacy"
            type="website"
        />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">1. Who We Are</h2>
            <p>Divine Panchang (divinepanchang.space) provides Vedic astrology tools and personalized digital reports. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">2. Information We Collect</h2>
            <p>We collect the following information when you use our services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Personal details:</strong> Name, email address, date of birth, time of birth, and place of birth — provided when generating reports</li>
              <li><strong>Payment information:</strong> Processed securely by our payment partners (Razorpay, Paddle). We do not store card details</li>
              <li><strong>Usage data:</strong> Pages visited, browser type, and general location via cookies and analytics</li>
              <li><strong>Email:</strong> If you subscribe to our newsletter or updates</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To generate your personalized astrology reports</li>
              <li>To send your report and confirmation emails</li>
              <li>To improve our services and user experience</li>
              <li>To send occasional spiritual guidance emails (only if subscribed)</li>
              <li>To process payments and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Payment processors</strong> (Razorpay, Paddle) — for secure payment processing</li>
              <li><strong>Email services</strong> (Resend) — for sending your reports and transactional emails</li>
              <li><strong>Analytics</strong> (Cloudflare Analytics) — anonymised usage data only</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>We use essential cookies to operate the website and analytics cookies to understand how visitors use our site. You can disable cookies in your browser settings, though some features may not work correctly.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">6. Data Retention</h2>
            <p>We retain your birth details and report data for up to 12 months to allow report re-access. Payment records are retained as required by law. You may request deletion at any time.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:info@divinepanchang.space" className="text-primary underline">info@divinepanchang.space</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">8. Security</h2>
            <p>We use industry-standard security practices including HTTPS encryption, secure payment gateways, and Cloudflare protection to keep your data safe.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">9. Contact</h2>
            <p>For privacy-related questions: <a href="mailto:info@divinepanchang.space" className="text-primary underline">info@divinepanchang.space</a></p>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
