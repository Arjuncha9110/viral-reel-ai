import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";

const TermsPage = () => {
  return (
    <Layout>
        <SeoHead
            title="Terms of Service | Divine Panchang"
            description="Terms of service for using Divine Panchang's free panchang, kundali, and numerology tools."
            path="/terms"
            type="website"
        />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Divine Panchang ("we", "us", "our") at divinepanchang.space, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">2. Description of Services</h2>
            <p>Divine Panchang provides Vedic astrology tools including daily Panchang, Janam Kundali generation, Sade Sati analysis, numerology, and premium personalized PDF reports. Our services are for informational and spiritual guidance purposes only.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">3. Digital Products & Payments</h2>
            <p>Our premium reports (including the Sade Sati Premium Report and Janam Kundali Report) are digital products delivered as instant PDF downloads. All payments are processed securely through our payment partners. Prices are displayed at checkout in INR (Indian customers) or USD (international customers).</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">4. Refund Policy</h2>
            <p>Due to the digital nature of our products, all sales are final once a report has been generated and delivered. If you experience a technical issue preventing access to your report, please contact us at info@divinepanchang.space within 7 days of purchase and we will resolve the issue or provide a refund at our discretion.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">5. Disclaimer</h2>
            <p>Divine Panchang provides astrological content for spiritual and entertainment purposes only. Our reports and tools are not a substitute for professional advice (medical, legal, financial, or psychological). We make no guarantees about the accuracy or outcomes of astrological predictions.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">6. Intellectual Property</h2>
            <p>All content on this website — including text, graphics, reports, and tools — is the property of Divine Panchang and protected by applicable copyright laws. You may not reproduce or distribute our content without written permission.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">7. User Responsibilities</h2>
            <p>You agree to provide accurate information when generating reports and not to misuse our services. You are responsible for maintaining the confidentiality of your account and report access links.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
            <p>Divine Panchang shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid for the specific service in question.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">9. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">10. Contact</h2>
            <p>For questions about these terms, contact us at: <a href="mailto:info@divinepanchang.space" className="text-primary underline">info@divinepanchang.space</a></p>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
