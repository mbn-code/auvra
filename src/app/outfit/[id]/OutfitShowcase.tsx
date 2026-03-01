"use client";

import { useState, useEffect } from "react";
import { 
  Cpu, 
  Layers, 
  ArrowRight, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  ShoppingBag,
  ExternalLink,
  Edit3,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurationFee } from "@/lib/pricing";

interface Product {
  id: string;
  title: string;
  brand: string;
  listing_price: number;
  images: string[];
  category: string;
  status: string;
}

interface OutfitShowcaseProps {
  id: string;
  name: string;
  slots: Record<string, Product | null>;
  createdAt: string;
}

export default function OutfitShowcase({ id, name, slots, createdAt }: OutfitShowcaseProps) {
  const router = useRouter();
  const [activeSlots, setActiveSlots] = useState(slots);
  const [showPulseCheck, setShowPulseCheck] = useState(false);
  const [soldOutItems, setSoldOutItems] = useState<Product[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    // 1. Identify sold out items
    const soldOut = Object.values(slots).filter(p => p !== null && p.status === 'sold') as Product[];
    if (soldOut.length > 0) {
      setSoldOutItems(soldOut);
      setShowPulseCheck(true);
    }
  }, [slots]);

  const handlePrune = async () => {
    // Remove sold out items from local state
    const newSlots = { ...activeSlots };
    const prunedSlots: Record<string, string | null> = {};

    Object.keys(newSlots).forEach(key => {
      const product = newSlots[key];
      if (product && product.status === 'sold') {
        newSlots[key] = null;
      }
      prunedSlots[key] = newSlots[key]?.id || null;
    });

    setActiveSlots(newSlots);
    setShowPulseCheck(false);

    // Update database
    try {
      await fetch("/api/ai/stylist/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: prunedSlots, outfitId: id }) // Assuming save API can handle outfitId for updates
      });
    } catch (err) {
      console.error("Failed to prune outfit:", err);
    }
  };

  const handleKeep = () => {
    setShowPulseCheck(false);
  };

  const handleCheckout = async () => {
    const availableIds = Object.values(activeSlots)
      .filter(p => p !== null && p.status === 'available')
      .map(p => p!.id);

    if (availableIds.length === 0) {
      alert("No available items to acquire.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIds: availableIds,
          cancelUrl: window.location.href 
        })
      });

      const data = await res.json();
      
      if (res.status === 409 && data.unavailableIds) {
        // Handle race condition where item sold while viewing
        alert("Some items became unavailable. Refreshing lookbook.");
        window.location.reload();
        return;
      }

      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to initialize checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filledSlots = Object.entries(activeSlots).filter(([_, p]) => p !== null);

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6 overflow-hidden relative">
      {/* Background Architectural Mesh */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none text-black">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="showcase-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.2"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#showcase-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-6 shadow-sm">
              <Cpu size={12} className="text-zinc-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Manifestation ID: {id.slice(0, 8)}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic">
              {name || 'Neural Pattern'} <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Archive.</span>
            </h1>
          </div>
          
          <div className="flex gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
            <Link 
              href={`/stylist?outfit=${id}`}
              className="flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Edit3 size={14} /> Open in Workstation
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Visual Display */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {filledSlots.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-zinc-200">
                <p className="text-zinc-300 font-black text-xl uppercase tracking-widest italic italic">"Manifestation mesh is currently null."</p>
              </div>
            ) : (
              filledSlots.map(([slot, product]: [string, any]) => (
                <div 
                  key={product.id} 
                  className={`group relative bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 ${product.status === 'sold' ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="absolute top-8 left-8 z-10">
                    <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                      {slot.replace('_', ' ')}
                    </div>
                  </div>
                  
                  {product.status === 'sold' && (
                    <div className="absolute top-8 right-8 z-10">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <AlertCircle size={10} /> Secured
                      </div>
                    </div>
                  )}

                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-50 mb-8 border border-zinc-100 shadow-inner relative">
                    <Image 
                      src={product.images[0]} 
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      unoptimized
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{product.brand}</p>
                        <h3 className="text-2xl font-black tracking-tight leading-none uppercase italic">{product.title}</h3>
                      </div>
                      <div className="text-xl font-black italic">€{getCurationFee(product.listing_price)}</div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      {product.status === 'available' ? (
                        <Link 
                          href={`/archive/${product.id}`}
                          className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          View Node <ChevronRight size={12} />
                        </Link>
                      ) : (
                        <div className="flex-1 bg-zinc-100 text-zinc-400 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center cursor-not-allowed">
                          Asset SECURED
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
            <div className="bg-zinc-900 text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-red-500 blur-[100px] opacity-10 rounded-full pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Sparkles size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DNA Summary</p>
                    <p className="text-lg font-black uppercase italic tracking-tighter">Archive Manifest</p>
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest border-b border-white/5 pb-4">
                    <span className="text-zinc-500">Nodes Captured</span>
                    <span>{filledSlots.length} / 11</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest border-b border-white/5 pb-4">
                    <span className="text-zinc-500">Integrity Check</span>
                    <span className={soldOutItems.length > 0 ? "text-red-400" : "text-green-400"}>
                      {soldOutItems.length > 0 ? `${soldOutItems.length} SECURED` : '100% AVAILABLE'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest border-b border-white/5 pb-4">
                    <span className="text-zinc-500">Manifest Value</span>
                    <span className="text-xl font-black italic text-white">
                      €{filledSlots.reduce((acc, [_, p]) => acc + getCurationFee(p?.listing_price || 0), 0)}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={filledSlots.length === 0 || isCheckingOut}
                  className="w-full py-6 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      <ShoppingBag size={16} /> Acquire Entire Look
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 space-y-6 shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Temporal Metadata</h4>
               <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Initialized On</p>
                  <p className="text-sm font-bold uppercase italic">{new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
               </div>
               <div className="pt-6 border-t border-zinc-50 flex flex-col gap-4">
                  <Link href="/account" className="text-[9px] font-black uppercase tracking-widest text-zinc-900 border-b border-black pb-1 self-start hover:opacity-50">
                    Back to Terminal
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse-Check Modal */}
      {showPulseCheck && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" />
          
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] p-12 shadow-2xl border border-zinc-100 animate-in zoom-in-95 fade-in duration-300 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <AlertCircle size={40} />
            </div>

            <h2 className="text-4xl font-black tracking-tighter uppercase mb-4 italic">Neural Pulse Check.</h2>
            <p className="text-zinc-500 font-medium mb-10 leading-relaxed max-w-sm">
              We detected that <span className="text-black font-bold">{soldOutItems.length} item{soldOutItems.length > 1 ? 's' : ''}</span> in your lookbook {soldOutItems.length > 1 ? 'have' : 'has'} been secured by another node.
            </p>

            <div className="w-full flex flex-col gap-4">
              <button 
                onClick={handlePrune}
                className="w-full py-6 rounded-full bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl hover:scale-[1.02]"
              >
                <Trash2 size={16} /> Prune SECURED Items
              </button>
              
              <button 
                onClick={handleKeep}
                className="w-full py-6 rounded-full bg-white border border-zinc-200 text-zinc-900 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all shadow-lg hover:scale-[1.02]"
              >
                Keep for Inspiration
              </button>
            </div>

            <p className="mt-8 text-[9px] font-black uppercase tracking-widest text-zinc-300 italic">
              "Archive integrity is mathematically enforced."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
