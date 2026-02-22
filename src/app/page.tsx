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
      {/* 1. ARCHIVE CAROUSEL HERO */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full z-0 opacity-[0.05] pointer-events-none">
           <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 flex items-center gap-2">
                <Zap size={12} className="fill-zinc-900 text-zinc-900" />
                Live Archive Pulse
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.9]">
                Recent <br />Secured Drops.
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
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black text-zinc-900 tracking-tighter leading-tight">{item.title}</h3>
                    <div className="bg-zinc-900 text-white px-4 py-2 rounded-full text-lg font-black shadow-lg">
                      €{Math.round(item.listing_price)}
                    </div>
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

      {/* 1.5. SOCIETY MEMBERSHIP CTA */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto bg-zinc-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="absolute top-0 right-0 p-64 bg-yellow-400 blur-[150px] opacity-10 rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap size={12} className="fill-black" />
                Auvra Society
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.95]">
                Unlock the <br /> Inner Archive.
              </h2>
              <p className="text-zinc-400 text-lg font-medium max-w-lg leading-relaxed">
                Members gain exclusive access to direct source links for steals, priority acquisition on high-heat drops, and up to 15% off concierge pricing.
              </p>
           </div>

           <div className="relative z-10 flex-shrink-0">
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-900/20"
              >
                Join Society <ArrowRight size={16} />
              </Link>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-4 text-center">
                Limited Intakes Open
              </p>
           </div>
        </div>
      </section>

      {/* 2. ATMOSPHERIC GRID (Mood Board - Commercial Safe) */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
           <div className="md:col-span-4 rounded-[3rem] overflow-hidden relative group border border-zinc-100">
              <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-8 left-8 text-white">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em]">Curation 01</p>
                 <h4 className="text-xl font-black tracking-tight uppercase">High House Heritage.</h4>
              </div>
           </div>
           <div className="md:col-span-8 grid grid-cols-2 gap-6">
              <div className="rounded-[3rem] overflow-hidden relative group border border-zinc-100">
                 <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" alt="" />
                 <div className="absolute inset-0 bg-black/40" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] opacity-0 group-hover:opacity-100 transition-opacity">Archive Pulse</p>
                 </div>
              </div>
              <div className="rounded-[3rem] overflow-hidden relative group border border-zinc-100">
                 <img src="https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" alt="" />
                 <div className="absolute inset-0 bg-black/30" />
              </div>
           </div>
        </div>
      </section>

      {/* 3. THE PHILOSOPHY (Atmospheric) */}
      <section className="relative py-40 mx-6 overflow-hidden rounded-[5rem]">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.3]" alt="" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 text-white">
           <Sparkles size={32} className="mx-auto text-yellow-400 mb-8" />
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Archive Sourcing <br /> Reimagined.</h2>
           <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
             Auvra is a premium sourcing concierge. Our neural engine monitors global private collections in real-time, securing 1-of-1 archive pieces for our clients. We don't just sell clothing; we manage the discovery and acquisition of modern artifacts.
           </p>
           <div className="flex justify-center gap-12 opacity-50">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Concierge</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Search Network</span>
           </div>
        </div>
      </section>

      {/* 4. THE PULSE LOGIC (Replacing physical storage with digital sync) */}
      <section className="max-w-7xl mx-auto px-6 py-32">
         <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">The Acquisition Engine</p>
               <h2 className="text-5xl font-black tracking-tighter text-zinc-900 leading-[0.95]">Discover. <br />Authenticate. <br />Acquire.</h2>
               <p className="text-zinc-500 font-medium text-lg max-w-sm">When you secure a piece, our concierge network immediately initiates the acquisition and verification process from its current global location.</p>
               <Link href="/archive" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-opacity">
                  View Private Archives <ArrowRight size={14} />
               </Link>
            </div>
            <div className="flex-1 w-full">
               <div className="aspect-square rounded-[4rem] overflow-hidden bg-zinc-50 relative border border-zinc-100 shadow-2xl shadow-zinc-100">
                  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-[3000ms] hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-12 left-12">
                     <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-70">Active Network</p>
                     <p className="text-white text-2xl font-black tracking-tighter uppercase">Global Sync Node 01</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}
