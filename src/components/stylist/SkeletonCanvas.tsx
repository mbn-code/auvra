"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Zap, ShoppingBag, Shirt, User, Footprints, Hand, HardHat, Disc, Layers } from 'lucide-react';

interface SlotProps {
  id: string;
  label: string;
  item: any | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const DropSlot = ({ id, label, item, className, size = 'md', icon }: SlotProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-28',
    lg: 'w-32 h-40'
  };

  return (
    <div 
      ref={setNodeRef}
      className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
        sizeClasses[size]
      } ${
        isOver ? 'border-yellow-400 bg-yellow-50/50 scale-105 shadow-lg z-20' : 
        item ? 'border-zinc-900 bg-white shadow-sm' : 'border-zinc-200 bg-zinc-50'
      } ${className}`}
    >
      {item ? (
        <>
          <img src={item.image} alt="" className="w-full h-full object-cover rounded-2xl" />
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
            <Zap size={6} fill="black" /> {item.matchScore}%
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
             <span className="text-[7px] font-black text-white uppercase tracking-widest">Replace</span>
          </div>
        </>
      ) : (
        <>
          <div className={`transition-colors ${isOver ? 'text-yellow-500' : 'text-zinc-300'}`}>
            {icon}
          </div>
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center px-1">{label}</span>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isOver ? 'border-yellow-400 text-yellow-500 animate-pulse' : 'border-zinc-200 text-zinc-300'}`}>
            <span className="text-[8px]">+</span>
          </div>
        </>
      )}
    </div>
  );
};

export function SkeletonCanvas({ outfit }: { outfit: any }) {
  return (
    <div className="sticky top-32 w-full max-w-sm bg-white rounded-[4rem] border border-zinc-100 p-6 flex flex-col items-center shadow-2xl">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-full mb-4">
           <Layers size={10} className="text-zinc-900" />
           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-900">Auvra Layering Engine</p>
        </div>
        <h4 className="text-xl font-black tracking-tighter uppercase italic">Lookbook Canvas</h4>
      </div>

      <div className="relative w-full h-[750px] flex flex-col items-center overflow-visible">
        {/* HEAD */}
        <DropSlot id="head" label="Headwear" item={outfit.head} size="md" icon={<HardHat size={16} />} className="z-10" />

        {/* NECK */}
        <DropSlot id="neck" label="Neck/Scarf" item={outfit.neck} size="sm" icon={<Disc size={14} />} className="-mt-4 z-20" />

        {/* UPPER LAYERING */}
        <div className="relative w-full flex flex-col items-center -mt-2">
           {/* Outer Upper (Jacket) */}
           <DropSlot id="outer_upper" label="Outer Shell" item={outfit.outer_upper} size="lg" icon={<Shirt size={20} />} className="z-10" />
           
           {/* Mid & Inner Layering */}
           <div className="flex gap-2 -mt-12 z-20">
              <DropSlot id="mid_upper" label="Mid Layer" item={outfit.mid_upper} size="md" icon={<Shirt size={16} />} className="shadow-xl" />
              <DropSlot id="inner_upper" label="Base Layer" item={outfit.inner_upper} size="md" icon={<User size={16} />} className="shadow-xl" />
           </div>
        </div>

        {/* HANDS */}
        <div className="absolute left-0 top-1/3 -translate-y-1/2 -ml-6">
           <DropSlot id="hands" label="Gloves" item={outfit.hands} size="sm" icon={<Hand size={14} />} />
        </div>

        {/* WAIST/BELT */}
        <DropSlot id="waist" label="Belt/Chain" item={outfit.waist} size="sm" icon={<Disc size={14} />} className="-mt-4 z-30" />

        {/* LOWER */}
        <DropSlot id="lower" label="Lower/Pants" item={outfit.lower} size="lg" icon={<Shirt size={20} className="rotate-180" />} className="-mt-4 z-10" />

        {/* LEGWEAR */}
        <DropSlot id="legwear" label="Legwear/Socks" item={outfit.legwear} size="md" icon={<Layers size={16} />} className="-mt-8 z-20 shadow-md" />

        {/* FOOTWEAR */}
        <DropSlot id="footwear" label="Footwear" item={outfit.footwear} size="md" icon={<Footprints size={18} />} className="-mt-4 z-10" />

        {/* ACCESSORY (Floating right) */}
        <div className="absolute right-0 top-1/2 -mr-6">
           <DropSlot id="accessory" label="Bag/Acc." item={outfit.accessory} size="sm" icon={<ShoppingBag size={14} />} />
        </div>

        {/* SKELETON OUTLINE SVG */}
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none flex items-center justify-center pt-10">
          <svg viewBox="0 0 100 200" className="h-[650px] w-auto text-zinc-200">
             <path 
              d="M50,15 C54,15 58,19 58,26 C58,33 54,37 50,37 C46,37 42,33 42,26 C42,19 46,15 50,15 M38,45 L62,45 L68,85 L32,85 Z M32,88 L68,88 L64,150 L51,150 L51,195 L49,195 L49,150 L36,150 Z" 
              fill="currentColor" 
            />
          </svg>
        </div>
      </div>

      <div className="mt-8 w-full space-y-3">
         <button className="w-full py-5 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all">
            Lock Archive Look
         </button>
         <button className="w-full py-3 rounded-full border border-zinc-200 text-zinc-400 text-[7px] font-black uppercase tracking-[0.3em] hover:text-black transition-colors">
            Export Style DNA
         </button>
      </div>
    </div>
  );
}
