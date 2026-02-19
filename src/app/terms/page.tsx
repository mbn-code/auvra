import PolicyLayout from "@/components/PolicyLayout";

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Acceptance of Terms</h2>
          <p>By accessing and using Auvra, you agree to be bound by these Terms of Service. Auvra is a curated archive marketplace that facilitates the transfer of unique, pre-owned items sourced globally.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Inventory & Availability</h2>
          <p>The Auvra Archive Pulse is a real-time sync engine. Most archive pieces are "one-of-one." In the rare event that an item is secured by two individuals simultaneously, we prioritize the first timestamped transaction and issue an immediate full refund to the second party.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Pricing</h2>
          <p>Prices are final at the time of purchase. Auvra reserves the right to adjust archive pricing based on market fluctuation and rarity without prior notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Payment Security</h2>
          <p>Transactions are processed via Stripe using high-level encryption. Auvra never sees or stores your full financial details.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Limitation of Liability</h2>
          <p>Auvra shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our services or the purchase of archive items.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Governing Law</h2>
          <p>These terms are governed by the laws of Denmark. Any disputes shall be handled within the jurisdiction of the Danish courts.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
