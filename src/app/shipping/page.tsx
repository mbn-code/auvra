import PolicyLayout from "@/components/PolicyLayout";

export default function DigitalDeliveryPolicy() {
  return (
    <PolicyLayout title="Digital Delivery & Access">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Source Link Unlocking</h2>
          <p>Auvra operates as a Curation-as-a-Service (CaaS) platform. We do not sell or ship physical products. Instead, we sell access to digital source links for exclusive archive pieces we have discovered.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Instant Access</h2>
          <p>Upon completing your curation fee payment or as part of your Society membership, the digital source link is provided immediately. You will also receive an email containing the source link(s) you have unlocked.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Purchasing the Physical Item</h2>
          <p className="mb-4">Once you have the digital source link, it is your responsibility to click the link, visit the third-party marketplace or private seller's page, and complete the purchase of the physical item there. Auvra is not responsible for the transaction, shipping, or fulfillment of the physical item.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Availability Constraints</h2>
          <p>Archive pieces are generally 1-of-1. While Auvra removes links from our public database once unlocked, there is a possibility that the item may be purchased by someone else on the third-party platform before you complete the transaction. We recommend purchasing the physical item immediately after unlocking the source link.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
