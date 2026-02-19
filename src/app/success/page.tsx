import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { products } from "@/config/products";
import { sendSecureNotification } from "@/lib/notifications";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const type = params.type;
  const id = params.id;
  const sessionId = params.session_id;

  // Trigger "Tap-to-Secure" notification
  if (id && sessionId) {
    let productName = "";
    let sourceUrl = "";
    let profit = 0;

    if (type === 'archive') {
      const { data: item } = await supabase
        .from('pulse_inventory')
        .select('*')
        .eq('id', id)
        .single();
      if (item) {
        productName = item.title;
        sourceUrl = item.source_url;
        profit = item.potential_profit;
      }
    } else {
      const staticProduct = products[id];
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center relative">
            <CheckCircle className="text-zinc-900" size={48} strokeWidth={1.5} />
            <Zap className="absolute -top-2 -right-2 text-yellow-400 fill-yellow-400" size={24} />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Acquisition Initiated.</h1>
        <p className="text-zinc-500 mb-8 leading-relaxed font-medium px-6 text-sm">
          {type === 'archive' 
            ? "Your request to secure this unique archive piece has been received. Our concierge is currently initiating the acquisition and authentication process from its global location. You will receive tracking details once the transfer is finalized (24-48 hours)."
            : "Thank you for securing your Auvra utility. Your request is being processed for immediate acquisition and dispatch from our partner network."
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
