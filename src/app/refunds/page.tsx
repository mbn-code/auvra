import PolicyLayout from "@/components/PolicyLayout";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Returns & Transfers">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Our Guarantee</h2>
          <p>We stand behind the authenticity and quality of every archive piece. If an item does not match the description or condition report provided in the archive pulse, we offer a full return and refund.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">30-Day Protection</h2>
          <p>You have 30 days from the date of delivery to initiate a return request. To be eligible, the Auvra Archive Tag must remain attached and the item must be in the same condition as received.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Non-Returnable Items</h2>
          <p>Certain limited-edition archive pieces marked as "Final Sale" or items where the security tag has been removed are not eligible for returns due to the unique nature of the inventory.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Initiating a Return</h2>
          <p>To start a return, please contact our logistics team at <strong>malthe@mbn-code.dk</strong> with your order ID. We will provide a pre-paid regional shipping label for our EU customers.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Refund Processing</h2>
          <p>Once your return is received and inspected at our hub, your refund will be processed back to your original payment method within 3-5 business days.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
