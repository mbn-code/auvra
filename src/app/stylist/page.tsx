"use client";

import { Suspense, useState, useEffect } from "react";
import { Sparkles, ArrowRight, Zap, Cpu, RefreshCw, Layers, CheckCircle, Flame, ShieldCheck, GripVertical, X, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

import { SkeletonCanvas } from "@/components/stylist/SkeletonCanvas";
import { DraggableItem } from "@/components/stylist/DraggableItem";
import { SocietyModal } from "@/components/stylist/SocietyModal";

export const dynamic = 'force-dynamic';

/**
 * AUVRA ARCHIVE BUILDER v5.3 (Neural Workspace)
 * High-fidelity workstation with outfit hydration and membership protection.
 */

const slotToCategoryMap: Record<string, string> = {
  head: 'Headwear',
  neck: 'Scarf',
  outer_upper: 'Jackets',
  mid_upper: 'Sweaters',
  inner_upper: 'Tops',
  hands: 'Gloves',
  waist: 'Belt',
  lower: 'Pants',
  legwear: 'Socks',
  footwear: 'Shoe',
  accessory: 'Bag'
};

export default function StylistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center"><RefreshCw className="animate-spin text-zinc-300" size={32} /></div>}>
      <StylistContent />
    </Suspense>
  );
}

function StylistContent() {
  const router = useRouter();
  const [vibePool, setVibePool] = useState<any[]>([]);
  const [selectedVibeIds, setSelectedVibeIds] = useState<string[]>([]);
  const [outfits, setOutfits] = useState<any[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Archive Builder State
  const [canvasOutfit, setCanvasOutfit] = useState<Record<string, any[]>>({
    head: [], neck: [], inner_upper: [], mid_upper: [], outer_upper: [],
    hands: [], waist: [], lower: [], legwear: [], footwear: [], accessory: []
  });

  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({
    head: 0, neck: 0, inner_upper: 0, mid_upper: 0, outer_upper: 0, 
    hands: 0, waist: 0, lower: 0, legwear: 0, footwear: 0, accessory: 0
  });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    feature: 'save' | 'export';
  }>({
    isOpen: false,
    title: "",
    description: "",
    feature: 'save'
  });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const searchParams = useSearchParams();
  const outfitId = searchParams.get("outfit");
  const supabase = createClient();

  useEffect(() => {
    fetchVibes();
    checkMembership();
    if (outfitId) {
      loadOutfit(outfitId);
    }
  }, [outfitId]);

  const checkMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('membership_tier')
        .eq('id', user.id)
        .single();
      if (profile?.membership_tier === 'society') {
        setIsMember(true);
      }
    }
  };

  const loadOutfit = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/stylist/outfit?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        setCanvasOutfit(data.outfit);
        
        // Extract IDs for centroid calculation
        const ids: string[] = [];
        Object.values(data.outfit).forEach((slotItems: any) => {
          if (Array.isArray(slotItems) && slotItems.length > 0) {
            ids.push(slotItems[0].id);
          }
        });

        // Hydrate discovery pool
        await fetchVibes();

        if (ids.length > 0) {
          const matchRes = await fetch("/api/ai/stylist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedVibeIds: ids.slice(0, 7) })
          });
          const matchData = await matchRes.json();
          if (matchRes.ok) setOutfits(matchData);
          else setOutfits([]);
        } else {
          setOutfits([]); 
        }
      }
    } catch (err) {
      console.error("Failed to load outfit:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVibes = async (keepSelected = false, query = "") => {
    setDiscoveryLoading(true);
    try {
      const url = new URL("/api/ai/stylist/vibes", window.location.origin);
      if (query) url.searchParams.set("q", query);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      
      const currentlySelected = vibePool.filter(v => selectedVibeIds.includes(v.id));
      const newData = data.filter((v: any) => !selectedVibeIds.includes(v.id));
      
      const randomCount = 24 - (keepSelected ? currentlySelected.length : 0);
      let processedData = [...newData];
      if (!query) processedData = processedData.sort(() => 0.5 - Math.random());
      
      const shuffled = processedData.slice(0, Math.max(0, randomCount));
      const finalPool = keepSelected ? [...currentlySelected, ...shuffled] : shuffled;
      setVibePool(finalPool);
    } catch (err) {
      console.error("[VibeDiscovery] Fetch Failed:", err);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const toggleVibe = (id: string) => {
    setSelectedVibeIds(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= 7) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVibes(true, searchQuery);
  };

  const initializeCuration = async (isLoadMore = false, preferredCategory: string | null = null) => {
    if (selectedVibeIds.length === 0) return;
    
    if (isLoadMore) {
      setMoreLoading(true);
    } else {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
      if (!isLoadMore) setOutfits(null);
    }

    const currentOffset = isLoadMore ? offset + 20 : 0;

    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          selectedVibeIds, 
          offset: currentOffset,
          preferredCategory: preferredCategory || activeCategory
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Curation failed');
      
      if (isLoadMore) {
        setOutfits(prev => [...(prev || []), ...data]);
        setOffset(currentOffset);
      } else {
        setOutfits(data);
      }

      if (data.length < 20) setHasMore(false);
    } catch (err) {
      console.error("[NeuralMatch] Curation Failed:", err);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (active && active.data.current) {
      const item = active.data.current;
      const hoveredSlotId = over?.id as string;

      const allSlots = Object.keys(canvasOutfit);
      let targetSlot: string | null = null;

      // 1. Direct Hit Priority
      if (hoveredSlotId && allSlots.includes(hoveredSlotId)) {
        targetSlot = hoveredSlotId;
      } 
      // 2. Intelligent Routing (Only if dropped on General Sidebar background)
      else if (hoveredSlotId === 'skeleton-sidebar') {
        const cat = item.category?.toLowerCase() || '';
        if (cat.includes('headwear') || cat.includes('hat')) targetSlot = 'head';
        else if (cat.includes('jacket') || cat.includes('coat')) targetSlot = 'outer_upper';
        else if (cat.includes('sweater') || cat.includes('hoodie')) targetSlot = 'mid_upper';
        else if (cat.includes('top') || cat.includes('shirt') || cat.includes('tee')) targetSlot = 'inner_upper';
        else if (cat.includes('pants') || cat.includes('trouser') || cat.includes('skirt') || cat.includes('jeans')) targetSlot = 'lower';
        else if (cat.includes('shoe') || cat.includes('boot') || cat.includes('footwear')) targetSlot = 'footwear';
        else if (cat.includes('socks')) targetSlot = 'legwear';
        else if (cat.includes('belt')) targetSlot = 'waist';
        else if (cat.includes('bag') || cat.includes('accessory')) targetSlot = 'accessory';
        else if (cat.includes('scarf') || cat.includes('necklace')) targetSlot = 'neck';
        else targetSlot = 'accessory';
      }

      if (targetSlot && canvasOutfit[targetSlot]) {
        setCanvasOutfit(prev => {
          const exists = prev[targetSlot!].some((i: any) => i.id === item.id);
          if (exists) return prev;
          const newItems = [item, ...prev[targetSlot!]];
          return { ...prev, [targetSlot!]: newItems };
        });
        setActiveIndices(prev => ({ ...prev, [targetSlot!]: 0 }));
      }
    }
  };

  const handleSwitch = (slotId: string, index: number) => setActiveIndices(prev => ({ ...prev, [slotId]: index }));

  const handleRemove = (slotId: string, index: number) => {
    setCanvasOutfit(prev => {
      const newItems = prev[slotId].filter((_, i) => i !== index);
      return { ...prev, [slotId]: newItems };
    });
    setActiveIndices(prev => ({ ...prev, [slotId]: 0 }));
  };

  const handleSearchForSlot = (slotId: string, label: string) => {
    const category = slotToCategoryMap[slotId];
    if (activeCategory === category) {
      setActiveCategory(null);
      initializeCuration(false, null);
    } else {
      setActiveCategory(category);
      initializeCuration(false, category);
    }
  };

  const handleFreeAction = async (email: string) => {
    // 1. Capture the email as a lead
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    
    if (!res.ok) throw new Error("Failed to capture email");

    // 2. Save locally
    const slots: any = {};
    Object.keys(canvasOutfit).forEach(slot => {
      const activeItem = canvasOutfit[slot][activeIndices[slot]];
      slots[slot] = activeItem ? activeItem.id : null;
    });

    localStorage.setItem("auvra_free_saved_lookbook", JSON.stringify(slots));
    alert(`Success! Lookbook saved locally for ${email}. To enable permanent cloud sync and PDF exports across all devices, upgrade to The Society.`);
  };

  const handleSave = async () => {
    if (!isMember) {
      setModalConfig({
        isOpen: true,
        title: "Lock Your Archive",
        description: "To save this lookbook to your permanent archive and access it anywhere, you need to join The Society.",
        feature: 'save'
      });
      return;
    }

    setIsSaving(true);
    try {
      const slots: any = {};
      Object.keys(canvasOutfit).forEach(slot => {
        const activeItem = canvasOutfit[slot][activeIndices[slot]];
        slots[slot] = activeItem ? activeItem.id : null;
      });

      const response = await fetch("/api/ai/stylist/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots })
      });

      if (!response.ok) throw new Error("Failed to save");
      alert("Lookbook Locked to your Archive.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!isMember) {
      setModalConfig({
        isOpen: true,
        title: "Export Style DNA",
        description: "To receive this lookbook as a high-fidelity DNA brief via email, you need to be a member of The Society.",
        feature: 'export'
      });
      return;
    }

    setIsExporting(true);
    try {
      const slots: any = {};
      Object.keys(canvasOutfit).forEach(slot => {
        const activeItem = canvasOutfit[slot][activeIndices[slot]];
        slots[slot] = activeItem ? activeItem.id : null;
      });

      const response = await fetch("/api/ai/stylist/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots })
      });

      if (!response.ok) throw new Error("Failed to export");
      alert("Style DNA Brief sent to your email.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const productIds: string[] = [];
      const productToSlotMap: Record<string, string> = {};

      Object.keys(canvasOutfit).forEach(slot => {
        const activeItem = canvasOutfit[slot][activeIndices[slot]];
        if (activeItem) {
          productIds.push(activeItem.id);
          productToSlotMap[activeItem.id] = slot;
        }
      });

      if (productIds.length === 0) {
        alert("Add some items to your lookbook first!");
        setIsCheckingOut(false);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIds,
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();
      
      if (response.status === 409 && data.unavailableIds) {
        const unavailableIds: string[] = data.unavailableIds;
        setCanvasOutfit(prev => {
          const next = { ...prev };
          unavailableIds.forEach(id => {
            const slot = productToSlotMap[id];
            if (slot) next[slot] = next[slot].filter(item => item.id !== id);
          });
          return next;
        });
        alert("Some items in your lookbook were just secured and are no longer available. We have removed them from your canvas.");
        return;
      }

      if (!response.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to initialize checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragEnd={handleDragEnd} 
      modifiers={[restrictToWindowEdges]}
      collisionDetection={pointerWithin}
    >
      <div className="min-h-screen bg-[#fafafa] text-zinc-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-8 shadow-sm">
                <Cpu size={10} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Archive Builder v5.3</span>
              </div>
              <h1 className="text-7xl md:text-[9rem] font-black tracking-[-0.06em] leading-[0.8] mb-12 uppercase italic">Manifest <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Aesthetics.</span></h1>
              <p className="text-zinc-500 text-xl font-medium leading-tight tracking-tight max-w-lg">
                Tune your DNA, curate your archive, and build your lookbook in the neural latent space. Drag items from the grid onto the builder skeleton.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/50 px-4 py-2 rounded-full border border-zinc-100">
               <Layers size={10} className="text-yellow-500" /> Builder Active
            </div>
          </div>

          {outfits === null ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-zinc-100 pb-6">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">01. Seed Your Centroid</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Pick aesthetic references to define your style DNA</p>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                       <input type="text" placeholder="Search Vibes..." className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2 text-xs font-black outline-none focus:bg-white focus:border-black transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                       <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"><Search size={14} /></button>
                    </form>
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest min-w-[100px] text-right">{selectedVibeIds.length}/7 Seeds</span>
                 </div>
              </div>

              {discoveryLoading ? (
                <div className="h-96 flex items-center justify-center"><RefreshCw className="animate-spin text-zinc-300" size={32} /></div>
              ) : (
                <div className="columns-2 md:columns-4 lg:columns-6 gap-4 space-y-4">
                  {vibePool.map((v) => (
                    <button key={v.id} onClick={() => toggleVibe(v.id)} className={`group relative w-full mb-4 break-inside-avoid rounded-[2rem] overflow-hidden border-4 transition-all duration-500 ${selectedVibeIds.includes(v.id) ? 'border-black scale-95 shadow-2xl' : 'border-transparent hover:border-zinc-200'}`}>
                      <img src={v.url} className="w-full h-auto object-cover transition-all duration-700" alt="" loading="lazy" />
                      {selectedVibeIds.includes(v.id) && (
                        <div className="absolute top-4 right-4 bg-black text-white p-2 rounded-full shadow-xl"><CheckCircle size={16} /></div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-2xl text-[8px] font-black uppercase tracking-widest text-center shadow-lg">{v.archetype || 'archive node'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-16 flex flex-col items-center gap-8">
                 <button onClick={() => initializeCuration(false)} disabled={loading || selectedVibeIds.length === 0} className={`w-full max-w-lg py-10 rounded-[3rem] font-black uppercase tracking-[0.4em] flex flex-col items-center justify-center gap-4 transition-all ${selectedVibeIds.length > 0 ? 'bg-zinc-900 text-white hover:bg-black shadow-2xl' : 'bg-zinc-50 text-zinc-300'}`}>
                   {loading ? <RefreshCw className="animate-spin" /> : <><Sparkles size={24} className={selectedVibeIds.length > 0 ? "text-yellow-400" : ""} />Initialize Builder</>}
                 </button>
                 <div className="flex items-center gap-6">
                    <button onClick={() => fetchVibes(true)} className="text-[10px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-100 px-6 py-3 rounded-full hover:bg-zinc-200 flex items-center gap-2 transition-all"><RefreshCw size={12}/> Keep Picked & Reload</button>
                    <button onClick={() => fetchVibes(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black flex items-center gap-2 transition-colors"><RefreshCw size={12}/> Full Refresh</button>
                 </div>
              </div>
            </section>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in duration-1000">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-12 border-b border-zinc-100 pb-6">
                   <div className="flex items-center gap-4">
                      <h3 className="text-xl font-black uppercase tracking-tighter italic text-zinc-400">"Neural Result Set"</h3>
                      {activeCategory && (
                        <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                          <span>Filtering: {activeCategory}</span>
                          <button onClick={() => { setActiveCategory(null); initializeCuration(false, null); }} className="hover:scale-110"><X size={10} strokeWidth={3} /></button>
                        </div>
                      )}
                   </div>
                   <button onClick={() => { setOutfits(null); setSelectedVibeIds([]); setOffset(0); setHasMore(true); setActiveCategory(null); setCanvasOutfit({ head: [], neck: [], inner_upper: [], mid_upper: [], outer_upper: [], hands: [], waist: [], lower: [], legwear: [], footwear: [], accessory: [] }); setActiveIndices({ head: 0, neck: 0, inner_upper: 0, mid_upper: 0, outer_upper: 0, hands: 0, waist: 0, lower: 0, legwear: 0, footwear: 0, accessory: 0 }); }} className="bg-black text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-transform hover:scale-105">Tune DNA</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {outfits.length === 0 && !loading && (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-100 rounded-[3rem]">
                       <p className="text-zinc-300 font-black uppercase tracking-widest text-sm">"Library Hydrated. Awaiting interaction."</p>
                    </div>
                  )}
                  {outfits.map((item: any) => (
                    <DraggableItem key={item.id} item={item}>
                      <div className="group bg-white rounded-[2.5rem] p-6 border border-zinc-100 hover:shadow-2xl transition-all relative h-full">
                        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
                           {item.is_stable && (
                             <div className="bg-blue-600 text-white text-[7px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                               <Layers size={8} /> Core Match
                             </div>
                           )}
                        </div>
                        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
                           <div className="bg-yellow-400 text-black text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"><Zap size={8} fill="black" /> {item.matchScore}%</div>
                        </div>
                        <div className="aspect-[4/5] bg-white rounded-[2rem] mb-4 overflow-hidden relative border border-zinc-100 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white text-black p-3 rounded-full shadow-2xl"><Sparkles size={16} /></div>
                           </div>
                        </div>
                        <div className="px-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.brand}</p>
                          <h4 className="text-sm font-black tracking-tight mb-2 truncate">{item.name}</h4>
                          <span className="text-lg font-black text-black">{item.price}</span>
                        </div>
                      </div>
                    </DraggableItem>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 flex justify-center">
                     <button onClick={() => initializeCuration(true)} disabled={moreLoading} className="group flex flex-col items-center gap-4 transition-all">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:bg-black">
                           {moreLoading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Expand Library</span>
                     </button>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[400px]">
                <SkeletonCanvas 
                  outfit={canvasOutfit} 
                  activeIndices={activeIndices}
                  onSwitch={handleSwitch}
                  onRemove={handleRemove}
                  onSearch={handleSearchForSlot}
                  onSave={handleSave}
                  onExport={handleExport}
                  onCheckout={handleCheckout}
                  isSaving={isSaving}
                  isExporting={isExporting}
                  isCheckingOut={isCheckingOut}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SocietyModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        description={modalConfig.description}
        feature={modalConfig.feature}
        onFreeAction={handleFreeAction}
      />
    </DndContext>
  );
}
