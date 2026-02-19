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
        <span className="text-red-600 animate-pulse">Low Stock: Only {stock} units left</span>
        <span className="text-zinc-400">Inventory: 24%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-red-600 transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
