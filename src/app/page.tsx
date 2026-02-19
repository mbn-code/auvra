import Link from "next/link";
import { products } from "@/config/products";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Sparkles, Flame, Zap } from "lucide-react";

export default async function Home() {
  const staticProducts = Object.values(products);
  
  // Fetch high-margin available clothing for the carousel
  const { data: archiveItems } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .order('potential_profit', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. ARCHIVE CAROUSEL HERO (Clothing First) */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 flex items-center gap-2">
                <Zap size={12} className="fill-zinc-900 text-zinc-900" />
                Live Archive Pulse
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900">
                Fresh Archive Drops.
              </h1>
            </div>
            <Link href="/archive" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1">
              View Entire Archive <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide -mx-6 px-6 mask-fade-right">
            {archiveItems && archiveItems.length > 0 ? (
              archiveItems.map((item) => (
                <Link key={item.id} href={`/archive/${item.id}`} className="min-w-[300px] md:min-w-[400px] group">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-50 border border-zinc-100 mb-6 relative">
                    <img 
                      src={item.images[0]} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      alt={item.title} 
                    />
                    <div className="absolute top-6 left-6">
                       <div className="bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                          {item.brand}
                       </div>
                    </div>
                    {item.potential_profit > 60 && (
                      <div className="absolute bottom-6 left-6">
                        <div className="bg-yellow-400 text-black px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                          Rare Find
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start px-2">
                    <h3 className="text-xl font-black text-zinc-900 tracking-tighter leading-tight">{item.title}</h3>
                    <p className="text-lg font-bold">€{Math.round(item.listing_price)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="w-full py-24 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Awaiting Pulse Sync...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. THE PHILOSOPHY */}
      <section className="py-24 bg-zinc-900 text-white rounded-[5rem] mx-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <Sparkles size={32} className="mx-auto text-yellow-400 mb-8" />
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">We curate what <br /> the world forgets.</h2>
           <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
             Auvra is a live-sync archive of unique objects and clothing. Our algorithm scans global marketplaces every hour to secure pieces that define modern culture.
           </p>
           <div className="flex justify-center gap-12 opacity-30">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">24/7 Monitoring</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Verified Authenticity</span>
           </div>
        </div>
      </section>

      {/* 3. DAILY UTILITIES (Problem Solvers) */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <header className="mb-20">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 text-center">Auvra Utilities</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-center">Problem Solvers.</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {staticProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="aspect-square bg-zinc-50 rounded-[3rem] overflow-hidden mb-8 border border-zinc-100 transition-all duration-700 group-hover:shadow-3xl group-hover:shadow-zinc-200">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{product.category}</p>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tighter mb-4 group-hover:underline decoration-2 underline-offset-8">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-zinc-900">€{(product.price / 100).toFixed(0)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
