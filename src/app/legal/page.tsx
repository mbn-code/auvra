import PolicyLayout from "@/components/PolicyLayout";

export default function LegalNotice() {
  return (
    <PolicyLayout title="Legal Notice">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Operator Identity</h2>
          <p>Auvra is operated by mbn-code.dk.</p>
          <p className="mt-2">
            <strong>Contact:</strong><br />
            Email: malthe@mbn-code.dk<br />
            Support: Contact us via our Instagram for faster response regarding Pulse Archive drops.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Regulatory Information</h2>
          <p>This business is operated as a private activity in accordance with Danish tax laws regarding B-income (B-indkomst). No CVR is required for turnover under the established legal threshold.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Dispute Resolution</h2>
          <p>The European Commission provides a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr" target="_blank" className="underline">https://ec.europa.eu/consumers/odr</a>. We are not obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Intellectual Property</h2>
          <p>Auvra respect the intellectual property of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please contact us at the email provided above.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
