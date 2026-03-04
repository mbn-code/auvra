import { products } from "@/config/products";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Hexagon, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Tactical Hardware | Auvra",
  description: "High-conversion techwear and everyday carry gadgets engineered for the modern cyberpunk aesthetic.",
};

export default function EquipmentPage() {
  const hardwareItems = Object.values(products).filter(p => !p.id.includes("power-scrub"));

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <header className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-8 shadow-sm">
            <Hexagon size={12} className="text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">EDC & Loadout</span>
          </div>
          
          <h1 className="text-7xl md:text-[9rem] font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic mb-12">
            Tactical <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Hardware.</span>
          </h1>
          
          <p className="text-zinc-500 text-xl font-medium max-w-2xl leading-relaxed tracking-tight">
            Cyberpunk aesthetics combined with highly functional everyday utility. Enhance your loadout with verified hardware.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">
          {hardwareItems.map((item, i) => (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`}
              className="group block animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-4 transition-all duration-500 hover:shadow-xl hover:border-black/10">
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-50 mb-6">
                  <Image 
                    src={item.images[0]} 
                    alt={item.name}
                    fill
                    className="object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  {item.badge && (
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={8} className="text-yellow-400" />
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">{item.name}</h2>
                    <span className="text-sm font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                      €{(item.price / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">{item.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
