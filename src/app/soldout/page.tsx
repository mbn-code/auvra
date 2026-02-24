import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Zap, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { getEstimatedMarketValue } from "@/lib/pricing";

export const dynamic = 'force-dynamic';

export default async function SoldOutPage() {
  // Only allow on localhost (development environment)
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  // Fetch a few premium items to act as the "last remaining" items
  const { data: remainingItems } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .in('brand', ['Chrome Hearts', 'Louis Vuitton', 'Prada', 'Arc\'teryx', 'Chanel'])
    .gte('listing_price', 250)
    .order('created_at', { ascending: false })
    .limit(6);

  const categories = [
    { name: "Outerwear", count: 0 },
    { name: "Knitwear", count: 0 },
    { name: "Pants & Denim", count: 0 },
    { name: "Footwear", count: 0 },
    { name: "Headwear", count: 0 },
    { name: "Bags & Leather", count: "3 Left" },
    { name: "Jewelry", count: "1 Left" },
    { name: "Accessories", count: 0 },
  ];

  const brands = [
    "Balenciaga", "Bottega Veneta", "Burberry", "CP Company", "Corteiz", "Dickies",
    "Hermès", "Nike", "Patagonia", "Ralph Lauren", "Salomon", "Stone Island", "Stüssy", "Supreme"
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Warning Hero */}
        <div className="bg-red-600/10 border border-red-500/20 rounded-[3rem] p-12 text-center mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-red-600 blur-[150px] opacity-20 rounded-full pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <AlertTriangle size={12} />
            Archive Depleted
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
            98% of Batch 01 <br /> Has Been Secured.
          </h1>
          <p className="text-red-200/80 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Due to unprecedented demand from the Auvra Society, almost all archive categories and partner brands have been fully depleted. The next global injection is scheduled for next week.
          </p>
        </div>

        {/* Depleted Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-4 space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-zinc-800 pb-4">
               Category Status
             </h3>
             <ul className="space-y-4">
               {categories.map(c => (
                 <li key={c.name} className={`flex justify-between items-center text-sm font-bold tracking-wider uppercase ${c.count === 0 ? 'text-zinc-600 line-through' : 'text-yellow-400'}`}>
                   <span>{c.name}</span>
                   <span>{c.count === 0 ? 'SOLD OUT' : c.count}</span>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="lg:col-span-8 space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-zinc-800 pb-4">
               Brand Network Status
             </h3>
             <div className="flex flex-wrap gap-3">
                {brands.map(b => (
                  <div key={b} className="bg-zinc-900 border border-zinc-800 text-zinc-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest line-through">
                    {b} - SOLD OUT
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Remaining Items */}
        <div className="mb-24">
          <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-6">
             <div>
               <h2 className="text-3xl font-black tracking-tighter">The Final Assets.</h2>
               <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mt-2">
                 Heavily discounted to clear remaining inventory.
               </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingItems && remainingItems.map((item) => {
              // Create a massive fake discount just for this page to make them look like crazy final steals
              const originalMarketValue = getEstimatedMarketValue(item.listing_price, item.brand, item.category) || (item.listing_price * 1.8);
              const clearancePrice = Math.round(item.listing_price * 0.7); // 30% off the already curated price!

              return (
                <Link 
                  key={item.id} 
                  href={`/archive/${item.id}`} 
                  className="group block bg-zinc-900 rounded-[2.5rem] p-4 border border-zinc-800 hover:border-zinc-600 transition-all"
                >
                  <div className="aspect-[4/5] bg-zinc-950 rounded-[2rem] overflow-hidden mb-6 relative">
                    <Image 
                      src={item.images[0]} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                      alt={item.title} 
                    />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                        Clearance
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <h3 className="text-lg font-black text-white tracking-tighter leading-tight mb-2 truncate">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 line-through decoration-red-500 mb-0.5">
                          €{Math.ceil(originalMarketValue / 10) * 10}
                        </span>
                        <span className="text-2xl font-black text-yellow-400">
                          €{clearancePrice}
                        </span>
                      </div>
                      
                      <div className="bg-white text-black p-3 rounded-full group-hover:bg-yellow-400 transition-colors">
                         <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {(!remainingItems || remainingItems.length === 0) && (
              <div className="col-span-full py-24 text-center">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zero assets remaining.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
