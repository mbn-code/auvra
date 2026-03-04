"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Image from "next/image";

interface CrossSellItem {
  id: string;
  name: string;
  price: number; // in cents
  image: string;
  tagline: string;
}

interface CrossSellWidgetProps {
  item: CrossSellItem;
  onToggle: (selected: boolean) => void;
  isSelected: boolean;
}

export default function CrossSellWidget({ item, onToggle, isSelected }: CrossSellWidgetProps) {
  return (
    <button 
      onClick={() => onToggle(!isSelected)}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
        isSelected ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
      }`}
    >
      <div className="flex items-center gap-4 text-left">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 leading-tight">Add {item.name}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">{item.tagline}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black">+€{(item.price / 100).toFixed(2)}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          isSelected ? "bg-black text-white" : "bg-zinc-100 text-zinc-400"
        }`}>
          <Plus size={14} className={isSelected ? "rotate-45 transition-transform" : "transition-transform"} />
        </div>
      </div>
    </button>
  );
}
