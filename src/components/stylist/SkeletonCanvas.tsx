"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Zap } from 'lucide-react';

interface SlotProps {
  id: string;
  label: string;
  item: any | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DropSlot = ({ id, label, item, className, size = 'md' }: SlotProps) => {
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
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center px-1">{label}</span>
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isOver ? 'border-yellow-400 text-yellow-500 animate-pulse' : 'border-zinc-200 text-zinc-300'}`}>
            <span className="text-[10px]">+</span>
          </div>
        </>
      )}
    </div>
  );
};

export function SkeletonCanvas({ outfit }: { outfit: any }) {
  return (
    <div className="sticky top-32 w-full max-w-sm bg-zinc-50/50 rounded-[4rem] border border-zinc-100 p-6 flex flex-col items-center shadow-inner">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-1">Neural Workspace</p>
        <h4 className="text-lg font-black tracking-tighter uppercase italic">Layered Archive Builder</h4>
      </div>

      <div className="relative w-full h-[700px] flex flex-col items-center overflow-visible">
        {/* HEAD */}
        <DropSlot id="head" label="Head" item={outfit.head} size="md" className="z-10" />

        {/* NECK */}
        <DropSlot id="neck" label="Neck" item={outfit.neck} size="sm" className="-mt-4 z-20" />

        {/* UPPER LAYERING - Stacking simulation */}
        <div className="relative w-full flex flex-col items-center -mt-2">
           {/* Outer Upper (Jacket) */}
           <DropSlot id="outer_upper" label="Outer" item={outfit.outer_upper} size="lg" className="z-10" />
           
           {/* Mid & Inner Layering - Floating side-by-side or stacked below */}
           <div className="flex gap-2 -mt-12 z-20">
              <DropSlot id="mid_upper" label="Mid" item={outfit.mid_upper} size="md" className="shadow-xl" />
              <DropSlot id="inner_upper" label="Inner" item={outfit.inner_upper} size="md" className="shadow-xl" />
           </div>
        </div>

        {/* HANDS (Floating) */}
        <div className="absolute left-0 top-1/3 -translate-y-1/2 -ml-4">
           <DropSlot id="hands" label="Hands" item={outfit.hands} size="sm" />
        </div>

        {/* WAIST */}
        <DropSlot id="waist" label="Waist" item={outfit.waist} size="sm" className="-mt-4 z-30" />

        {/* LOWER */}
        <DropSlot id="lower" label="Lower" item={outfit.lower} size="lg" className="-mt-4 z-10" />

        {/* LEGWEAR (Applied on legs) */}
        <DropSlot id="legwear" label="Legwear" item={outfit.legwear} size="md" className="-mt-8 z-20 shadow-md" />

        {/* FOOTWEAR */}
        <DropSlot id="footwear" label="Feet" item={outfit.footwear} size="md" className="-mt-4 z-10" />

        {/* ACCESSORY (Floating right) */}
        <div className="absolute right-0 top-1/2 -mr-4">
           <DropSlot id="accessory" label="Acc." item={outfit.accessory} size="sm" />
        </div>

        {/* SKELETON OUTLINE SVG (Refined for layering) */}
        <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none flex items-center justify-center pt-10">
          <svg viewBox="0 0 100 200" className="h-[600px] w-auto">
            <path 
              d="M50,10 C55,10 60,15 60,25 C60,35 55,40 50,40 C45,40 40,35 40,25 C40,15 45,10 50,10 M40,45 L60,45 L65,90 L35,90 Z M35,95 L65,95 L62,150 L52,150 L52,190 L48,190 L48,150 L38,150 Z" 
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
