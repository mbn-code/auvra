"use client";

import React, { useState } from 'react';
import { X, Search, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function HuntModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [brands, setBrands] = useState("");
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScan, setShowScan] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brands.trim()) {
      toast.error("Required", { description: "Please enter at least one brand." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/stylist/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brands: brands.split(',').map(b => b.trim()).filter(Boolean), 
          occasion: occasion.trim() || undefined 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initialize hunt.");
      }

      // Show scan line effect for 2 seconds
      setShowScan(true);
      setTimeout(() => {
        setShowScan(false);
        setLoading(false);
        onClose();
        toast.success("Neural Hunt Initialised", { description: "Our AI is scanning the global archive for your request." });
      }, 2000);

    } catch (err: any) {
      console.error(err);
      toast.error("Hunt Failed", { description: err.message });
      setLoading(false);
    }
  };

  if (showScan) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-950">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400/50 animate-scan shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
            <Search size={32} className="text-yellow-400" />
          </div>
          <h2 className="text-white text-xl font-black uppercase tracking-[0.4em] mb-4">
            Neural Hunt Initialised
          </h2>
          <p className="text-[10px] font-mono text-yellow-400/80 uppercase tracking-widest animate-pulse">
            Scanning global archive nodes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-900 text-white rounded-[3rem] p-10 shadow-2xl border border-zinc-800 animate-in zoom-in-95 fade-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 self-start">
            <Zap size={10} className="text-yellow-400 fill-yellow-400" /> Deep Search Protocol
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-4 leading-none">Initiate Neural Hunt.</h2>
          <p className="text-zinc-400 font-medium mb-8 text-sm">
            Instruct the AI to continuously scan global marketplaces for specific brands and occasions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Target Brands (comma separated)</label>
              <input 
                type="text" 
                value={brands}
                onChange={(e) => setBrands(e.target.value)}
                placeholder="e.g. Arc'teryx, Salomon, Prada"
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-4 rounded-xl text-sm outline-none focus:border-yellow-400 transition-colors placeholder:text-zinc-700"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Occasion / Vibe (Optional)</label>
              <input 
                type="text" 
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Winter Gorpcore, Avant-Garde Evening"
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-4 rounded-xl text-sm outline-none focus:border-yellow-400 transition-colors placeholder:text-zinc-700"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Deploy Agents'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}