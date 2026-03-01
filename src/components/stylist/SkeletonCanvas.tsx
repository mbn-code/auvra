"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Zap, ShoppingBag, Shirt, User, Footprints, Hand, HardHat, Disc, Layers, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { StylistItem } from './DraggableItem';

interface SlotProps {
  id: string;
  label: string;
  items: StylistItem[];
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
    sm: 'w-20 h-20',
    md: 'w-28 h-32',
    lg: 'w-36 h-44'
  };

  return (
    <div 
      ref={setNodeRef}
      className={`relative group rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
        sizeClasses[size]
      } ${
        isOver ? 'border-yellow-400 bg-yellow-50/50 scale-110 shadow-2xl z-[100]' : 
        item ? 'border-zinc-900 bg-white shadow-md' : 'border-zinc-200 bg-zinc-50'
      } hover:z-[100] ${className}`}
    >
      {item ? (
        <>
          <img src={item.image} alt="" className="w-full h-full object-cover rounded-[1.8rem]" />
          
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-[110]">
            <button onClick={(e) => { e.stopPropagation(); onRemove(id, activeIndex); }} className="bg-black text-white p-3 rounded-full hover:bg-red-500 shadow-lg">
              <X size={12} />
            </button>
          </div>

          {items.length > 1 && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-[110]">
               <button onClick={(e) => { e.stopPropagation(); onSwitch(id, (activeIndex - 1 + items.length) % items.length); }} className="bg-black/80 text-white rounded-full p-2 hover:bg-black transition-colors"><ChevronLeft size={12}/></button>
               <span className="text-[8px] font-black text-white bg-black/80 px-2 py-0.5 rounded-full tabular-nums">{activeIndex + 1}/{items.length}</span>
               <button onClick={(e) => { e.stopPropagation(); onSwitch(id, (activeIndex + 1) % items.length); }} className="bg-black/80 text-white rounded-full p-2 hover:bg-black transition-colors"><ChevronRight size={12}/></button>
            </div>
          )}

          <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[8px] font-black px-2 py-1 rounded-full shadow-xl flex items-center gap-1 border-2 border-white">
            <Zap size={8} fill="black" /> {item.matchScore}%
          </div>
        </>
      ) : (
        <>
          <div className={`transition-all duration-500 ${isOver ? 'text-yellow-500 scale-125' : 'text-zinc-300'}`}>
            {icon}
          </div>
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center px-2 leading-tight">{label}</span>
          <button 
            onClick={() => onSearch(id, label)}
            className={`mt-2 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${isOver ? 'border-yellow-400 bg-yellow-400 text-black' : 'border-zinc-100 bg-white text-zinc-300 hover:border-black hover:text-black shadow-sm'}`}
          >
            <Search size={12} />
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
  onCheckout,
  isSaving,
  isExporting,
  isCheckingOut
}: { 
  outfit: Record<string, StylistItem[]>, 
  activeIndices: Record<string, number>,
  onSwitch: (id: string, index: number) => void,
  onRemove: (id: string, index: number) => void,
  onSearch: (id: string, label: string) => void,
  onSave: () => void,
  onExport: () => void,
  onCheckout: () => void,
  isSaving?: boolean,
  isExporting?: boolean,
  isCheckingOut?: boolean
}) {
  return (
    <div className="sticky top-32 w-full max-w-sm bg-white rounded-[4rem] border border-zinc-100 p-4 md:p-8 flex flex-col items-center shadow-2xl overflow-y-auto overflow-x-hidden max-h-[calc(100vh-8rem)] custom-scrollbar">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-1.5 rounded-full mb-4">
           <Layers size={12} className="text-zinc-900" />
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Auvra Layering Engine</p>
        </div>
        <h4 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Lookbook Canvas</h4>
        <p className="text-[9px] text-zinc-400 mt-2 uppercase tracking-[0.2em] font-medium">Manifest aesthetics onto the neural skeleton</p>
      </div>

      <div className="relative w-full min-h-[850px] flex flex-col items-center overflow-visible pt-6">
        {/* HEAD */}
        <DropSlot id="head" label="Headwear" items={outfit.head} activeIndex={activeIndices.head} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<HardHat size={20} />} className="z-[60]" />
        
        {/* NECK */}
        <DropSlot id="neck" label="Neck/Scarf" items={outfit.neck} activeIndex={activeIndices.neck} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<Disc size={16} />} className="-mt-3 z-[70]" />

        {/* UPPER BODY BLOCK */}
        <div className="relative w-full flex flex-col items-center mt-4 z-[50]">
           <DropSlot id="outer_upper" label="Outer Shell" items={outfit.outer_upper} activeIndex={activeIndices.outer_upper} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="lg" icon={<Shirt size={24} />} className="z-10 shadow-lg" />
           
           <div className="flex gap-4 -mt-20 z-20">
              <DropSlot id="mid_upper" label="Mid Layer" items={outfit.mid_upper} activeIndex={activeIndices.mid_upper} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<Shirt size={18} />} className="shadow-2xl border-white/50" />
              <DropSlot id="inner_upper" label="Base Layer" items={outfit.inner_upper} activeIndex={activeIndices.inner_upper} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<User size={18} />} className="shadow-2xl border-white/50" />
           </div>
        </div>

        {/* HANDS */}
        <div className="absolute left-0 top-[280px] -ml-2 md:-ml-10 z-[80]">
           <DropSlot id="hands" label="Gloves" items={outfit.hands} activeIndex={activeIndices.hands} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<Hand size={16} />} />
        </div>

        {/* WAIST */}
        <DropSlot id="waist" label="Belt/Waist" items={outfit.waist} activeIndex={activeIndices.waist} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<Disc size={16} />} className="mt-6 z-[60]" />
        
        {/* LOWER */}
        <DropSlot id="lower" label="Pants/Lower" items={outfit.lower} activeIndex={activeIndices.lower} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="lg" icon={<Shirt size={24} className="rotate-180" />} className="-mt-6 z-[40]" />
        
        {/* LEGWEAR */}
        <DropSlot id="legwear" label="Socks/Legs" items={outfit.legwear} activeIndex={activeIndices.legwear} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<Layers size={18} />} className="-mt-16 z-[50] shadow-xl" />
        
        {/* FOOTWEAR */}
        <DropSlot id="footwear" label="Footwear" items={outfit.footwear} activeIndex={activeIndices.footwear} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="md" icon={<Footprints size={22} />} className="-mt-6 z-[30]" />

        {/* ACCESSORY */}
        <div className="absolute right-0 top-[450px] -mr-2 md:-mr-10 z-[80]">
           <DropSlot id="accessory" label="Bag/Acc." items={outfit.accessory} activeIndex={activeIndices.accessory} onSwitch={onSwitch} onRemove={onRemove} onSearch={onSearch} size="sm" icon={<ShoppingBag size={16} />} />
        </div>

        {/* SKELETON OUTLINE SVG */}
        <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none flex items-center justify-center pt-12">
          <svg viewBox="0 0 100 200" className="h-[750px] w-auto text-black">
             <path d="M50,15 C54,15 58,19 58,26 C58,33 54,37 50,37 C46,37 42,33 42,26 C42,19 46,15 50,15 M38,45 L62,45 L68,85 L32,85 Z M32,88 L68,88 L64,150 L51,150 L51,195 L49,195 L49,150 L36,150 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="mt-12 w-full space-y-4">
         <button onClick={onSave} disabled={isSaving || isCheckingOut || isExporting} className="w-full py-6 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {isSaving ? "Archiving..." : "Lock Archive Look"}
         </button>
         <button onClick={onCheckout} disabled={isSaving || isCheckingOut || isExporting} className="w-full py-4 rounded-full bg-zinc-900 text-white text-[10px] md:text-[8px] font-black uppercase tracking-[0.4em] hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isCheckingOut ? "Preparing Cart..." : <><ShoppingBag size={12} /> Checkout Look</>}
         </button>
         <button onClick={onExport} disabled={isSaving || isCheckingOut || isExporting} className="w-full py-4 rounded-full border border-zinc-200 text-zinc-400 text-[10px] md:text-[8px] font-black uppercase tracking-[0.4em] hover:text-black transition-colors disabled:opacity-50">
            {isExporting ? "Sending DNA..." : "Export Style DNA"}
         </button>
      </div>
    </div>
  );
}
