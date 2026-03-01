import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy & GDPR">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Lawful Basis for Processing</h2>
          <p>We process your personal data based on <strong>Contractual Necessity</strong> (to fulfil your order) and <strong>Legal Obligation</strong> (for tax and accounting purposes). For analytics, attribution tracking, and marketing communications, we rely on your <strong>Explicit Consent</strong> given through our cookie preference banner.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Controller</h2>
          <p>Auvra (operated by mbn-code.dk) is the data controller. Contact: <strong>malthe@mbn-code.dk</strong>. We only collect data that is strictly necessary for the stated purposes below.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Identity:</strong> Name and email address, collected at checkout or newsletter signup.</li>
            <li><strong>Fulfilment:</strong> Shipping address and phone number are collected at checkout only if required for physical utility products. For digital access (source links), only an email is required.</li>
            <li><strong>Financial:</strong> We use Stripe for payments. We do not store or see your credit card details.</li>
            <li><strong>Analytics (consent-based):</strong> If you accept cookies, we collect anonymised page-view and interaction events (via our internal Pulse analytics system) and aggregate traffic data (via Vercel Analytics). This data does not contain your name or email.</li>
            <li><strong>Attribution (consent-based):</strong> If you arrive via a referral or campaign link containing a <code>utm_creative_id</code> or <code>ref</code> parameter, that identifier is stored in a cookie to measure campaign effectiveness. This is only set with your consent.</li>
            <li><strong>Fingerprinting (consent-based):</strong> With your consent, a non-persistent session fingerprint is derived from your IP address and browser user-agent (SHA-256 hashed) for fraud-detection and deduplication purposes. This is not used for cross-site tracking.</li>
            <li><strong>Newsletter consent record:</strong> When you sign up for our newsletter, we store a SHA-256 hash of your email address, the timestamp of consent, and your IP address. This is required to demonstrate lawful basis under GDPR Art. 7.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Cookies</h2>
          <p>We use the following cookies:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>auvra_session_id</strong> — Essential. A random session identifier required for checkout and order tracking. Expires in 30 days.</li>
            <li><strong>auvra_consent</strong> — Essential. Stores your cookie preference so we respect it on subsequent visits.</li>
            <li><strong>auvra_fingerprint</strong> — Analytics. Consent-based. A hashed device fingerprint for fraud detection. Expires in 30 days.</li>
            <li><strong>auvra_creative_id</strong> — Analytics/Attribution. Consent-based. Stores a campaign reference ID if you arrived via a tracked link. Expires in 30 days.</li>
          </ul>
          <p className="mt-4">You can withdraw your consent at any time by clearing your browser cookies or adjusting your preference through our cookie banner (reload the page after clearing the <code>auvra_consent</code> cookie to see the banner again).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Third-Party Processors</h2>
          <p>We utilise the following processors under Data Processing Agreements:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Stripe:</strong> Payment processing and fraud protection. Data transferred under EU Standard Contractual Clauses.</li>
            <li><strong>Resend:</strong> Transactional email delivery (order confirmations, welcome emails).</li>
            <li><strong>Supabase:</strong> Encrypted database storage for orders, profiles, and consent records.</li>
            <li><strong>Cloudinary:</strong> Image processing and delivery for product photography.</li>
            <li><strong>Vercel:</strong> Website hosting and aggregate traffic analytics (no personally identifiable information is collected by Vercel Analytics).</li>
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
            <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Withdrawal:</strong> Withdraw your consent at any time without affecting the lawfulness of prior processing.</li>
          </ul>
          <p className="mt-4 text-zinc-900 font-bold underline">To exercise any of these rights, email malthe@mbn-code.dk.</p>
          <p className="mt-2">You also have the right to lodge a complaint with your national supervisory authority. In Denmark: <strong>Datatilsynet</strong> (datatilsynet.dk).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Security Measures</h2>
          <p>We implement high-level technical security, including TLS encryption in transit, encrypted database storage, HMAC-signed admin sessions, and strict data minimisation. Our infrastructure partners (Stripe, Vercel, Supabase) are industry leaders in secure cloud operations.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Retention</h2>
          <p>We retain transaction and order data for the minimum period required by Danish tax law (typically 5 years). Shipping address data is cleared once the return period has expired. Newsletter consent records are retained for as long as you remain a subscriber, plus 3 years thereafter to demonstrate historical consent. Analytics data is retained for a maximum of 12 months.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
