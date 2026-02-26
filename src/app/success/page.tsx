import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { products as staticProducts } from "@/config/products";
import { sendSecureNotification } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const type = params.type;
  const id = params.id;
  const sessionId = params.session_id;

  let productIds: string[] = [];
  if (id) productIds.push(id);

  // If we have a sessionId but no id, try to retrieve productIds from metadata
  if (sessionId && !id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.productIds) {
        productIds = session.metadata.productIds.split(',');
      }
    } catch (e) {
      console.error("Error retrieving Stripe session:", e);
    }
  }

  // Trigger notifications for all products
  for (const productId of productIds) {
    let productName = "";
    let sourceUrl = "";
    let profit = 0;
    let isArchive = false;

    // Determine if archive or static
    const { data: item } = await supabase
      .from('pulse_inventory')
      .select('*')
      .eq('id', productId)
      .single();

    if (item) {
      productName = item.title;
      sourceUrl = item.source_url;
      profit = item.potential_profit;
      isArchive = true;
    } else {
      const staticProduct = (staticProducts as any)[productId];
      if (staticProduct) {
        productName = staticProduct.name;
        sourceUrl = staticProduct.sourceUrl || "";
        profit = (staticProduct.price / 100) - 15;
      }
    }

    if (sourceUrl) {
      await sendSecureNotification({
        productName,
        vintedUrl: sourceUrl,
        profit,
        customerName: "New Order",
        customerAddress: "Check Stripe Dashboard"
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center relative">
            <CheckCircle className="text-zinc-900" size={48} strokeWidth={1.5} />
            <Zap className="absolute -top-2 -right-2 text-yellow-400 fill-yellow-400" size={24} />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Acquisition Initiated.</h1>
        <p className="text-zinc-500 mb-8 leading-relaxed font-medium px-6 text-sm">
          {productIds.length > 1 
            ? "Your request to secure these unique pieces has been received. Our concierge is currently initiating the acquisition and authentication process. You will receive tracking details once the transfers are finalized (24-48 hours)."
            : "Your request to secure this unique item has been received. Our concierge is currently initiating the acquisition and authentication process. You will receive tracking details once the transfer is finalized (24-48 hours)."
          }
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-black text-white py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all shadow-xl shadow-zinc-200"
        >
          Return to Archive
        </Link>
      </div>
    </div>
  );
}
