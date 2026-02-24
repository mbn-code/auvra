"use client";

import { useEffect, useState } from "react";
import { PackageCheck, X } from "lucide-react";
import Link from "next/link";

const CITIES = [
  "London", "Berlin", "Paris", "Copenhagen", "Stockholm", 
  "Amsterdam", "Milan", "New York", "Los Angeles", "Tokyo",
  "Toronto", "Vienna", "Oslo", "Helsinki", "Munich"
];

const ITEMS = [
  "Arc'teryx Beta LT", "Chrome Hearts Hoodie", "Louis Vuitton Keepall", 
  "Chanel Classic Flap", "Corteiz Cargo Pants", "Prada Nylon Bag", 
  "Moncler Maya", "Hermès Kelly", "CP Company Goggle Jacket",
  "Asics Gel-Kayano 14", "Stone Island Ghost Piece"
];

export default function LiveToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({ city: "", item: "" });

  useEffect(() => {
    // Initial delay before first toast
    const initialTimer = setTimeout(() => {
      triggerToast();
    }, 12000);

    return () => clearTimeout(initialTimer);
  }, []);

  const triggerToast = () => {
    // Generate random data
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    
    setData({ city: randomCity, item: randomItem });
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next toast between 20-45 seconds
      const nextDelay = Math.floor(Math.random() * 25000) + 20000;
      setTimeout(triggerToast, nextDelay);
    }, 5000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-8 left-4 lg:left-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-zinc-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-4 max-w-xs relative pr-10">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
        <div className="bg-green-500/20 p-2 rounded-full">
          <PackageCheck size={16} className="text-green-400" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Recently Secured
          </p>
          <p className="text-xs font-medium">
            Someone in <span className="font-bold text-yellow-400">{data.city}</span> just secured: <br/>
            <span className="font-bold">{data.item}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
