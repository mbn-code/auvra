import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy & GDPR">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Controller</h2>
          <p>Auvra (operated by mbn-code.dk) is the data controller for the personal information you provide. We are committed to protecting your privacy in compliance with the General Data Protection Regulation (GDPR).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Information We Collect</h2>
          <p>When you secure an archive piece, we collect:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Identity Data: Name, email address.</li>
            <li>Logistics Data: Shipping address, phone number.</li>
            <li>Transaction Data: Payment confirmation from Stripe (we do not store credit card details).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">How We Use Your Data</h2>
          <p>We use your information strictly for:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Processing and fulfilling your archive transfer.</li>
            <li>Communicating logistics updates and tracking.</li>
            <li>Legal compliance and fraud prevention.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Data Retention</h2>
          <p>We only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Your Rights</h2>
          <p>Under GDPR, you have the right to access, correct, or delete your personal data. You may also object to the processing of your data. To exercise these rights, please contact <strong>malthe@mbn-code.dk</strong>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Third-Party Processors</h2>
          <p>We share data with limited partners to enable our services:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Stripe:</strong> Payment processing.</li>
            <li><strong>Resend:</strong> Email communications.</li>
            <li><strong>Vercel:</strong> Website hosting.</li>
          </ul>
        </section>
      </div>
    </PolicyLayout>
  );
}
