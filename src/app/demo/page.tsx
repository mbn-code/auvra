import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, ArrowRight } from "lucide-react";
import LiveActivity from "@/components/LiveActivity";

export default async function DemoPage() {
  // SAFETY LOCK: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return notFound();
  }

  // Fetch items but randomize them to look like "Steals"
  const { data: items } = await supabase
    .from('pulse_inventory')
    .select('*')
    .limit(20);

  // Viral Pricing Logic: Everything is 85% OFF to create "Glitch" effect
  const viralItems = items?.map(item => ({
    ...item,
    listing_price: Math.round(item.listing_price * 0.15) // 15% of real price
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hyper-Active Notifications */}
      <LiveActivity productName="Moncler Maya" />
      
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
             <p className="text-red-500 text-xs font-black uppercase tracking-widest">System Glitch Detected</p>
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-zinc-900 mb-12 leading-[0.85]">
            ARCHIVE <br /> UNLOCKED.
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {viralItems?.map((item) => (
              <div key={item.id} className="group relative">
                <div className="aspect-[4/5] bg-zinc-50 rounded-[2rem] overflow-hidden mb-4 border border-zinc-100 relative">
                  <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                    -85% OFF
                  </div>
                </div>
                <div className="px-2">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight truncate">{item.title}</h3>
                  <div className="flex items-center gap-3">
                     <p className="text-2xl font-black text-red-600">€{item.listing_price}</p>
                     <p className="text-xs font-bold text-zinc-300 line-through decoration-red-500">€{Math.round(item.listing_price * 6.6)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
