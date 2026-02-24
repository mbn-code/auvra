import PolicyLayout from "@/components/PolicyLayout";

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping & Logistics">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Global Logistics Network</h2>
          <p>Auvra operates a distributed logistics network across Northern Europe and the EU. Our archive pieces are sourced from various regional centers to ensure authenticity and speed.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Processing Times</h2>
          <p>Orders are processed within 24-48 business hours. For archive pieces, this includes a final secondary inspection to verify the item meets our integrity standards before dispatch.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Transit Estimates</h2>
          <p className="mb-4">Because Auvra operates as a sourcing concierge, your item is acquired directly from private collections and exclusive global sourcing networks upon your order. These private partners have an initial window of up to 5 business days to dispatch the item to our authentication hubs.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Standard Delivery (EU):</strong> 7-12 business days total.</li>
            <li><strong>International Delivery:</strong> 10-14 business days total.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Tracking & Verification</h2>
          <p>Every Auvra transfer is assigned a unique logistics ID. You will receive an automated dispatch notice with live tracking details as soon as your item clears the regional archive hub.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Customs & Duties</h2>
          <p>For orders within the EU cluster (Denmark, Germany, Poland, Sweden, Finland), no customs or import duties will apply. International orders may be subject to local import taxes which are the responsibility of the recipient.</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
