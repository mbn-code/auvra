import PolicyLayout from "@/components/PolicyLayout";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Returns & Transfers">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">The Concierge Model & Returns</h2>
          <p>Auvra operates as a premium sourcing concierge, meaning we acquire items from international private collectors specifically on your behalf when you place an order. Because we do not hold physical inventory, <strong>we cannot accept returns for "change of mind" or sizing issues</strong>. All acquisitions are final unless the item is proven inauthentic or significantly not as described.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Authenticity Guarantee</h2>
          <p>We stand behind the absolute authenticity of every archive piece. If an item is proven inauthentic by a certified third-party authenticator within <strong>30 days</strong> of purchase, Auvra will issue a full 100% refund, including all logistics fees.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">48-Hour Integrity Window</h2>
          <p>Due to the unique, one-of-one nature of archive pieces sourced from global private collections, we operate a strict 48-hour inspection window. Upon delivery, you have <strong>48 hours</strong> to report any discrepancies in condition or description. After this period, the acquisition is considered final.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Non-Returnable Items</h2>
          <p>Items marked as "Museum Grade" or "Final Sale" are not eligible for returns. Additionally, any item where the Auvra Archive Security Tag has been removed or tampered with is ineligible for return under the integrity window.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Initiating a Report</h2>
          <p>To report a condition discrepancy, please email <strong>malthe@mbn-code.dk</strong> within the 48-hour window with your order ID and high-resolution photographic evidence of the issue.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Refund Processing</h2>
          <p>Once a return is authorized and received at our regional hub, your refund will be processed back to your original payment method within 3-5 business days.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
