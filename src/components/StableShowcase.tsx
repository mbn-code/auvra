"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Cpu, Layers } from "lucide-react";

interface StableNode {
  id: string;
  title: string;
  brand: string;
  listing_price: number;
  member_price: number | null;
  early_bird_price: number | null;
  early_bird_limit: number;
  preorder_price: number | null;
  units_sold_count: number;
  images: string[];
  category: string;
  pre_order_status: boolean;
  stock_level: number;
}

export default function StableShowcase({ items, isMember }: { items: StableNode[], isMember: boolean }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-32 border-t border-zinc-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div className="animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-6 shadow-sm">
            <Cpu size={12} className="text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Core Allocation Mesh</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic">
            Stable <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Nodes.</span>
          </h2>
        </div>
        
        <div className="max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
          <p className="text-zinc-500 text-lg font-medium leading-tight tracking-tight mb-6 italic">
            "Permanent artifacts. Engineered for the network. High-fidelity hardware always available for manifestation."
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => {
          // Tiered Pricing Logic for UI display
          let activePrice = item.listing_price;
          let priceLabel = "Public Launch";
          
          if (item.units_sold_count < item.early_bird_limit && item.early_bird_price) {
            activePrice = item.early_bird_price;
            priceLabel = "Early Bird";
          } else if (item.pre_order_status && item.preorder_price) {
            activePrice = item.preorder_price;
            priceLabel = "Pre-Order";
          }

          const memberPrice = item.member_price || Math.round(activePrice * 0.9);
          const displayPrice = isMember ? memberPrice : activePrice;

          return (
            <Link 
              key={item.id} 
              href={`/archive/${item.id}`}
              className="group flex flex-col gap-6"
            >
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-white border border-zinc-100 relative transition-all duration-700 shadow-sm hover:shadow-2xl hover:-translate-y-1">
                <Image 
                  src={item.images[0]} 
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  unoptimized
                />
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Layers size={10} className="text-blue-400" />
                    Core Allocation
                  </div>
                  {item.units_sold_count < item.early_bird_limit && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                      Early Bird Active
                    </div>
                  )}
                </div>

                {item.stock_level > 0 && item.stock_level < 5 && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-red-100 shadow-sm text-center">
                      <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                        Critical Stock: {item.stock_level} units left
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-2 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.brand}</p>
                    <h3 className="text-xl font-black tracking-tight leading-none uppercase italic">{item.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black italic">€{Math.round(displayPrice)}</div>
                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{priceLabel}</p>
                  </div>
                </div>
                
                {isMember ? (
                  <div className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                    <Zap size={8} fill="currentColor" /> Society Discount Applied
                  </div>
                ) : (
                  <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    Member Price: <span className="text-yellow-600">€{Math.round(memberPrice)}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
