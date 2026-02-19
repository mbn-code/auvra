"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function ArchivePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchiveItems();
  }, []);

  async function fetchArchiveItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pulse_inventory')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Archive Hero */}
      <section className="pt-40 pb-20 px-6 border-b border-zinc-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <Zap size={14} className="text-zinc-900" />
              Live Pulse Archive
            </p>
            <h1 className="text-6xl md:text-8xl font-black text-zinc-900 mb-8 tracking-tighter leading-[0.95]">
              Real-time <br /> Curation.
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed">
              Our autonomous algorithm scans international archives hourly. These are unique, one-off pieces captured for the Auvra collection.
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-green-500 mb-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Pulse Active
             </div>
             <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed max-w-[180px]">
                Inventory updates every 60 minutes. Global logistics enabled.
             </p>
          </div>
        </div>
      </section>

      {/* Dynamic Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="py-32 text-center text-zinc-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Syncing with Archive Pulse...
          </div>
        ) : items.length === 0 ? (
          <div className="py-32 text-center">
             <p className="text-zinc-300 font-black text-2xl tracking-tighter mb-4 italic">"The archives are currently empty."</p>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Next scan in 42 minutes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            {items.map((item) => (
              <Link key={item.id} href={`/archive/${item.id}`} className="group block">
                <div className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden mb-8 border border-zinc-100 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-zinc-100 relative">
                  <img src={item.images[0]} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" alt={item.title} />
                  <div className="absolute top-6 left-6">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border border-zinc-50">
                      {item.brand}
                    </div>
                  </div>
                </div>
                <div className="px-2 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tighter leading-tight mb-1 group-hover:underline decoration-1 underline-offset-4">
                      {item.title}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.condition}</p>
                  </div>
                  <div className="text-lg font-bold text-zinc-900">
                    ${Math.round(item.listing_price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Casino Scarcity Banner */}
      <section className="bg-black text-white py-32 rounded-[5rem] mx-6 mb-12 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="grid grid-cols-6 gap-4 rotate-12 scale-150">
               {[...Array(24)].map((_, i) => (
                 <div key={i} className="aspect-square bg-white rounded-full blur-3xl" />
               ))}
            </div>
         </div>
         <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] mb-12 opacity-50">Pulse Velocity</p>
            <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter leading-[0.95]">Items move fast. <br /> Don't wait.</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-16 opacity-30">
               <div className="text-center">
                  <p className="text-3xl font-black">1.2k</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-1">Daily Scans</p>
               </div>
               <div className="text-center">
                  <p className="text-3xl font-black">14</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-1">Archive Locales</p>
               </div>
               <div className="text-center">
                  <p className="text-3xl font-black">100%</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-1">Authentication</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
