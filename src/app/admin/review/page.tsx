"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, ExternalLink, ShieldCheck, AlertTriangle, TrendingUp, Star, Edit3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editMemberValue, setEditMemberValue] = useState<string>("");
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'pending_review' | 'available'>('pending_review');
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, [viewMode]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function fetchItems() {
    setLoading(true);
    setActionedIds(new Set());
    const { data, error } = await supabase
      .from('pulse_inventory')
      .select('*')
      .eq('status', viewMode)
      .order('potential_profit', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  }


  async function updateStatus(id: string, newStatus: string) {
    // Optimistic Update
    setActionedIds(prev => new Set(prev).add(id));

    const { error } = await supabase
      .from('pulse_inventory')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      // Rollback
      setActionedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert("Failed to update status: " + error.message);
    }
  }

  async function savePrice(id: string) {
    const newPrice = parseFloat(editValue);
    const newMemberPrice = parseFloat(editMemberValue);
    if (isNaN(newPrice) || isNaN(newMemberPrice)) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    const newProfit = newPrice - item.source_price - 20;

    const { error } = await supabase
      .from('pulse_inventory')
      .update({ 
        listing_price: newPrice,
        member_price: newMemberPrice,
        potential_profit: newProfit
      })
      .eq('id', id);

    if (!error) {
      setItems(items.map(i => i.id === id ? { ...i, listing_price: newPrice, member_price: newMemberPrice, potential_profit: newProfit } : i));
      setEditingId(null);
    }
  }

  async function approveAll() {
    if (items.length === 0) return;
    if (!confirm(`Are you sure you want to approve ALL ${items.length} pending items?`)) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('pulse_inventory')
      .update({ status: 'available' })
      .eq('status', 'pending_review');

    if (!error) {
      setItems([]);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-24 text-center">Opening Auvra Terminal...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div className="flex items-end gap-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Arbitrage Terminal</p>
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Profit Review Board</h1>
            </div>
            <nav className="flex gap-6 pb-1">
               <button 
                  onClick={() => setViewMode('pending_review')} 
                  className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'pending_review' ? 'text-zinc-900 border-b-2 border-black' : 'text-zinc-400 hover:text-black transition-colors'} pb-1`}
               >
                 Pending Review
               </button>
               <button 
                  onClick={() => setViewMode('available')} 
                  className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'available' ? 'text-zinc-900 border-b-2 border-black' : 'text-zinc-400 hover:text-black transition-colors'} pb-1`}
               >
                 Approved (Live)
               </button>
               <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors pb-1 ml-4">Orders</Link>
            </nav>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right flex flex-col items-end gap-2">
              <div className="flex items-center gap-4">
                {actionedIds.size > 0 && (
                  <button 
                    onClick={fetchItems}
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg animate-in fade-in zoom-in"
                  >
                    Clear {actionedIds.size} Completed
                  </button>
                )}
                <button 
                  onClick={approveAll}
                  className="bg-zinc-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Approve All
                </button>
                <p className="text-2xl font-black tracking-tighter text-zinc-900">{items.length - actionedIds.size}</p>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Awaiting Command</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600"
              title="Logout"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-zinc-100 shadow-sm">
             <ShieldCheck size={48} className="mx-auto text-zinc-200 mb-6" />
             <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Inventory Synchronized.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const isActioned = actionedIds.has(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-[2.5rem] overflow-hidden border-2 shadow-sm flex flex-col transition-all duration-500 ${
                    isActioned ? 'opacity-10 grayscale pointer-events-none scale-[0.98]' : 
                    item.potential_profit > 60 ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.1)]' : 'border-white'
                  }`}
                >
                  <div className="aspect-[4/5] relative group">
                    <img src={item.images[0]} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt={item.title} />
                    {isActioned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-10">
                        <Check className="text-zinc-900 w-12 h-12" />
                      </div>
                    )}
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
                          Profit: +€{Math.round(item.potential_profit)}
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-8 flex-1">
                      <h3 className="text-2xl font-black mb-4 tracking-tighter leading-tight">{item.title}</h3>
                      <div className="flex flex-col gap-2">
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Source: <span className="text-zinc-900">€{item.source_price.toFixed(2)}</span></p>
                        
                      {editingId === item.id ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2 items-center">
                            <span className="text-[9px] font-black text-zinc-400 uppercase w-12">Public:</span>
                            <input 
                              type="number" 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded text-sm font-bold"
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-[9px] font-black text-yellow-600 uppercase w-12">Society:</span>
                            <input 
                              type="number" 
                              value={editMemberValue} 
                              onChange={(e) => setEditMemberValue(e.target.value)}
                              className="w-24 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded text-sm font-bold"
                            />
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => savePrice(item.id)} className="text-[10px] font-black uppercase text-green-600">Save Changes</button>
                            <button onClick={() => setEditingId(null)} className="text-[10px] font-black uppercase text-zinc-400">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Listing: <span className="text-zinc-900">€{item.listing_price}</span></p>
                            <button 
                              onClick={() => { setEditingId(item.id); setEditValue(item.listing_price.toString()); setEditMemberValue(item.member_price?.toString() || ""); }}
                              className="text-zinc-300 hover:text-black transition-colors"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                          <p className="text-yellow-600 text-[10px] font-black uppercase tracking-widest">Society: <span className="text-zinc-900">€{item.member_price}</span></p>
                        </div>
                      )}

                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={item.source_url} 
                        target="_blank" 
                        className="bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                      >
                        <ExternalLink size={14} /> Open Source
                      </a>
                      {viewMode === 'pending_review' ? (
                        <button 
                          onClick={() => updateStatus(item.id, 'available')}
                          className="bg-black text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                        >
                          <Check size={14} /> Approve
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="bg-zinc-200 text-zinc-500 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Check size={14} /> Approved
                        </button>
                      )}
                      <button 
                        onClick={() => updateStatus(item.id, 'archived')}
                        className="col-span-2 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-red-100 transition-colors"
                      >
                        Archive (Discard)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
