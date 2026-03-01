"use client";

import { useNetworkAware } from "@/lib/useNetworkAware";

export default function NetworkImage({ src, alt, className, priority }: { src: string, alt: string, className: string, priority?: boolean }) {
  const { isSlowConnection } = useNetworkAware();

  return (
    <div className="relative w-full h-full">
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${isSlowConnection ? 'blur-md scale-105' : ''}`} 
        loading={priority ? "eager" : "lazy"}
      />
      {isSlowConnection && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
           <div className="bg-black/80 text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
             <div className="w-2 h-2 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
             Neural Placeholder (Low Bandwidth)
           </div>
        </div>
      )}
    </div>
  );
}