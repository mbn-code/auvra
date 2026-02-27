"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { ExternalLink, Search, Zap, Filter, SortAsc, Clock, Target, TrendingUp, Star, ShoppingBag, CheckCircle } from "lucide-react";

export default function HuntTerminal({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [search, setSearch] = useState("");
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  
  // Filter States
  const [activeBrand, setActiveBrand] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSize, setActiveSize] = useState("All");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(true);

  // Derived unique values for filters
  const brands = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.brand)))], [items]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category)))], [items]);
  const sizes = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.size).filter(Boolean)))], [items]);

  async function secureForItem(id: string) {
    setActionedIds(prev => new Set(prev).add(id));
    // NOTE: This now uses an API route to safely secure the item, since the anon client can't write to pulse_inventory
    const res = await fetch('/api/admin/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'secure', itemId: id })
    });
    
    if (!res.ok) {
      alert("Failed to secure");
      setActionedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const query = search.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(query) || 
                           item.brand.toLowerCase().includes(query);
      const matchesBrand = activeBrand === "All" || item.brand === activeBrand;
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSize = activeSize === "All" || item.size === activeSize;
      const matchesPrice = item.source_price <= maxPrice;

      return matchesSearch && matchesBrand && matchesCategory && matchesSize && matchesPrice;
    });

    // Sorting Logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.source_price - b.source_price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.source_price - a.source_price);
    } else if (sortBy === "profit") {
      result.sort((a, b) => b.potential_profit - a.potential_profit);
    } else if (sortBy === "value") {
      result.sort((a, b) => (b.potential_profit / b.source_price) - (a.potential_profit / a.source_price));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [items, search, activeBrand, activeCategory, activeSize, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex">
      {/* Sidebar Filters */}
      <aside className={`w-80 border-r border-zinc-800 p-8 flex flex-col gap-10 sticky top-0 h-screen overflow-y-auto transition-all ${showFilters ? 'translate-x-0' : '-translate-x-full absolute'}`}>
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-8">
            <Target size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Targeting Suite</span>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Search</h4>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-3 rounded-xl text-xs outline-none focus:border-red-500"
                  placeholder="Query archive..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Max Source Cost</h4>
                <span className="text-[10px] font-black text-red-500">€{maxPrice}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Optimization</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'newest', label: 'Newest Sync', icon: Clock },
                  { id: 'value', label: 'Best Value Ratio', icon: Zap },
                  { id: 'profit', label: 'Max Absolute Profit', icon: TrendingUp },
                  { id: 'price-asc', label: 'Lowest Cost', icon: SortAsc },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      sortBy === opt.id ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">House Selection</h4>
              <select 
                value={activeBrand}
                onChange={(e) => setActiveBrand(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-red-500"
              >
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Apparel Category</h4>
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-red-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fit Scope</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setActiveSize(sz)}
                    className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                      activeSize === sz ? "bg-white text-black" : "bg-zinc-900 text-zinc-500 hover:text-white"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all"
            >
              <Filter size={20} className={showFilters ? 'text-red-500' : 'text-white'} />
            </button>
            <h1 className="text-4xl font-black tracking-tighter">HUNT TERMINAL v2.0</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-red-500">{filteredItems.length}</p>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Matches found</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isActioned = actionedIds.has(item.id) || item.is_owned;
            return (
              <div key={item.id} className={`bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border transition-all flex flex-col group ${isActioned ? 'border-green-500 opacity-50' : 'border-zinc-800 hover:border-red-500'}`}>
                <div className="aspect-square relative overflow-hidden">
                  <img src={item.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                      {item.brand}
                    </div>
                    <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                      {item.category}
                    </div>
                  </div>
                  {isActioned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                       <CheckCircle size={48} className="text-green-500" />
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-black tracking-tight leading-tight mb-6 line-clamp-2 uppercase h-12">{item.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Source Cost</p>
                      <p className="text-2xl font-black text-white">€{Math.round(item.source_price)}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Auvra Listing</p>
                      <p className="text-2xl font-black text-zinc-500">€{Math.round(item.listing_price)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6 px-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                     <div className="flex items-center gap-2">
                        <TrendingUp size={12} className="text-green-500" />
                        Profit: <span className="text-white">€{Math.round(item.potential_profit)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        Seller: <span className="text-white">{item.seller_rating} ({item.seller_reviews_count})</span>
                     </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <a 
                      href={item.source_url} 
                      target="_blank"
                      className="flex items-center justify-center gap-3 w-full bg-zinc-800 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700"
                    >
                      <ExternalLink size={16} /> Open Source
                    </a>
                    <button 
                      onClick={() => secureForItem(item.id)}
                      disabled={isActioned}
                      className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                        isActioned 
                        ? 'bg-green-600 text-white cursor-default' 
                        : 'bg-white text-black hover:bg-red-500 hover:text-white shadow-zinc-950'
                      }`}
                    >
                      <ShoppingBag size={16} /> {isActioned ? 'Secured for Store' : 'Secure for Auvra'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-40 text-center">
             <p className="text-zinc-700 font-black text-4xl tracking-tighter italic mb-4">"NO MATCHES FOUND IN ARCHIVE."</p>
             <button onClick={() => { setActiveBrand("All"); setActiveCategory("All"); setMaxPrice(5000); setSearch(""); }} className="text-red-500 font-black uppercase tracking-widest text-[10px] underline underline-offset-8">
                Reset All Parameters
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
