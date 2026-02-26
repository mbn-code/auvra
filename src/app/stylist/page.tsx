"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Zap, Cpu, RefreshCw, Layers, CheckCircle, Flame, ShieldCheck } from "lucide-react";
import Link from "next/link";

/**
 * AUVRA NEURAL AESTHETIC TUNER v4.2 (Neural Activation)
 * Implements client-side shuffling and high-fidelity match scoring.
 */
export default function StylistPage() {
  const [vibePool, setVibePool] = useState<any[]>([]);
  const [selectedVibeIds, setSelectedVibeIds] = useState<string[]>([]);
  const [outfits, setOutfits] = useState<any[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);

  useEffect(() => {
    fetchVibes();
  }, []);

  const fetchVibes = async () => {
    setDiscoveryLoading(true);
    try {
      const res = await fetch("/api/ai/stylist/vibes");
      const data = await res.json();
      
      // Client-Side Shuffle: Bypass 24h caching persistence to keep UI fresh
      const shuffled = [...data]
        .sort(() => 0.5 - Math.random())
        .slice(0, 24); // Show a diverse set of 24 seeds
        
      setVibePool(shuffled);
    } catch (err) {
      console.error("[VibeDiscovery] Fetch Failed:", err);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const toggleVibe = (id: string) => {
    setSelectedVibeIds(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= 7) return [...prev.slice(1), id]; // Maintain aesthetic focus (max 7)
      return [...prev, id];
    });
  };

  const initializeCuration = async (isLoadMore = false) => {
    if (selectedVibeIds.length === 0) return;
    
    if (isLoadMore) {
      setMoreLoading(true);
    } else {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    }

    const currentOffset = isLoadMore ? offset + 20 : 0;

    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedVibeIds, offset: currentOffset })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Curation failed');
      }
      
      if (isLoadMore) {
        setOutfits(prev => [...(prev || []), ...data]);
        setOffset(currentOffset);
      } else {
        setOutfits(data);
      }

      if (data.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("[NeuralMatch] Curation Failed:", err);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-zinc-700 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-lg">
              <Cpu size={10} className="text-yellow-400" /> Neural Aesthetic Curation v4.2
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Auvra Style <br />Tuner.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              Select 1-7 visual seeds to initialize your aesthetic centroid. Our engine will map your choices across the neural archive network.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 px-4 py-2 rounded-full border border-zinc-100">
             <Layers size={10} className="text-yellow-500" /> Latent Mapping Active
          </div>
        </div>

        {!outfits ? (
          <div className="space-y-20">
            
            {/* VIBE DISCOVERY GRID */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-end mb-12 border-b border-zinc-100 pb-6">
                 <h3 className="text-xl font-black uppercase tracking-tighter">
                   01. Discover Your Vibe
                 </h3>
                 <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                   {selectedVibeIds.length}/7 Seeds Collected
                 </span>
              </div>

              {discoveryLoading ? (
                <div className="h-96 flex items-center justify-center">
                   <RefreshCw className="animate-spin text-zinc-300" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {vibePool.map((v) => (
                    <button 
                      key={v.id} 
                      onClick={() => toggleVibe(v.id)}
                      className={`group relative aspect-[4/5] rounded-[2rem] overflow-hidden border-4 transition-all duration-500 ${selectedVibeIds.includes(v.id) ? 'border-black scale-95 shadow-2xl' : 'border-transparent hover:border-zinc-200'}`}
                    >
                      <img 
                        src={v.url} 
                        className="w-full h-full object-cover transition-all duration-700" 
                        alt="Style Seed"
                        loading="lazy"
                      />
                      {selectedVibeIds.includes(v.id) && (
                        <div className="absolute top-4 right-4 bg-black text-white p-2 rounded-full shadow-xl">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-2xl text-[8px] font-black uppercase tracking-widest text-center shadow-lg">{v.archetype || 'archive node'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-16 flex flex-col items-center">
                 <button
                   onClick={() => initializeCuration(false)}
                   disabled={loading || selectedVibeIds.length === 0}
                   className={`w-full max-w-lg py-10 rounded-[3rem] font-black uppercase tracking-[0.4em] flex flex-col items-center justify-center gap-4 transition-all ${selectedVibeIds.length > 0 ? 'bg-zinc-900 text-white hover:bg-black shadow-2xl' : 'bg-zinc-50 text-zinc-300'}`}
                 >
                   {loading ? <RefreshCw className="animate-spin" /> : (
                      <>
                        <Sparkles size={24} className={selectedVibeIds.length > 0 ? "text-yellow-400" : ""} />
                        Initialize Curation
                      </>
                   )}
                 </button>
                 <button onClick={fetchVibes} className="mt-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black flex items-center gap-2">
                    <RefreshCw size={12}/> Refresh Discovery Space
                 </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-32">
            {/* MATCHED STATE HEADER */}
            <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-12">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                     <Cpu size={20} className={loading ? "animate-spin text-yellow-400" : "text-yellow-400"} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Centroid Resolved</p>
                     <p className="text-sm font-bold">Aesthetic Match Optimized</p>
                  </div>
               </div>
               <button 
                onClick={() => { 
                  setOutfits(null); 
                  setSelectedVibeIds([]); 
                  setOffset(0);
                  setHasMore(true);
                }} 
                className="bg-black text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
               >
                 Tune DNA
               </button>
            </div>

            {/* RESULTS GRID */}
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-zinc-100 pb-12">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600 mb-4">Neural Result Set</p>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">Matched Archive</h2>
                  <p className="text-zinc-500 text-xl font-medium leading-relaxed italic">
                    "A precision-engineered selection anchored by your chosen visual nodes. Calculated for aesthetic integrity and silhouette synchronization."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {outfits.map((item: any, i: number) => (
                  <Link key={i} href={item.url} className="group block bg-zinc-50 rounded-[3rem] p-6 border border-zinc-100 hover:shadow-2xl transition-all relative">
                    <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
                       {/* MATCH SCORE BADGE */}
                       <div className="bg-yellow-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Zap size={10} fill="black" /> {item.matchScore}% AESTHETIC MATCH
                       </div>
                       {item.matchScore > 85 && (
                          <div className="bg-black text-white text-[7px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-widest animate-pulse">
                             <Flame size={10} className="text-red-500" /> High Heat
                          </div>
                       )}
                    </div>

                    <div className="aspect-[4/5] bg-white rounded-[2rem] mb-6 overflow-hidden relative border border-zinc-100 shadow-inner group">
                       <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                        onError={(e) => {
                          // Fallback to placeholder or generic CDN path if original fails
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('cdn.mbn-code.dk')) {
                            const filename = target.src.split('/').pop();
                            if (filename) target.src = `https://cdn.mbn-code.dk/${filename.split('.')[0]}.webp`;
                          }
                        }}
                       />
                       <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                          <div className="bg-black/90 backdrop-blur-md text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                             <ShieldCheck size={14} className="text-green-400" /> Authenticated Archive
                          </div>
                       </div>
                    </div>
                    
                    <div className="px-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{item.brand}</p>
                      <h4 className="text-lg font-black tracking-tight mb-4 group-hover:text-black transition-colors">{item.name}</h4>
                      <div className="flex justify-between items-center">
                         <span className="text-2xl font-black text-black">{item.price}</span>
                         <div className="text-[9px] font-black text-zinc-400 border border-zinc-200 px-3 py-1 rounded-full uppercase tracking-tighter">Member Access</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="mt-20 flex justify-center">
                   <button 
                    onClick={() => initializeCuration(true)}
                    disabled={moreLoading}
                    className="group flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95"
                   >
                     <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:bg-black">
                        {moreLoading ? <RefreshCw className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black">Expand Results</span>
                   </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
