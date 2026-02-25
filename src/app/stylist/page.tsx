"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check, Zap, Cpu, Search, X, Lock, Unlock, RefreshCw } from "lucide-react";
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
  const [anchorItemId, setAnchorItemId] = useState<string | null>(null);
  const [lockedItemIds, setLockedItemIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
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

    // Load saved curations
    const savedO = localStorage.getItem("auvra_saved_curations");
    if (savedO) {
      setSavedCurations(JSON.parse(savedO));
    }

    // Fetch potential anchor items
    fetch("/api/ai/stylist/anchors").then(res => res.json()).then(data => setRecentItems(data)).catch(() => {});
  }, []);

  // Automatic Persistence
  useEffect(() => {
    localStorage.setItem("auvra_stylist_prefs", JSON.stringify({
      colors: selectedColors,
      brands: selectedBrands,
      occasion,
      gender
    }));
  }, [selectedColors, selectedBrands, occasion, gender]);

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
    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          colors: selectedColors, 
          brands: selectedBrands, 
          occasion, 
          gender,
          anchorItemId: !isReroll ? anchorItemId : null,
          lockedItemIds: isReroll ? lockedItemIds : []
        })
      });
      const data = await response.json();
      setOutfits(data);
      // Reset locks if it's a fresh curation (not a reroll)
      if (!isReroll) setLockedItemIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-zinc-700 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-zinc-200">
              <Cpu size={10} className="text-yellow-400" /> Neural Curation v3.0
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Archetype <br />Personal Stylist.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              Our refined engine maps your aesthetic DNA to strict archetype blueprints, ensuring every coordination possesses a distinct high-fidelity Aura.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 px-4 py-2 rounded-full border border-zinc-100">
             <Zap size={10} className="text-yellow-500 fill-yellow-500" /> Auto-Syncing DNA
          </div>
        </div>

        {!outfits ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              
              {/* GENDER */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  01. Select Silhouette Protocol
                </h3>
                <div className="flex gap-4">
                  {[{ id: "male", label: "Masculine" }, { id: "female", label: "Feminine" }, { id: "couple", label: "Couple Match" }].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        gender === g.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* COLORS */}
              <section>
                <div className="flex justify-between items-end mb-8 border-b border-zinc-100 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">02. Foundation & Earth Tones</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {EARTH_TONES.map(color => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`group relative p-1 rounded-full transition-all duration-500 ${selectedColors.includes(color.name) ? 'ring-2 ring-zinc-900 ring-offset-4 scale-110' : 'ring-1 ring-zinc-100 ring-offset-0 hover:ring-zinc-300'}`}
                    >
                      <div className="w-12 h-12 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </section>

              {/* ANCHOR PIECE (Optional) */}
              {recentItems.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                    03. Optional Anchor Piece
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recentItems.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setAnchorItemId(anchorItemId === item.id ? null : item.id)}
                        className={`p-2 rounded-2xl border transition-all text-left group ${anchorItemId === item.id ? 'bg-zinc-900 border-zinc-900 shadow-xl' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'}`}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                           <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                           {anchorItemId === item.id && (
                             <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                                <Check className="text-zinc-900" size={24} />
                             </div>
                           )}
                        </div>
                        <p className={`text-[8px] font-black uppercase tracking-widest truncate ${anchorItemId === item.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.brand}</p>
                        <p className={`text-[9px] font-bold truncate ${anchorItemId === item.id ? 'text-white' : 'text-zinc-900'}`}>{item.title}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* BRANDS */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  04. Preferred Brand Network
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BRANDS.slice(0, 16).map(brand => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-left flex justify-between items-center ${selectedBrands.includes(brand) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'}`}
                    >
                      {brand}
                      {selectedBrands.includes(brand) && <Check size={12} className="text-yellow-400" />}
                    </button>
                  ))}
                </div>
              </section>

              <button
                onClick={() => generateOutfits(false)}
                disabled={loading}
                className="w-full bg-zinc-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-zinc-300"
              >
                {loading ? <Cpu size={20} className="animate-spin text-yellow-400" /> : <><Sparkles size={20} className="text-yellow-400" /> Initialize Curation</>}
              </button>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-zinc-50 rounded-[3rem] p-10 sticky top-32 border border-zinc-100">
                <h4 className="text-xs font-black uppercase tracking-widest mb-6">Stylist Protocol v3</h4>
                <ul className="space-y-6 text-sm text-zinc-500 font-medium">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                    <p>Anchor-First Generation: Curations revolve around your selected piece.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                    <p>Strict Archetype Blueprints: Every look is a perfect silhouette match.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                    <p>Slot Modification: Lock items you love and reroll the rest.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-32">
            <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-12">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                     <Cpu size={20} className="text-yellow-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Neural Sync Active</p>
                     <p className="text-sm font-bold">{lockedItemIds.length} Slots Locked</p>
                  </div>
               </div>
               <button 
                 onClick={() => generateOutfits(true)}
                 disabled={loading}
                 className="bg-black text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
               >
                 <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reroll Open Slots
               </button>
            </div>

            {outfits.map((outfit, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-zinc-100 pb-12">
                  <div className="max-w-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600 mb-4">Recommendation {idx + 1}</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">{outfit.outfitName}</h2>
                    <p className="text-zinc-500 text-xl font-medium leading-relaxed italic">"{outfit.styleReason}"</p>
                  </div>
                  <button onClick={() => saveCuration(outfit)} className="bg-zinc-100 text-zinc-900 px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-zinc-200 transition-all">
                    <Zap size={14} className="fill-yellow-400 text-yellow-400" /> Save Curation
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {outfit.items.map((item: any, i: number) => {
                    const isLocked = lockedItemIds.includes(item.id);
                    return (
                      <div key={i} className="group relative">
                        <Link href={item.url} className={`block bg-zinc-50 rounded-[2.5rem] p-6 border transition-all hover:shadow-2xl ${isLocked ? 'border-zinc-900' : 'border-zinc-100'}`}>
                          <div className="aspect-[4/5] bg-white rounded-2xl mb-6 overflow-hidden relative border border-zinc-100 shadow-inner">
                             <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                             <div className="absolute top-4 left-4">
                                <div className="bg-black/90 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/10">{item.brand}</div>
                             </div>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{item.brand}</p>
                          <h4 className="text-sm font-black tracking-tight mb-4 group-hover:text-black transition-colors">{item.name}</h4>
                          <span className="text-lg font-black bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">{item.price}</span>
                        </Link>
                        <button 
                          onClick={(e) => { e.preventDefault(); toggleLock(item.id); }}
                          className={`absolute -top-3 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${isLocked ? 'bg-zinc-900 text-white scale-110' : 'bg-white text-zinc-400 hover:scale-105'}`}
                        >
                          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={() => { setOutfits(null); setLockedItemIds([]); }} className="text-xs font-black uppercase tracking-widest border-b-2 border-zinc-900 pb-1">Reset Protocol</button>
          </div>
        )}
      </div>
    </div>
  );
}
