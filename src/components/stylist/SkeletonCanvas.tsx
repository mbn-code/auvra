"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Zap, ShoppingBag, Shirt, User, Footprints, Hand, HardHat, Disc, Layers, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface SlotProps {
  id: string;
  label: string;
  items: any[];
  activeIndex: number;
  onSwitch: (id: string, index: number) => void;
  onRemove: (id: string, index: number) => void;
  onSearch: (id: string, label: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const DropSlot = ({ id, label, items, activeIndex, onSwitch, onRemove, onSearch, className, size = 'md', icon }: SlotProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  const item = items[activeIndex];

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
        isOver ? 'border-yellow-400 bg-yellow-50/50 scale-105 shadow-lg z-30' : 
        item ? 'border-zinc-900 bg-white shadow-md' : 'border-zinc-200 bg-zinc-50'
      } ${className}`}
    >
      {item ? (
        <>
          <img src={item.image} alt="" className="w-full h-full object-cover rounded-2xl" />
          
          <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-40">
            <button onClick={(e) => { e.stopPropagation(); onRemove(id, activeIndex); }} className="bg-black/80 text-white p-1 rounded-full hover:bg-red-500">
              <X size={10} />
            </button>
          </div>

          {items.length > 1 && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1 z-40">
               <button onClick={(e) => { e.stopPropagation(); onSwitch(id, (activeIndex - 1 + items.length) % items.length); }} className="bg-black/60 text-white rounded-full p-0.5"><ChevronLeft size={10}/></button>
               <span className="text-[7px] font-black text-white bg-black/60 px-1 rounded-full">{activeIndex + 1}/{items.length}</span>
               <button onClick={(e) => { e.stopPropagation(); onSwitch(id, (activeIndex + 1) % items.length); }} className="bg-black/60 text-white rounded-full p-0.5"><ChevronRight size={10}/></button>
            </div>
          )}

          <div className="absolute -top-2 -right-2 bg-yellow-400 text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
            <Zap size={6} fill="black" /> {item.matchScore}%
          </div>
        </>
      ) : (
        <>
          <div className={`transition-colors ${isOver ? 'text-yellow-500' : 'text-zinc-300'}`}>
            {icon}
          </div>
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center px-1 leading-tight">{label}</span>
          <button 
            onClick={() => onSearch(id, label)}
            className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isOver ? 'border-yellow-400 bg-yellow-400 text-black' : 'border-zinc-200 bg-white text-zinc-400 hover:border-black hover:text-black'}`}
          >
            <Search size={10} />
          </button>
        </>
      )}
    </div>
  );
};

export function SkeletonCanvas({ 
  outfit, 
  activeIndices, 
  onSwitch, 
  onRemove, 
  onSearch,
  onSave,
  onExport,
  isSaving,
  isExporting
}: { 
  outfit: Record<string, any[]>, 
  activeIndices: Record<string, number>,
  onSwitch: (id: string, index: number) => void,
  onRemove: (id: string, index: number) => void,
  onSearch: (id: string, label: string) => void,
  onSave: () => void,
  onExport: () => void,
  isSaving?: boolean,
  isExporting?: boolean
}) {
  return (
    <div className="sticky top-32 w-full max-w-sm bg-white rounded-[4rem] border border-zinc-100 p-6 flex flex-col items-center shadow-2xl">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-full mb-4">
           <Layers size={10} className="text-zinc-900" />
           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-900">Auvra Layering Engine</p>
        </div>
        <h4 className="text-xl font-black tracking-tighter uppercase italic">Lookbook Canvas</h4>
        <p className="text-[8px] text-zinc-400 mt-1 uppercase tracking-widest">Drag items to slots or click search to find matches</p>
      </div>

      <div className="relative w-full h-[750px] flex flex-col items-center overflow-visible">
        <DropSlot id="head" label="Headwear" items={outfit.head} activeIndex={activeIndices.head} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<HardHat size={16} />} className="z-10" />
        <DropSlot id="neck" label="Neck/Scarf" items={outfit.neck} activeIndex={activeIndices.neck} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<Disc size={14} />} className="-mt-4 z-20" />

        <div className="relative w-full flex flex-col items-center -mt-2">
           <DropSlot id="outer_upper" label="Outer Shell" items={outfit.outer_upper} activeIndex={activeIndices.outer_upper} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="lg" icon={<Shirt size={20} />} className="z-10" />
           <div className="flex gap-2 -mt-12 z-20">
              <DropSlot id="mid_upper" label="Mid Layer" items={outfit.mid_upper} activeIndex={activeIndices.mid_upper} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<Shirt size={16} />} className="shadow-xl" />
              <DropSlot id="inner_upper" label="Base Layer" items={outfit.inner_upper} activeIndex={activeIndices.inner_upper} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<User size={16} />} className="shadow-xl" />
           </div>
        </div>

        <div className="absolute left-0 top-1/3 -translate-y-1/2 -ml-6">
           <DropSlot id="hands" label="Gloves" items={outfit.hands} activeIndex={activeIndices.hands} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<Hand size={14} />} />
        </div>

        <DropSlot id="waist" label="Belt/Chain" items={outfit.waist} activeIndex={activeIndices.waist} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<Disc size={14} />} className="-mt-4 z-30" />
        <DropSlot id="lower" label="Lower/Pants" items={outfit.lower} activeIndex={activeIndices.lower} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="lg" icon={<Shirt size={20} className="rotate-180" />} className="-mt-4 z-10" />
        <DropSlot id="legwear" label="Legwear/Socks" items={outfit.legwear} activeIndex={activeIndices.legwear} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<Layers size={16} />} className="-mt-8 z-20 shadow-md" />
        <DropSlot id="footwear" label="Footwear" items={outfit.footwear} activeIndex={activeIndices.footwear} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<Footprints size={18} />} className="-mt-4 z-10" />

        <div className="absolute right-0 top-1/2 -mr-6">
           <DropSlot id="accessory" label="Bag/Acc." items={outfit.accessory} activeIndex={activeIndices.accessory} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<ShoppingBag size={14} />} />
        </div>

        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none flex items-center justify-center pt-10">
          <svg viewBox="0 0 100 200" className="h-[650px] w-auto text-zinc-200">
             <path d="M50,15 C54,15 58,19 58,26 C58,33 54,37 50,37 C46,37 42,33 42,26 C42,19 46,15 50,15 M38,45 L62,45 L68,85 L32,85 Z M32,88 L68,88 L64,150 L51,150 L51,195 L49,195 L49,150 L36,150 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="mt-8 w-full space-y-3">
         <button onClick={onSave} disabled={isSaving} className="w-full py-5 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {isSaving ? "Archiving..." : "Lock Archive Look"}
         </button>
         <button onClick={onExport} disabled={isExporting} className="w-full py-3 rounded-full border border-zinc-200 text-zinc-400 text-[7px] font-black uppercase tracking-[0.3em] hover:text-black transition-colors disabled:opacity-50">
            {isExporting ? "Sending DNA..." : "Export Style DNA"}
         </button>
      </div>
    </div>
  );
}
