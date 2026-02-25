"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Check, Zap, Cpu, Search } from "lucide-react";
import Link from "next/link";

const COLORS = ["Black", "White", "Grey", "Olive", "Navy", "Beige", "Brown"];
const BRANDS = ["Louis Vuitton", "Stone Island", "Chrome Hearts", "Arc'teryx", "Chanel", "Burberry", "Oakley", "Essentials", "Syna World", "Corteiz", "Moncler", "Patagonia", "Hermès", "Ralph Lauren", "Amiri", "Canada Goose", "Broken Planet", "CP Company", "Stüssy", "Prada", "Hellstar", "Supreme", "Lacoste", "Gallery Dept", "Eric Emanuel", "Adidas", "ASICS", "Sp5der", "Salomon", "Diesel", "Nike", "A Bathing Ape"];

export default function StylistPage() {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<any[] | null>(null);

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const generateOutfits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: selectedColors, brands: selectedBrands, occasion })
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
            <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
              <Cpu size={10} className="text-yellow-400" /> Neural Curation Beta
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Digital <br />Personal Stylist.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              Our neural engine analyzes global archive inventory to curate visually coherent outfits tailored to your specific aesthetic DNA.
            </p>
          </div>
        </div>

        {!outfits ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-12">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  01. Select Color Palette
                </h3>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all border ${
                        selectedColors.includes(color) 
                        ? 'bg-zinc-900 text-white border-zinc-900' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  02. Preferred Brand Network
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BRANDS.slice(0, 16).map(brand => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-left flex justify-between items-center ${
                        selectedBrands.includes(brand) 
                        ? 'bg-zinc-900 text-white border-zinc-900' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {brand}
                      {selectedBrands.includes(brand) && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                  03. Desired Occasion
                </h3>
                <input 
                  type="text" 
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g. Fashion Week, Casual Evening, Technical Hiking"
                  className="w-full bg-zinc-50 border border-zinc-100 px-8 py-6 rounded-3xl text-zinc-900 font-bold placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </section>

              <button
                onClick={generateOutfits}
                disabled={loading}
                className="w-full bg-zinc-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>Initializing Neural Engine...</>
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
                    <p className="text-sm text-zinc-500 font-medium">Items are matched based on brand heritage and historical coordination.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                    <p className="text-sm text-zinc-500 font-medium">Pricing reflects current Auvra Pulse network values.</p>
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
                  <div className="bg-zinc-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-3">
                    <Zap size={14} className="fill-yellow-400 text-yellow-400" /> Secure Entire Set
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {outfit.items.map((item: any, i: number) => (
                    <Link key={i} href={item.url} className="group block bg-zinc-50 rounded-[2.5rem] p-6 border border-zinc-100 hover:shadow-2xl transition-all">
                      <div className="aspect-[4/5] bg-white rounded-2xl mb-6 overflow-hidden relative border border-zinc-100">
                         <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
                            <Search className="text-zinc-200" size={40} />
                         </div>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{item.brand}</p>
                      <h4 className="text-sm font-black tracking-tight mb-4 group-hover:underline">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black">{item.price}</span>
                        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={() => setOutfits(null)}
              className="text-xs font-black uppercase tracking-widest border-b-2 border-zinc-900 pb-1"
            >
              Reset Styling Protocol
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
