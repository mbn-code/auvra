"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ExternalLink, Package, Truck, CheckCircle, Copy, AlertCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        pulse_inventory (
          title,
          brand,
          source_url,
          source_price,
          listing_price
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  async function updateOrderStatus(id: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }
  }

  async function handleDispatch(orderId: string) {
    const input = document.getElementById(`track-${orderId}`) as HTMLInputElement;
    const trackingNumber = input.value;
    if (!trackingNumber) return;

    const res = await fetch("/api/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, trackingNumber }),
    });

    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'dispatched', tracking_number: trackingNumber } : o));
    }
  }

  async function handleRefund(orderId: string) {
    if (!confirm("Are you sure you want to issue a full refund for this order? This cannot be undone.")) return;

    const res = await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'refunded' } : o));
    } else {
      const data = await res.json();
      alert("Refund failed: " + data.error);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <div className="p-24 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Accessing Order Ledger...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Logistics Control</p>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Fulfillment Command</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black tracking-tighter text-zinc-900">{orders.filter(o => o.status === 'pending_secure').length}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Secures</p>
          </div>
        </header>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* 1. Item Info */}
              <div className="lg:col-span-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Secured Item</p>
                <h3 className="text-xl font-black tracking-tighter mb-2">{order.pulse_inventory?.title || 'Static Product'}</h3>
                <p className="text-sm font-bold text-zinc-900 mb-6">{order.pulse_inventory?.brand}</p>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-zinc-400">Profit</span>
                      <span className="text-green-600">+€{order.pulse_inventory?.listing_price - (order.pulse_inventory?.source_price || 0) - 20}</span>
                   </div>
                   <a 
                    href={order.source_url || order.pulse_inventory?.source_url} 
                    target="_blank"
                    className="w-full bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-all"
                   >
                     <ExternalLink size={12} /> Open Source
                   </a>
                </div>
              </div>

              {/* 2. Customer Info */}
              <div className="lg:col-span-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Logistics Destination</p>
                <div className="space-y-4">
                   <div className="flex justify-between items-center group">
                      <p className="text-sm font-bold">{order.customer_name}</p>
                      <button onClick={() => copyToClipboard(order.customer_name)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-black transition-all"><Copy size={14}/></button>
                   </div>
                   <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 relative group">
                      <p className="text-xs font-medium leading-relaxed text-zinc-600">
                        {order.shipping_address?.line1}<br />
                        {order.shipping_address?.line2 && <>{order.shipping_address.line2}<br /></>}
                        {order.shipping_address?.postal_code} {order.shipping_address?.city}<br />
                        {order.shipping_address?.country}
                      </p>
                      <button 
                        onClick={() => copyToClipboard(`${order.shipping_address?.line1} ${order.shipping_address?.line2 || ''} ${order.shipping_address?.postal_code} ${order.shipping_address?.city} ${order.shipping_address?.country}`)} 
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-black transition-all"
                      >
                        <Copy size={14}/>
                      </button>
                   </div>
                   <p className="text-xs font-bold text-zinc-400 italic">"{order.customer_email}"</p>
                </div>
              </div>

              {/* 3. Status Control */}
              <div className="lg:col-span-4 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Command Actions</p>
                
                {order.status === 'pending_secure' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'secured')}
                    className="w-full bg-blue-600 text-white py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    <Package size={16} /> Mark as Secured
                  </button>
                )}

                {(order.status === 'secured' || order.status === 'pending_secure') && (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Tracking ID" 
                      id={`track-${order.id}`}
                      className="w-full bg-zinc-50 border border-zinc-200 px-6 py-4 rounded-2xl font-bold text-sm outline-none focus:border-black transition-colors"
                    />
                    <button 
                      onClick={() => handleDispatch(order.id)}
                      className="w-full bg-black text-white py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <Truck size={16} /> Dispatch Order
                    </button>
                  </div>
                )}

                {order.status === 'dispatched' && (
                  <div className="bg-green-50 text-green-700 p-6 rounded-[2rem] border border-green-100 flex items-center gap-4">
                     <CheckCircle size={24} />
                     <div>
                        <p className="text-sm font-black uppercase tracking-tight">Dispatched</p>
                        <p className="text-[10px] font-bold opacity-70">ID: {order.tracking_number}</p>
                     </div>
                  </div>
                )}

                {order.status === 'refunded' && (
                  <div className="bg-red-50 text-red-700 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4">
                     <AlertCircle size={24} />
                     <div>
                        <p className="text-sm font-black uppercase tracking-tight">Refunded</p>
                        <p className="text-[10px] font-bold opacity-70">Transaction Reversed</p>
                     </div>
                  </div>
                )}

                {order.status !== 'refunded' && (
                  <button 
                    onClick={() => handleRefund(order.id)}
                    className="w-full bg-zinc-100 text-zinc-400 py-3 rounded-2xl font-bold text-[9px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all mt-4"
                  >
                    Issue Full Refund
                  </button>
                )}
              </div>

            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
               <AlertCircle size={48} className="mx-auto text-zinc-100 mb-6" />
               <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No orders requiring attention.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
