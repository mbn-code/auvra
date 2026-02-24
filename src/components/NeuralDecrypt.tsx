"use client";

import { useEffect, useState } from "react";
import { Lock, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NeuralDecrypt({ 
  imageUrl, 
  isLocked, 
  onUnlock 
}: { 
  imageUrl: string; 
  isLocked: boolean;
  onUnlock?: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLocked) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 92 ? prev + Math.random() * 2 : prev));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLocked]);

  if (!isLocked) return <Image src={imageUrl} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" alt="" />;

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden group">
      {/* Blurred Base */}
      <Image 
        src={imageUrl} 
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover blur-md opacity-90 scale-105" 
        alt="" 
      />
      
      {/* Digital Interference Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
          <Lock size={24} className="text-yellow-400" />
        </div>
        
        <h4 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-4">
          Neural Decryption Required
        </h4>
        
        <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-8">
          Status: {progress.toFixed(1)}% Decrypted...
        </p>

        <Link 
          href="/pricing"
          className="bg-white text-black px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all"
        >
          Bypass Security Node
        </Link>
      </div>

      {/* Grid scanning effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400/20 animate-scan" />
    </div>
  );
}
