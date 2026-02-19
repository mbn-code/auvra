"use client";

import { useEffect, useState } from "react";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

export default function TrustPulse() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-y border-zinc-100 bg-zinc-50/50 rounded-3xl">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-green-500 transition-opacity duration-1000 ${pulse ? "opacity-100" : "opacity-40"}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Live Secure Connection</span>
      </div>
      <div className="flex items-center gap-2 text-zinc-400">
        <Lock size={12} strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
      </div>
      <div className="flex items-center gap-2 text-zinc-400">
        <CreditCard size={12} strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest">PCI Compliant</span>
      </div>
    </div>
  );
}
