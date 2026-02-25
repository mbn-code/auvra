"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check, Zap, Cpu, Search, X, Lock, Unlock, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

const EARTH_TONES = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#808080" },
  { name: "Charcoal", hex: "#36454f" },
  { name: "Slate", hex: "#708090" },
  { name: "Stone", hex: "#877f7d" },
  { name: "Cream", hex: "#fffdd0" },
  { name: "Sand", hex: "#c2b280" },
  { name: "Khaki", hex: "#c3b091" },
  { name: "Beige", hex: "#f5f5dc" },
  { name: "Olive", hex: "#556b2f" },
  { name: "Forest", hex: "#228b22" },
  { name: "Clay", hex: "#b66a50" },
  { name: "Rust", hex: "#b7410e" },
  { name: "Espresso", hex: "#3d2b1f" },
  { name: "Brown", hex: "#8b4513" }
];

const BRANDS = ["Louis Vuitton", "Stone Island", "Chrome Hearts", "Arc'teryx", "Chanel", "Burberry", "Oakley", "Essentials", "Syna World", "Corteiz", "Moncler", "Patagonia", "Hermès", "Ralph Lauren", "Amiri", "Canada Goose", "Broken Planet", "CP Company", "Stüssy", "Prada", "Hellstar", "Supreme", "Lacoste", "Gallery Dept", "Eric Emanuel", "Adidas", "ASICS", "Sp5der", "Salomon", "Diesel", "Nike", "A Bathing Ape"];

export default function StylistPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [vibeQuery, setVibeQuery] = useState("");
  const [vibeResults, setVibeResults] = useState<any[]>([]);
  const [seedImages, setSeedImages] = useState<string[]>([]);
  
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [gender, setGender] = useState<string>("male");
  const [occasion, setOccasion] = useState("");
  const [anchorItemId, setAnchorItemId] = useState<string | null>(null);
  const [lockedItemIds, setLockedItemIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [hunting, setHunting] = useState(false);
  const [anchorSearch, setAnchorSearch] = useState("");
  const [anchorLoading, setAnchorLoading] = useState(false);
  const [outfits, setOutfits] = useState<any[] | null>(null);
  const [savedCurations, setSavedCurations] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    // Load preferences
    const savedPrefs = localStorage.getItem("auvra_stylist_prefs");
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      if (parsed.colors) setSelectedColors(parsed.colors);
      if (parsed.brands) setSelectedBrands(parsed.brands);
      if (parsed.occasion) setOccasion(parsed.occasion);
      if (parsed.gender) setGender(parsed.gender);
    }

    const savedO = localStorage.getItem("auvra_saved_curations");
    if (savedO) {
      setSavedCurations(JSON.parse(savedO));
    }

    fetchAnchors("");
  }, []);

  const searchVibes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/stylist/vibes?q=${encodeURIComponent(vibeQuery)}`);
      const data = await res.json();
      setVibeResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectSeed = (url: string) => {
    const newSeeds = [...seedImages, url];
    setSeedImages(newSeeds);
    if (newSeeds.length >= 2) {
      setStep(3); // Move to final steps
    } else {
      setVibeQuery("");
      setVibeResults([]);
      setStep(2); // Repeat search once
    }
  };

  const fetchAnchors = async (query: string) => {
    setAnchorLoading(true);
    try {
      const res = await fetch(`/api/ai/stylist/anchors?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setRecentItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnchorLoading(false);
    }
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleLock = (itemId: string) => {
    setLockedItemIds(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const generateOutfits = async (isReroll = false) => {
    setLoading(true);
    setHunting(false);
    
    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          colors: selectedColors, 
          brands: selectedBrands, 
          occasion, 
          gender,
          anchorItemId: isReroll ? null : anchorItemId,
          lockedItemIds: isReroll ? lockedItemIds : [],
          seedImageIds: seedImages
        })
      });
      const data = await response.json();
      
      const hasFewResults = !data || data.length < 3;
      const hasSubstitutions = data?.some((o: any) => o.styleReason.includes("depleted"));

      if (hasFewResults || hasSubstitutions) {
        if (selectedBrands.length > 0) {
          setHunting(true);
          fetch("/api/ai/stylist/hunt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brands: selectedBrands, occasion })
          });
        }
      }

      if (data && data.length > 0) {
        setOutfits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-zinc-700 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-lg">
              <Cpu size={10} className="text-yellow-400" /> Neural Aesthetic Curation
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Pinterest <br />for Fashion.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              Define your vibe visually. Our engine maps your seed images to the global archive network.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 px-4 py-2 rounded-full border border-zinc-100">
             <Layers size={10} className="text-yellow-500" /> Vibe Mapping Active
          </div>
        </div>

        {!outfits ? (
          <div className="space-y-24">
            
            {/* STEP 1 & 2: VIBE SEARCH */}
            {(step === 1 || step === 2) && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end mb-12 border-b border-zinc-100 pb-6">
                   <h3 className="text-xl font-black uppercase tracking-tighter">
                     Step 0{step}. Search for your visual inspiration
                   </h3>
                   <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                     {seedImages.length}/2 Seeds Collected
                   </span>
                </div>

                <div className="relative mb-12 max-w-2xl">
                   <input 
                     type="text" 
                     value={vibeQuery}
                     onChange={(e) => setVibeQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && searchVibes()}
                     placeholder="e.g. vintage gorpcore, minimal luxury archive, 90s streetwear"
                     className="w-full bg-zinc-50 border-2 border-zinc-100 px-8 py-6 rounded-[2rem] text-lg font-bold placeholder:text-zinc-300 focus:outline-none focus:border-black transition-all shadow-sm"
                   />
                   <button 
                     onClick={searchVibes}
                     className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-4 rounded-2xl hover:bg-zinc-800 transition-all"
                   >
                     {loading ? <RefreshCw size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                   </button>
                </div>

                {vibeResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
                    {vibeResults.map((v) => (
                      <button 
                        key={v.id} 
                        onClick={() => selectSeed(v.url)}
                        className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border-4 border-transparent hover:border-black transition-all"
                      >
                        <img src={v.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Select Node</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* STEP 3: FINAL STEPS */}
            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="lg:col-span-8 space-y-20">
                  
                  {/* SEED PREVIEW */}
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                      03. Visual DNA Foundation
                    </h3>
                    <div className="flex gap-6">
                       {seedImages.map((img, i) => (
                         <div key={i} className="w-32 aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-200 shadow-xl relative">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button onClick={() => setStep(1)} className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white p-1 rounded-full"><X size={10}/></button>
                         </div>
                       ))}
                       <div className="flex-1 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center p-6">
                          <Check className="text-green-500 mb-2" />
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Seeds Optimized</p>
                       </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                      04. Silhouette & Intent
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Target Protocol</p>
                          <div className="flex gap-2">
                            {[{id:'male', label:'M'}, {id:'female', label:'F'}, {id:'couple', label:'CP'}].map(g => (
                              <button key={g.id} onClick={() => setGender(g.id)} className={`flex-1 py-4 rounded-2xl text-xs font-black border transition-all ${gender === g.id ? 'bg-black text-white' : 'bg-zinc-50'}`}>{g.label}</button>
                            ))}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Occasion Node</p>
                          <input type="text" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="e.g. Fashion Week" className="w-full bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl font-bold" />
                       </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                      05. Brand Filter (Optional)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {BRANDS.slice(0, 15).map(b => (
                         <button key={b} onClick={() => toggleBrand(b)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${selectedBrands.includes(b) ? 'bg-black text-white' : 'bg-zinc-50'}`}>{b}</button>
                       ))}
                    </div>
                  </section>

                  <button
                    onClick={() => generateOutfits(false)}
                    disabled={loading}
                    className="w-full bg-zinc-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-4 hover:bg-black transition-all"
                  >
                    {loading ? <RefreshCw className="animate-spin" /> : <><Sparkles size={20} className="text-yellow-400" /> Generate Archive Set</>}
                  </button>
                </div>

                <div className="lg:col-span-4">
                   <div className="bg-zinc-900 text-white p-10 rounded-[3rem] sticky top-32">
                      <h4 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Curation Logic v3.5</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-8">Our neural engine uses your seed images as high-fidelity aesthetic anchors, overriding generic filters.</p>
                      <ul className="space-y-6">
                         <li className="flex gap-4 items-start">
                            <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                            <p className="text-xs font-bold uppercase tracking-wider">Visual DNA Prioritized</p>
                         </li>
                         <li className="flex gap-4 items-start">
                            <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                            <p className="text-xs font-bold uppercase tracking-wider">Occasion weighting x2.5</p>
                         </li>
                      </ul>
                   </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="space-y-32">
            <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-12">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                     <Cpu size={20} className={loading ? "animate-spin text-yellow-400" : "text-yellow-400"} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Neural Sync Active</p>
                     <p className="text-sm font-bold">Coordination Secured</p>
                  </div>
               </div>
               <button onClick={() => { setOutfits(null); setStep(1); setSeedImages([]); }} className="bg-black text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest">New Search</button>
            </div>

            {outfits.map((outfit, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-zinc-100 pb-12">
                  <div className="max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600 mb-4">Neural Coordination {idx + 1}</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">{outfit.outfitName}</h2>
                    <p className="text-zinc-500 text-xl font-medium leading-relaxed italic">"{outfit.styleReason}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {outfit.items.map((item: any, i: number) => (
                    <Link key={i} href={item.url} className="group block bg-zinc-50 rounded-[2.5rem] p-6 border border-zinc-100 hover:shadow-2xl transition-all">
                      <div className="aspect-[4/5] bg-white rounded-2xl mb-6 overflow-hidden relative border border-zinc-100 shadow-inner group">
                         <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                         <div className="absolute top-4 left-4">
                            <div className="bg-black/90 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/10">{item.brand}</div>
                         </div>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{item.brand}</p>
                      <h4 className="text-sm font-black tracking-tight mb-4 group-hover:text-black transition-colors">{item.name}</h4>
                      <span className="text-lg font-black text-black">{item.price}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
