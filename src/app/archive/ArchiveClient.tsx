"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, ChevronRight, Search, Filter } from "lucide-react";
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
    // Get available + recently sold items
    let query = supabase
      .from('pulse_inventory')
      .select('brand, images, listing_price, category, status')
      .in('status', ['available', 'sold']);

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
        
        // Update preview if this item is more expensive
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
    <div className="min-h-screen bg-white">
      <PulseHeartbeat />
      <section className="relative pt-40 pb-20 px-6 border-b border-zinc-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 opacity-[0.05] pointer-events-none rotate-12 scale-150">
           <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <Zap size={14} className="text-zinc-900" />
              Archive Categories
            </p>
            <h1 className="text-6xl md:text-8xl font-black text-zinc-900 mb-8 tracking-tighter leading-[0.95]">
              Curated <br /> Archives.
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed mb-12">
              Browse by heritage and house. Each brand represents a unique pillar of our curated pulse archive.
            </p>
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search High Houses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 pl-14 pr-6 py-5 rounded-full font-bold text-[12px] uppercase tracking-widest outline-none focus:border-black transition-all shadow-sm"
              />
            </div>
            {initialCategory && (
              <div className="mt-6 flex items-center gap-4">
                <div className="bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  Category: {initialCategory}
                </div>
                <Link href="/archive" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 underline underline-offset-4 hover:text-black">
                  Clear Filter
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="py-32 text-center text-zinc-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Syncing Archive Pulse...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-32 text-center">
             <p className="text-zinc-300 font-black text-2xl tracking-tighter mb-4 italic">"No brands found matching your search."</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8">
            {filteredBrands.map((brand) => (
              <Link key={brand.name} href={`/archive/brand/${encodeURIComponent(brand.name)}`} className="group block">
                <div className="aspect-[16/9] bg-zinc-50 rounded-[3rem] overflow-hidden mb-8 border border-zinc-100 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-zinc-100 relative">
                  <img src={brand.preview} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" alt={brand.name} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">{brand.count} Items</p>
                    <h2 className="text-3xl font-black tracking-tighter uppercase">{brand.name}</h2>
                  </div>
                  <div className="absolute bottom-8 right-8 bg-white p-4 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                    <ChevronRight size={20} className="text-black" />
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
