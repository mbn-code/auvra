"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, ChevronRight, Search, Fingerprint, Hexagon, ArrowRight } from "lucide-react";
import PulseHeartbeat from "@/components/PulseHeartbeat";
import { useSearchParams } from "next/navigation";

export default function ArchivePage() {
  const [brands, setBrands] = useState<{ name: string; preview: string; count: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  useEffect(() => {
    fetchBrands();
  }, [initialCategory]);

  async function fetchBrands() {
    setLoading(true);
    let query = supabase
      .from('pulse_inventory')
      .select('brand, images, listing_price, category, status')
      .eq('status', 'available'); // Default to only showing available in discovery

    if (initialCategory) {
      query = query.eq('category', initialCategory);
    }

    const { data, error } = await query;

    if (!error && data) {
      const brandMap: Record<string, { preview: string; count: number; maxPrice: number }> = {};
      data.forEach(item => {
        if (!brandMap[item.brand]) {
          brandMap[item.brand] = { preview: item.images[0], count: 0, maxPrice: 0 };
        }
        if (item.listing_price > brandMap[item.brand].maxPrice) {
          brandMap[item.brand].maxPrice = item.listing_price;
          brandMap[item.brand].preview = item.images[0];
        }
        brandMap[item.brand].count++;
      });

      const formattedBrands = Object.entries(brandMap).map(([name, stats]) => ({
        name,
        preview: stats.preview,
        count: stats.count
      })).sort((a, b) => b.count - a.count);

      setBrands(formattedBrands);
    }
    setLoading(false);
  }

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PulseHeartbeat />
      
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Architectural Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 opacity-[0.03] pointer-events-none text-black">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <pattern id="archive-grid" width="8" height="8" patternUnits="userSpaceOnUse">
               <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#archive-grid)" />
           </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="flex flex-col items-start mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-8 shadow-sm">
              <Hexagon size={12} className="text-zinc-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Inventory Indexing</span>
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic mb-12">
              The <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Archives.</span>
            </h1>
            
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-12">
              <p className="text-zinc-500 text-xl font-medium max-w-lg leading-tight tracking-tight">
                Filtered by heritage and house. Each node represents a unique pillar of our curated pulse network.
              </p>
              
              <div className="relative w-full md:w-96 group">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search High Houses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-zinc-200 pl-14 pr-6 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.2em] outline-none focus:border-black transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {initialCategory && (
              <div className="mt-12 flex items-center gap-4 animate-in zoom-in duration-500">
                <div className="bg-black text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={10} className="fill-yellow-400 text-yellow-400" />
                  Category: {initialCategory}
                </div>
                <Link href="/archive" className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                  Clear Node
                </Link>
              </div>
            )}
          </header>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="py-48 text-center">
            <div className="inline-block w-8 h-8 border-4 border-zinc-100 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-black uppercase tracking-[0.5em] text-[9px]">Syncing Mesh...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-48 text-center">
             <p className="text-zinc-300 font-black text-3xl tracking-tighter mb-4 italic uppercase leading-none opacity-50">"Node search returned null."</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBrands.map((brand) => (
              <Link key={brand.name} href={`/archive/brand/${encodeURIComponent(brand.name)}`} prefetch={true} className="group block relative">
                <div className="aspect-[4/3] bg-white rounded-[3.5rem] overflow-hidden mb-8 border border-zinc-100 transition-all duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group-hover:shadow-[0_30px_60px_rgb(0,0,0,0.06)] group-hover:-translate-y-2 relative">
                  <img src={brand.preview} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt={brand.name} />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  
                  <div className="absolute bottom-10 left-10 text-white z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-70">{brand.count} Artifacts</p>
                    <h2 className="text-4xl font-black tracking-[-0.04em] uppercase italic leading-none">{brand.name}</h2>
                  </div>
                  
                  <div className="absolute bottom-10 right-10 bg-white text-black p-5 rounded-full opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 shadow-2xl">
                    <ArrowRight size={24} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
