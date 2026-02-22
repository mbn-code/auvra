import PolicyLayout from "@/components/PolicyLayout";

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Acceptance of Terms</h2>
          <p>By accessing and using Auvra, you agree to be bound by these Terms of Service. Auvra is a premium sourcing concierge that facilitates the acquisition of unique, pre-owned archival items sourced globally.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Non-Affiliation</h2>
          <p>Auvra is an independent curation platform. We are not an authorized dealer, nor are we affiliated, associated, or officially connected with any of the brands featured in our archive. All trademarks, logos, and brand names are the property of their respective owners.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Authenticity & Money-Back Guarantee</h2>
          <p>We guarantee the authenticity of every item secured through our concierge. If an item is proven inauthentic by a certified third-party authenticator within 30 days of purchase, Auvra will issue a full 100% refund.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">The 48-Hour Inspection Period</h2>
          <p>All archive acquisitions are final after a 48-hour inspection period starting from the timestamp of delivery. Any condition discrepancies must be reported within this window to be eligible for resolution.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Logistics & Availability</h2>
          <p>The Auvra Archive Pulse is a real-time sync engine. In the event that an item becomes unavailable at the source before acquisition can be finalized, Auvra will issue an immediate full refund and notify the client.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Governing Law</h2>
          <p>These terms are governed by the laws of Denmark. Any disputes shall be handled within the jurisdiction of the Danish courts.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
