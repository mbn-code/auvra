"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export function NeuralInjections() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInjections() {
      try {
        const res = await fetch("/api/archive/injections");
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error("Failed to fetch injections", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInjections();
  }, []);

  if (isLoading || items.length === 0) return null;

  return (
    <div className="w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md z-30 overflow-hidden py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex-shrink-0 flex flex-col items-start gap-1 pr-6 border-r border-zinc-200">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-red-500 fill-red-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">Neural</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 whitespace-nowrap italic">Injections</span>
        </div>
        
        <div className="flex items-center gap-6">
          {items.map((item) => (
            <Link 
              key={item.id} 
              href={`/archive/${item.id}`}
              className="flex-shrink-0 group flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 rounded-full p-1 border border-zinc-200 group-hover:border-red-500 transition-colors duration-500 overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">
                {item.brand.substring(0, 12)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
