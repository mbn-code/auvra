"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, ArrowLeft, Filter } from "lucide-react";

export default function BrandArchivePage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandName } = use(params);
  const decodedBrand = decodeURIComponent(brandName);
  
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandItems();
  }, [decodedBrand]);

  async function fetchBrandItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pulse_inventory')
      .select('*')
      .eq('brand', decodedBrand)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
      setFilteredItems(data);
      
      if (data.length > 15) {
        const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
        setCategories(["All", ...uniqueCategories]);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, items]);

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-40 pb-20 px-6 border-b border-zinc-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-2xl">
            <Link 
              href="/archive" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black mb-12 transition-colors"
            >
              <ArrowLeft size={14} />
              All Brands
            </Link>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <Zap size={14} className="text-zinc-900" />
              Archive Collection
            </p>
            <h1 className="text-6xl md:text-8xl font-black text-zinc-900 mb-8 tracking-tighter leading-[0.95] uppercase">
              {decodedBrand}.
            </h1>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black tracking-tighter text-zinc-900">{items.length}</p>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Available Pieces</p>
          </div>
        </div>
      </section>

      {/* Category Tabs if > 15 items */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-12">
          <div className="flex flex-wrap gap-4 items-center">
            <Filter size={16} className="text-zinc-400 mr-2" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? "bg-black text-white shadow-xl shadow-zinc-200" 
                    : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="py-32 text-center text-zinc-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Syncing Archive...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-32 text-center">
             <p className="text-zinc-300 font-black text-2xl tracking-tighter mb-4 italic">"No items found in this selection."</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/archive/${item.id}`} className="group block">
                <div className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden mb-8 border border-zinc-100 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-zinc-100 relative">
                  <img src={item.images[0]} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" alt={item.title} />
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
    </div>
  );
}
