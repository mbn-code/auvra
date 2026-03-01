import PolicyLayout from "@/components/PolicyLayout";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Returns & Refunds">
      <div className="space-y-8">

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Digital Access Model</h2>
          <p>Auvra provides access to digital source links (Curation-as-a-Service). When you pay a curation fee or use your Society membership to unlock a link, you receive immediate access to the digital content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Right of Withdrawal</h2>
          <p>Because you are purchasing immediate access to digital content (a source link), you agree that you lose your 14-day right of withdrawal as soon as the link is unlocked or emailed to you, in accordance with EU consumer protection laws for digital goods.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Refund Eligibility</h2>
          <p>Curation fees are generally <strong>non-refundable</strong> once a link is unlocked. However, if you unlock a link and the item is already sold on the third-party platform at the exact moment of unlocking, please contact us immediately with photographic evidence (screenshots). We will review the claim and issue a refund or provide an alternative curation credit at our discretion.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Third-Party Transactions</h2>
          <p>Auvra is not responsible for the physical item, its condition, shipping, or authenticity once you proceed to purchase it from the third-party seller. Any disputes regarding the physical purchase must be resolved directly with the third-party platform or seller according to their respective return and refund policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Governing Law</h2>
          <p>These terms are governed by the laws of Denmark and applicable EU legislation. Nothing in this policy limits any statutory consumer rights that cannot be waived by agreement under applicable law.</p>
        </section>

      </div>
    </PolicyLayout>
  );
}
