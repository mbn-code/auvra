"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check, Zap, Cpu, Search, X } from "lucide-react";
import Link from "next/link";

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

const COMMON_COLORS = [
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Pink", hex: "#db2777" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Navy", hex: "#000080" }
];

const BRANDS = ["Louis Vuitton", "Stone Island", "Chrome Hearts", "Arc'teryx", "Chanel", "Burberry", "Oakley", "Essentials", "Syna World", "Corteiz", "Moncler", "Patagonia", "Hermès", "Ralph Lauren", "Amiri", "Canada Goose", "Broken Planet", "CP Company", "Stüssy", "Prada", "Hellstar", "Supreme", "Lacoste", "Gallery Dept", "Eric Emanuel", "Adidas", "ASICS", "Sp5der", "Salomon", "Diesel", "Nike", "A Bathing Ape"];

export default function StylistPage() {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [gender, setGender] = useState<string>("male");
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<any[] | null>(null);
  const [savedCurations, setSavedCurations] = useState<any[]>([]);

  useEffect(() => {
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
  }, []);

  // Automatic Persistence Effect
  useEffect(() => {
    if (selectedColors.length > 0 || selectedBrands.length > 0 || occasion || gender) {
      localStorage.setItem("auvra_stylist_prefs", JSON.stringify({
        colors: selectedColors,
        brands: selectedBrands,
        occasion,
        gender
      }));
    }
  }, [selectedColors, selectedBrands, occasion, gender]);

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const saveCuration = (outfit: any) => {
    const newSaved = [outfit, ...savedCurations].slice(0, 10);
    setSavedCurations(newSaved);
    localStorage.setItem("auvra_saved_curations", JSON.stringify(newSaved));
  };

  const removeCuration = (idx: number) => {
    const newSaved = savedCurations.filter((_, i) => i !== idx);
    setSavedCurations(newSaved);
    localStorage.setItem("auvra_saved_curations", JSON.stringify(newSaved));
  };

  const generateOutfits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: selectedColors, brands: selectedBrands, occasion, gender })
      });
      const data = await response.json();
      setOutfits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-zinc-700 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-zinc-200">
              <Cpu size={10} className="text-yellow-400" /> Neural Curation Beta
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Digital <br />Personal Stylist.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              Our neural engine analyzes global archive inventory to curate visually coherent outfits tailored to your specific aesthetic DNA.
            </p>
          </div>
          {!outfits && (
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 px-4 py-2 rounded-full border border-zinc-100">
               <Zap size={10} className="text-yellow-500 fill-yellow-500" /> Auto-Syncing DNA
            </div>
          )}
        </div>

        {!outfits ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  01. Select Silhouette Protocol
                </h3>
                <div className="flex gap-4">
                  {[
                    { id: "male", label: "Masculine" },
                    { id: "female", label: "Feminine" },
                    { id: "couple", label: "Couple Match" }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        gender === g.id 
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-8 border-b border-zinc-100 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    02. Foundation & Earth Tones
                  </h3>
                  <p className="text-[9px] font-bold text-zinc-300 uppercase italic">Aesthetic Baseline</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {EARTH_TONES.map(color => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`group relative p-1 rounded-full transition-all duration-500 ${
                        selectedColors.includes(color.name) 
                        ? 'ring-2 ring-zinc-900 ring-offset-4 scale-110' 
                        : 'ring-1 ring-zinc-100 ring-offset-0 hover:ring-zinc-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color.hex }} />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-8 border-b border-zinc-100 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    03. Accent & Statement Colors
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {COMMON_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`group relative p-1 rounded-full transition-all duration-500 ${
                        selectedColors.includes(color.name) 
                        ? 'ring-2 ring-zinc-900 ring-offset-4 scale-110' 
                        : 'ring-1 ring-zinc-100 ring-offset-0 hover:ring-zinc-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color.hex }} />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  04. Preferred Brand Network
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BRANDS.slice(0, 16).map(brand => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-left flex justify-between items-center ${
                        selectedBrands.includes(brand) 
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-200' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {brand}
                      {selectedBrands.includes(brand) && <Check size={12} className="text-yellow-400" />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  05. Desired Occasion
                </h3>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Fashion Week, Casual Evening, Technical Hiking"
                    className="w-full bg-zinc-50 border border-zinc-100 px-8 py-6 rounded-3xl text-zinc-900 font-bold placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-sm focus:shadow-2xl"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors">
                    <Search size={20} />
                  </div>
                </div>
              </section>

              <button
                onClick={generateOutfits}
                disabled={loading}
                className="w-full bg-zinc-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-zinc-300 hover:scale-[1.01] active:scale-95"
              >
                {loading ? (
                  <>
                    <Cpu size={20} className="animate-spin text-yellow-400" />
                    Initializing Neural Engine...
                  </>
                ) : (
                  <>Initialize Curation <Sparkles size={20} className="text-yellow-400" /></>
                )}
              </button>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-zinc-50 rounded-[3rem] p-10 sticky top-32 border border-zinc-100">
                <h4 className="text-xs font-black uppercase tracking-widest mb-6">Stylist Protocol</h4>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                    <p className="text-sm text-zinc-500 font-medium">Items are matched based on brand heritage and silhouette protocol.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                    <p className="text-sm text-zinc-500 font-medium">Couple match synchronized across shared aesthetic nodes.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                    <p className="text-sm text-zinc-500 font-medium">Selections prioritize "New" and "Excellent" condition assets.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-32">
            {outfits.map((outfit, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-zinc-100 pb-12">
                  <div className="max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600 mb-4">Recommendation {idx + 1}</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">{outfit.outfitName}</h2>
                    <p className="text-zinc-500 text-xl font-medium leading-relaxed italic">"{outfit.styleReason}"</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => saveCuration(outfit)}
                      className="bg-zinc-100 text-zinc-900 px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-zinc-200 transition-all"
                    >
                      <Zap size={14} className="fill-yellow-400 text-yellow-400" /> Save Curation
                    </button>
                    <div className="bg-zinc-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-not-allowed opacity-50">
                      Secure Entire Set
                    </div>
                  </div>
                </div>

                {outfit.isCouple ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    <div className="bg-zinc-50/50 p-8 rounded-[3rem] border border-zinc-100">
                       <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-zinc-400">Masculine Node</h3>
                       <div className="grid grid-cols-2 gap-4">
                          {outfit.male.items.map((item: any, i: number) => (
                            <Link key={i} href={item.url} className="group block bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm hover:shadow-xl transition-all">
                               <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                                  <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                               </div>
                               <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{item.brand}</p>
                               <h4 className="text-[10px] font-black truncate">{item.name}</h4>
                            </Link>
                          ))}
                       </div>
                    </div>
                    <div className="bg-zinc-50/50 p-8 rounded-[3rem] border border-zinc-100">
                       <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-zinc-400">Feminine Node</h3>
                       <div className="grid grid-cols-2 gap-4">
                          {outfit.female.items.map((item: any, i: number) => (
                            <Link key={i} href={item.url} className="group block bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm hover:shadow-xl transition-all">
                               <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                                  <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                               </div>
                               <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{item.brand}</p>
                               <h4 className="text-[10px] font-black truncate">{item.name}</h4>
                            </Link>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {outfit.items.map((item: any, i: number) => (
                      <Link key={i} href={item.url} className="group block bg-zinc-50 rounded-[2.5rem] p-6 border border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200 transition-all hover:-translate-y-1">
                        <div className="aspect-[4/5] bg-white rounded-2xl mb-6 overflow-hidden relative border border-zinc-100 shadow-inner">
                           <div className="absolute inset-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                           </div>
                           <div className="absolute top-4 left-4">
                              <div className="bg-black/90 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/10">
                                 {item.brand}
                              </div>
                           </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{item.brand}</p>
                        <h4 className="text-sm font-black tracking-tight mb-4 group-hover:text-black transition-colors">{item.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-black bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">{item.price}</span>
                          <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {savedCurations.length > 0 && (
              <div className="pt-20 border-t border-zinc-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-12 text-center">Stored Archive Selections</h3>
                <div className="space-y-24">
                  {savedCurations.map((outfit, idx) => (
                    <div key={`saved-${idx}`} className="relative group/saved">
                      <button onClick={() => removeCuration(idx)} className="absolute -top-4 -right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10 hover:bg-red-600 transition-colors opacity-0 group-hover/saved:opacity-100">
                        <X size={14} />
                      </button>
                      <div className="text-center mb-12">
                        <h2 className="text-3xl font-black tracking-tighter mb-4">{outfit.outfitName}</h2>
                        <p className="text-zinc-500 font-medium italic">"{outfit.styleReason}"</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(outfit.isCouple ? [...outfit.male.items, ...outfit.female.items] : outfit.items).slice(0, 4).map((item: any, i: number) => (
                          <Link key={`saved-item-${i}`} href={item.url} className="group block bg-zinc-50 rounded-[2rem] p-4 border border-zinc-100 hover:shadow-xl transition-all">
                            <div className="aspect-[4/5] bg-white rounded-xl mb-4 overflow-hidden relative border border-zinc-100 shadow-inner">
                               <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.brand}</p>
                            <h4 className="text-[10px] font-black tracking-tight truncate">{item.name}</h4>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-64 bg-yellow-400 blur-[150px] opacity-10 rounded-full pointer-events-none"></div>
               <div className="relative z-10 max-w-xl mx-auto">
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-6">Save these curations <br /> to your Archive.</h3>
                  <p className="text-zinc-500 font-medium mb-10 leading-relaxed">Create a free Auvra Node account to store your aesthetic DNA and receive personalized drop alerts matched to your style.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login" className="bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all">Create Free Account</Link>
                    <button onClick={() => setOutfits(null)} className="bg-zinc-800 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all">Reset Protocol</button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
