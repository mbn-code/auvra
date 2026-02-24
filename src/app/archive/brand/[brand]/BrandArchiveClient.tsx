"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, ArrowLeft, Filter, ChevronDown, SortAsc, SortDesc, Clock, Search, Lock } from "lucide-react";
import PulseHeartbeat from "@/components/PulseHeartbeat";
import { createClient } from "@/lib/supabase-client";

export default function BrandArchivePage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandName } = use(params);
  const decodedBrand = decodeURIComponent(brandName);
  const supabaseClient = createClient();
  
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeCondition, setActiveCondition] = useState<string>("All");
  const [activeSize, setActiveSize] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('membership_tier')
          .eq('id', session.user.id)
          .single();
        if (profile?.membership_tier === 'society') setIsMember(true);
      }
    };
    checkMembership();
    fetchBrandItems();
  }, [decodedBrand]);

  async function fetchBrandItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pulse_inventory')
      .select('*')
      .eq('brand', decodedBrand)
      .in('status', ['available', 'sold'])
      .order('created_at', { ascending: false });

    if (!error && data) {

      setItems(data);
      
      const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
      setCategories(["All", ...uniqueCategories]);

      const uniqueConditions = Array.from(new Set(data.map(item => item.condition).filter(Boolean)));
      setConditions(["All", ...uniqueConditions]);

      const uniqueSizes = Array.from(new Set(data.map(item => item.size).filter(Boolean)));
      setSizes(["All", ...uniqueSizes]);
    }
    setLoading(false);
  }

  useEffect(() => {
    let result = [...items];

    if (searchQuery) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory !== "All") {
      result = result.filter(item => item.category === activeCategory);
    }

    if (activeCondition !== "All") {
      result = result.filter(item => item.condition === activeCondition);
    }

    if (activeSize !== "All") {
      result = result.filter(item => item.size === activeSize);
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.listing_price - b.listing_price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.listing_price - a.listing_price);
    } else if (sortBy === "savings") {
      result.sort((a, b) => (b.listing_price - (b.member_price || b.listing_price * 0.9)) - (a.listing_price - (a.member_price || a.listing_price * 0.9)));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredItems(result);
  }, [activeCategory, activeCondition, activeSize, sortBy, items]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Archive",
        "item": "https://auvra-nine.vercel.app/archive"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": decodedBrand,
        "item": `https://auvra-nine.vercel.app/archive/brand/${brandName}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PulseHeartbeat />
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
             <p className="text-2xl font-black tracking-tighter text-zinc-900">{filteredItems.length}</p>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Available Pieces</p>
          </div>
        </div>
      </section>

      {/* Modern Filter & Sort Bar */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                showFilters ? "bg-black text-white border-black" : "bg-white text-zinc-900 border-zinc-200"
              }`}
            >
              <Filter size={12} />
              {showFilters ? "Close Filters" : "Filters"}
            </button>

            {items.length > 15 && (
              <div className="relative flex-1 max-w-xs hidden md:block">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search Archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 pl-10 pr-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                />
              </div>
            )}

            <div className="h-4 w-[1px] bg-zinc-200 mx-2 hidden md:block" />

            {/* Quick Category Access if not many */}
            {categories.length <= 6 && categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat ? "text-zinc-900 border-b-2 border-black" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-zinc-50 border border-zinc-100 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest pr-10 cursor-pointer outline-none hover:border-zinc-300 transition-all"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="savings">Highest Member Savings</option>
              </select>
              <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? "max-h-[400px] py-8 opacity-100" : "max-h-0 py-0 opacity-0"}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Categories if more than 6 */}
            {categories.length > 6 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        activeCategory === cat ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setActiveSize(sz)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      activeSize === sz ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Condition</h4>
              <div className="flex flex-wrap gap-2">
                {conditions.map(cond => (
                  <button
                    key={cond}
                    onClick={() => setActiveCondition(cond)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      activeCondition === cond ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Price Points</h4>
              <div className="space-y-2">
                <button onClick={() => setSortBy("price-asc")} className={`flex items-center gap-2 text-[11px] font-bold uppercase ${sortBy === "price-asc" ? "text-zinc-900" : "text-zinc-400"}`}>
                  <SortAsc size={14} /> Value First
                </button>
                <button onClick={() => setSortBy("price-desc")} className={`flex items-center gap-2 text-[11px] font-bold uppercase ${sortBy === "price-desc" ? "text-zinc-900" : "text-zinc-400"}`}>
                  <SortDesc size={14} /> Premium First
                </button>
                <button onClick={() => setSortBy("newest")} className={`flex items-center gap-2 text-[11px] font-bold uppercase ${sortBy === "newest" ? "text-zinc-900" : "text-zinc-400"}`}>
                  <Clock size={14} /> Recent Drops
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            {filteredItems.map((item) => {
              const isSold = item.status === 'sold';
              const isVault = item.potential_profit > 200;
              const isLocked = isVault && !isMember && !isSold;

              return (
                <Link 
                  key={item.id} 
                  href={isSold ? "#" : `/archive/${item.id}`} 
                  className={`group block ${isSold ? 'cursor-not-allowed' : ''}`}
                >
                  <div className={`aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden mb-8 border border-zinc-100 transition-all duration-700 relative ${isSold ? 'grayscale' : 'group-hover:shadow-2xl group-hover:shadow-zinc-100'} ${isLocked ? 'bg-zinc-950' : ''}`}>
                    <img 
                      src={item.images[0]} 
                      className={`w-full h-full object-cover transition-all duration-1000 ${isLocked ? 'blur-3xl opacity-30 scale-110' : ''} ${isSold ? 'opacity-40' : 'grayscale-[0.2] group-hover:grayscale-0'} ${!isSold && !isLocked && item.images.length > 1 ? 'group-hover:opacity-0' : ''}`} 
                      alt={item.title} 
                    />
                    
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Lock size={20} className="text-yellow-400 mb-3 animate-pulse" />
                        <span className="text-[8px] font-black text-white uppercase tracking-[0.4em] leading-tight">
                          Society Access Required
                        </span>
                      </div>
                    )}

                    {!isSold && !isLocked && item.images.length > 1 && (
                      <img 
                        src={item.images[1]} 
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100" 
                        alt={`${item.title} alternate`} 
                      />
                    )}
                    
                    {isSold && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 -rotate-12">
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Acquired</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-6 right-6">
                      <div className={`bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm ${isSold ? 'opacity-50' : ''}`}>
                        {item.size || 'OS'}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 flex justify-between items-end">
                    <div className={`pb-1 ${isSold ? 'opacity-40' : ''}`}>
                      <h3 className="text-lg font-black text-zinc-900 tracking-tighter leading-tight mb-1 group-hover:underline decoration-1 underline-offset-4">
                        {item.title}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.condition}</p>
                    </div>
                    <div className={`flex flex-col items-end shrink-0 ${isSold ? 'opacity-20' : ''}`}>
                      <span className="text-[10px] font-bold text-zinc-400 line-through decoration-red-500 mb-1">€{Math.ceil((item.listing_price * 1.5) / 10) * 10}</span>
                      <div className="bg-zinc-900 text-white px-3 py-1.5 rounded-full text-base font-black shadow-md">
                        €{Math.round(item.listing_price)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
