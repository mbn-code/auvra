"use client";

import { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  TrendingUp, 
  Package, 
  ExternalLink, 
  X, 
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

interface StableItem {
  id: string;
  title: string;
  brand: string;
  listing_price: number;
  member_price: number | null;
  early_bird_price: number | null;
  early_bird_limit: number;
  preorder_price: number | null;
  source_price: number; // Mapping source_cost to source_price from schema
  stock_level: number;
  units_sold_count: number;
  images: string[];
  style_embedding: any;
  created_at: string;
}

export default function StableDashboardClient({ initialItems }: { initialItems: StableItem[] }) {
  const [items, setItems] = useState<StableItem[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    listing_price: "",
    member_price: "",
    early_bird_price: "",
    early_bird_limit: "20",
    preorder_price: "",
    source_cost: "",
    stock_level: "0",
    category: "Archive"
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images via the secure server-side admin upload endpoint.
      //    The browser never touches the storage bucket directly — the service-role
      //    key on the server handles the actual upload after verifying admin session.
      const imageUrls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error ?? "Image upload failed");
        }

        const { url } = await uploadRes.json();
        imageUrls.push(url);
      }

      // 2. Create product
      const res = await fetch("/api/admin/stable/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
          is_stable: true
        })
      });

      if (!res.ok) throw new Error("Failed to create product");

      const newItem = await res.json();
      setItems(prev => [newItem, ...prev]);
      setIsModalOpen(false);
      setFiles([]);
      setFormData({
        title: "",
        brand: "",
        listing_price: "",
        member_price: "",
        early_bird_price: "",
        early_bird_limit: "20",
        preorder_price: "",
        source_cost: "",
        stock_level: "0",
        category: "Archive"
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will soft-delete the item.")) return;
    try {
      const res = await fetch(`/api/admin/stable/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateDNA = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/stable/dna?id=${id}`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === id ? { ...i, style_embedding: updated.embedding } : i));
        alert("DNA Generated Successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<StableItem>) => {
    try {
      const res = await fetch(`/api/admin/stable/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Package size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inventory Terminal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic italic">Stable Nodes.</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-white/5"
        >
          <Plus size={16} /> Ingest Stable Node
        </button>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Active Allocations</p>
            <p className="text-4xl font-black tracking-tighter">{items.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Physical Stock</p>
            <p className="text-4xl font-black tracking-tighter">{items.reduce((acc, i) => acc + i.stock_level, 0)}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Potential Margin (DKK)</p>
            <p className="text-4xl font-black tracking-tighter text-green-500">
              {Math.round(items.reduce((acc, i) => acc + ((i.listing_price - i.source_price) * 7.45), 0)).toLocaleString()} kr.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Node</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Pricing / Margin</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Stock</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 relative">
                        <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                        {!item.style_embedding && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <AlertCircle size={16} className="text-yellow-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">{item.brand}</p>
                        <h3 className="text-sm font-bold uppercase">{item.title}</h3>
                        <p className="text-[10px] font-mono text-zinc-600 mt-1">{item.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest w-12">Launch</span>
                        <input 
                          type="number" 
                          value={item.listing_price}
                          onChange={(e) => handleUpdate(item.id, { listing_price: parseFloat(e.target.value) })}
                          className="w-20 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg text-xs font-black outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest w-12">Member</span>
                        <input 
                          type="number" 
                          value={item.member_price || 0}
                          onChange={(e) => handleUpdate(item.id, { member_price: parseFloat(e.target.value) })}
                          className="w-20 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg text-xs font-black outline-none focus:border-red-500 text-yellow-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 border-t border-zinc-800/50 pt-2">
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest w-12">Early</span>
                        <input 
                          type="number" 
                          value={item.early_bird_price || 0}
                          onChange={(e) => handleUpdate(item.id, { early_bird_price: parseFloat(e.target.value) })}
                          className="w-20 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg text-xs font-black outline-none focus:border-red-500 text-red-400"
                        />
                        <span className="text-[8px] text-zinc-600 font-bold">Limit:</span>
                        <input 
                          type="number" 
                          value={item.early_bird_limit}
                          onChange={(e) => handleUpdate(item.id, { early_bird_limit: parseInt(e.target.value) })}
                          className="w-12 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg text-xs font-black outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest w-12">Preorder</span>
                        <input 
                          type="number" 
                          value={item.preorder_price || 0}
                          onChange={(e) => handleUpdate(item.id, { preorder_price: parseFloat(e.target.value) })}
                          className="w-20 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg text-xs font-black outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/50">
                        <TrendingUp size={10} className="text-green-500" />
                        <span className="text-[10px] font-black text-green-500">
                          +{Math.round((item.listing_price - item.source_price) * 7.45)} kr. profit
                        </span>
                        <div className="ml-auto bg-white/5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-zinc-400">
                          Active: €{
                            item.units_sold_count < item.early_bird_limit && item.early_bird_price
                            ? item.early_bird_price
                            : (item.preorder_price || item.listing_price)
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          value={item.stock_level}
                          onChange={(e) => handleUpdate(item.id, { stock_level: parseInt(e.target.value) })}
                          className="w-16 bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs font-black outline-none focus:border-red-500"
                        />
                        {item.stock_level <= 3 && (
                          <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">Low Stock</span>
                        )}
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Sales</p>
                        <p className="text-sm font-black text-white">{item.units_sold_count || 0}</p>
                        {item.units_sold_count < item.early_bird_limit && (
                          <p className="text-[7px] font-bold text-red-500 uppercase mt-1">
                            {item.early_bird_limit - item.units_sold_count} left for Early Bird
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleGenerateDNA(item.id)}
                        className={`p-3 rounded-xl transition-all ${item.style_embedding ? 'bg-zinc-800 text-zinc-500' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                        title="Generate DNA"
                      >
                        <Cpu size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 bg-zinc-800 text-zinc-500 rounded-xl hover:bg-zinc-700 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic italic mb-8">Ingest Stable Node</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
              <div className="col-span-full">
                <div {...getRootProps()} className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${isDragActive ? 'border-red-500 bg-red-500/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <input {...getInputProps()} />
                  <ImageIcon size={40} className="mx-auto mb-4 text-zinc-600" />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {isDragActive ? "Drop to Allocation" : "Drag Studio Assets or Click"}
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-20 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/80 rounded-full p-1"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Product Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="e.g. Auvra Boxy Hoodie" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Brand Identity</label>
                  <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="Auvra Core" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Initial Allocation (Stock)</label>
                  <input type="number" required value={formData.stock_level} onChange={e => setFormData({...formData, stock_level: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="20" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Public Launch Price (€)</label>
                    <input type="number" required value={formData.listing_price} onChange={e => setFormData({...formData, listing_price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="120" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Society Price (€)</label>
                    <input type="number" required value={formData.member_price} onChange={e => setFormData({...formData, member_price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="95" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                  <div>
                    <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Early Bird Price (€)</label>
                    <input type="number" value={formData.early_bird_price} onChange={e => setFormData({...formData, early_bird_price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="60" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Early Bird Limit (Units)</label>
                    <input type="number" value={formData.early_bird_limit} onChange={e => setFormData({...formData, early_bird_limit: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="20" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Standard Preorder Price (€)</label>
                  <input type="number" value={formData.preorder_price} onChange={e => setFormData({...formData, preorder_price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="75" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Source Cost (€)</label>
                  <input type="number" required value={formData.source_cost} onChange={e => setFormData({...formData, source_cost: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-500" placeholder="20" />
                </div>
                <div className="pt-2">
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Projected Unit Alpha</p>
                    <p className="text-xl font-black text-white">
                      +{Math.round((Number(formData.listing_price || 0) - Number(formData.source_cost || 0)) * 7.45)} kr. / unit
                    </p>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="col-span-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isUploading ? <><Loader2 className="animate-spin" size={16} /> Initializing Node...</> : "Finalize Allocation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
