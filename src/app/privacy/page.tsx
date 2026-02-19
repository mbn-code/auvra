import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy & GDPR">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Lawful Basis for Processing</h2>
          <p>We process your personal data based on <strong>Contractual Necessity</strong> (to fulfill your order) and <strong>Legal Obligation</strong> (for tax and accounting purposes). For non-essential communications, we rely on your <strong>Explicit Consent</strong>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Controller</h2>
          <p>Auvra (operated by mbn-code.dk) is the data controller. We only collect data that is strictly necessary for order fulfillment and secure communication.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Identity:</strong> Name, email address.</li>
            <li><strong>Logistics:</strong> Shipping address, phone number.</li>
            <li><strong>Financial:</strong> We use Stripe for payments. We do not store or see your credit card details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Subject Rights</h2>
          <p>Under GDPR, you have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
            <li><strong>Erasure:</strong> Request deletion of your data (Right to be Forgotten).</li>
            <li><strong>Portability:</strong> Request a transfer of your data to another service.</li>
            <li><strong>Withdrawal:</strong> Withdraw your consent at any time.</li>
          </ul>
          <p className="mt-4 text-zinc-900 font-bold underline">To exercise any of these rights, email malthe@mbn-code.dk.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Security Measures</h2>
          <p>We implement high-level technical security, including 256-bit SSL encryption and strict data minimization. Our partners (Stripe, Vercel) are industry leaders in secure infrastructure.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Retention</h2>
          <p>We retain transaction data for the minimum period required by Danish tax law (typically 5 years). Personal data used for shipping is cleared once logistics are completed and the return period has expired.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Third-Party Processors</h2>
          <p>We utilize the following processors under Data Processing Agreements:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Stripe:</strong> Payment processing & Fraud protection.</li>
            <li><strong>Resend:</strong> Transactional email delivery.</li>
            <li><strong>Supabase:</strong> Encrypted database storage.</li>
            <li><strong>Cloudinary:</strong> Image processing.</li>
          </ul>
        </section>
      </div>
    </PolicyLayout>
  );
}
