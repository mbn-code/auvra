"use client";

import { useEffect, useState } from "react";

export default function StockBar() {
  const [stock, setStock] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock(prev => (prev > 3 ? prev - 1 : prev));
    }, 45000); // Decays over time to create urgency
    return () => clearInterval(interval);
  }, []);

  const percentage = (stock / 50) * 100;

  return (
    <div className="space-y-2 py-4">
      <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
        <span className="text-zinc-900 animate-pulse">Archive Status: Single Unit Available</span>
        <span className="text-zinc-500">Demand: High</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-zinc-900 transition-all duration-1000 ease-out" 
          style={{ width: `100%` }}
        />
      </div>
    </div>
  );
}
