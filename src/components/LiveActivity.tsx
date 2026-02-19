"use client";

import { useState, useEffect } from "react";

const CITIES = ["Manhattan", "Chelsea", "Santa Monica", "Shoreditch", "Mitte", "Le Marais"];
const NAMES = ["A. James", "S. Miller", "M. Chen", "E. Dubois", "D. Russo", "O. Wright"];

export default function LiveActivity({ productName }: { productName: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "" });

  useEffect(() => {
    const showNotification = () => {
      setData({
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
      });
      setIsVisible(true);
      
      setTimeout(() => setIsVisible(false), 4000);
    };

    // Very infrequent - infrequent enough to be believable
    const timer = setTimeout(showNotification, 8000);
    const interval = setInterval(showNotification, 55000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-12 left-8 z-[120] animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <div className="bg-white/80 backdrop-blur-xl p-3 px-6 rounded-full shadow-2xl border border-zinc-100/50 flex items-center gap-4">
        <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-pulse" />
        <p className="text-[10px] font-bold text-zinc-500 whitespace-nowrap tracking-tight">
          <span className="text-zinc-900">{data.name}</span> in {data.city} just performed an integrity check on {productName}
        </p>
      </div>
    </div>
  );
}
