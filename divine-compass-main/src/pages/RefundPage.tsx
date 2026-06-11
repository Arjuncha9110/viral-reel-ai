import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";

const RefundPage = () => {
  return (
    <Layout>
        <SeoHead
            title="Refund Policy | Divine Panchang"
            description="Refund policy for paid reports from Divine Panchang."
            path="/refund"
            type="website"
        />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Our Commitment</h2>
            <p>At Divine Panchang, we want you to be completely satisfied with your purchase. We take pride in the quality and accuracy of our personalized Vedic astrology reports.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Digital Products</h2>
            <p>Our products (Sade Sati Premium Report, Janam Kundali Report) are digital goods generated instantly upon payment. Because they are personalized and delivered immediately, <strong>all sales are generally final</strong>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">When We Issue Refunds</h2>
            <p>We will issue a full refund in the following situations:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Technical failure:</strong> Your report was not generated or delivered due to a technical error on our end</li>
              <li><strong>Duplicate payment:</strong> You were charged more than once for the same report</li>
              <li><strong>Report not received:</strong> You paid but did not receive your report within 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">How to Request a Refund</h2>
            <p>Email us at <a href="mailto:info@divinepanchang.space" className="text-primary underline">info@divinepanchang.space</a> within <strong>7 days</strong> of your purchase with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your name and email used at checkout</li>
              <li>Your payment/transaction ID</li>
              <li>A brief description of the issue</li>
            </ul>
            <p className="mt-2">We will respond within 2 business days and process approved refunds within 5–7 business days.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Non-Refundable Cases</h2>
            <p>We do not offer refunds if:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You changed your mind after the report was generated</li>
              <li>You entered incorrect birth details — please double-check before submitting</li>
              <li>You are dissatisfied with astrological predictions (these are spiritual guidance, not guarantees)</li>
              <li>The request is made more than 7 days after purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Contact Us</h2>
            <p>For refund requests or questions: <a href="mailto:info@divinepanchang.space" className="text-primary underline">info@divinepanchang.space</a></p>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default RefundPage;
