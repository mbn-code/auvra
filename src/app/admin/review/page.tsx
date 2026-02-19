"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, ExternalLink, ShieldCheck, AlertTriangle, TrendingUp, Star } from "lucide-react";

export default function AdminReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  async function fetchPendingItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pulse_inventory')
      .select('*')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false }); // Temporary fallback sorting

    if (!error) setItems(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('pulse_inventory')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  }

  if (loading) return <div className="p-24 text-center">Opening Auvra Terminal...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Arbitrage Terminal</p>
            <h1 className="text-4xl font-black tracking-tighter">Profit Review Board</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black tracking-tighter text-zinc-900">{items.length}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Awaiting Command</p>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-zinc-100 shadow-sm">
             <ShieldCheck size={48} className="mx-auto text-zinc-200 mb-6" />
             <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Inventory Synchronized.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-[2.5rem] overflow-hidden border-2 shadow-sm flex flex-col transition-all ${
                  item.potential_profit > 60 ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.1)]' : 'border-white'
                }`}
              >
                <div className="aspect-[4/5] relative group">
                  <img src={item.images[0]} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt={item.title} />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                     <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2 border border-white/10">
                        {item.brand}
                     </div>
                     <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2 border border-zinc-100">
                        <Star size={10} className="fill-black" />
                        {item.seller_rating} ({item.seller_reviews_count})
                     </div>
                  </div>
                  <div className="absolute top-6 right-6">
                     <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${
                       item.potential_profit > 60 ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'
                     }`}>
                        <TrendingUp size={12} />
                        Profit: +${Math.round(item.potential_profit)}
                     </div>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-8 flex-1">
                    <h3 className="text-2xl font-black mb-2 tracking-tighter leading-tight">{item.title}</h3>
                    <div className="flex gap-6 items-center">
                      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Source: <span className="text-zinc-900">${item.source_price}</span></p>
                      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Listing: <span className="text-zinc-900">${item.listing_price}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={item.source_url} 
                      target="_blank" 
                      className="bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                    >
                      <ExternalLink size={14} /> Open Vinted
                    </a>
                    <button 
                      onClick={() => updateStatus(item.id, 'available')}
                      className="bg-black text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => updateStatus(item.id, 'archived')}
                      className="col-span-2 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-red-100 transition-colors"
                    >
                      Archive (Discard)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
