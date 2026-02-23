"use client";

import { useEffect, useState } from "react";

export default function LimitedIntakes() {
  const [count, setCount] = useState(7);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => (prev > 2 ? prev - (Math.random() > 0.8 ? 1 : 0) : prev));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
      Only {count} Invites Left Today
    </p>
  );
}
