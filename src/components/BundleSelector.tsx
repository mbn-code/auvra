"use client";

import { useState } from "react";
import { Check, Flame } from "lucide-react";

interface BundleOption {
  id: string;
  label: string;
  quantity: number;
  discount: number; // percentage
  isPopular?: boolean;
}

interface BundleSelectorProps {
  basePrice: number;
  onSelect: (option: BundleOption) => void;
}

const BUNDLE_OPTIONS: BundleOption[] = [
  { id: "single", label: "Individual", quantity: 1, discount: 0 },
  { id: "double", label: "Duo Pack", quantity: 2, discount: 15, isPopular: true },
  { id: "triple", label: "Family Bundle", quantity: 3, discount: 25 },
];

export default function BundleSelector({ basePrice, onSelect }: BundleSelectorProps) {
  const [selectedId, setSelectedId] = useState("double");

  const handleSelect = (option: BundleOption) => {
    setSelectedId(option.id);
    onSelect(option);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-4">
        <Flame size={12} className="text-orange-500 fill-orange-500" />
        Most customers buy 2 or more
      </div>
      <div className="grid grid-cols-1 gap-3">
        {BUNDLE_OPTIONS.map((option) => {
          const originalPrice = (basePrice * option.quantity) / 100;
          const discountedPrice = originalPrice * (1 - option.discount / 100);
          const perUnit = discountedPrice / option.quantity;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                selectedId === option.id
                  ? "border-black bg-zinc-50 shadow-sm"
                  : "border-zinc-100 hover:border-zinc-200"
              }`}
            >
              {option.isPopular && (
                <div className="absolute -top-3 right-4 bg-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedId === option.id ? "bg-black border-black" : "bg-white border-zinc-300"
                  }`}>
                    {selectedId === option.id && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{option.label}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {option.quantity} {option.quantity === 1 ? 'Unit' : 'Units'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-zinc-900">
                    €{discountedPrice.toFixed(2)}
                  </p>
                  {option.discount > 0 && (
                    <p className="text-[10px] font-bold text-green-600 uppercase">
                      Save {option.discount}%
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
