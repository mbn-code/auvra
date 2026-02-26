"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Cpu, Zap } from "lucide-react";

export default function StylistFeature() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="bg-zinc-50 rounded-[4rem] border border-zinc-100 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row items-center">
          
          {/* Content Side */}
          <div className="flex-1 p-12 md:p-20 relative z-10">
            <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-8">
              <Cpu size={10} className="text-yellow-400" /> Neural Aesthetic DNA
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] mb-8 text-zinc-900">
              Your Personal <br /> Neural Stylist.
            </h2>
            
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md mb-12">
              Our AI engine scans the global archive <span className="text-zinc-900 font-bold">so you can</span> discover coherent, ready-to-wear outfits tailored to your specific brand preferences and color DNA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/stylist" 
                className="bg-black text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group"
              >
                Initialize Protocol <Sparkles size={16} className="text-yellow-400" />
              </Link>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/50 backdrop-blur-sm rounded-full border border-zinc-200/50">
                 <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center">
                         <span className="text-[8px] font-bold text-zinc-500">N{i}</span>
                      </div>
                    ))}
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    <span className="text-zinc-900">1,200+</span> Coordinates Generated
                 </p>
              </div>
            </div>
          </div>

          {/* Visual Side (Simulated Outfit) */}
          <div className="flex-1 w-full bg-zinc-100/50 p-8 lg:p-12 relative min-h-[500px] flex items-center justify-center">
             <div className="grid grid-cols-2 gap-4 w-full max-w-md animate-in fade-in zoom-in duration-1000">
                 <div className="aspect-[4/5] bg-white rounded-3xl border border-zinc-200 p-2 shadow-xl -rotate-3 hover:rotate-0 transition-transform duration-500 relative group">
                   <div className="w-full h-full bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden">
                      <Image src="https://res.cloudinary.com/dvdjz4igb/image/upload/c_fill,g_center,h_1250,w_1000/q_auto/f_auto/v1/auvra/archive/a0nllqrvwh2iafjz9vhx" unoptimized fill className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Arc'teryx Alpha SV" />
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-2 rounded-xl border border-white/10">
                      <p className="text-[7px] font-black text-white uppercase tracking-widest text-center">Arc'teryx Alpha SV</p>
                   </div>
                </div>
                <div className="aspect-[4/5] bg-white rounded-3xl border border-zinc-200 p-2 shadow-xl rotate-6 translate-y-8 hover:rotate-0 transition-transform duration-500 relative group">
                   <div className="w-full h-full bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden">
                      <Image src="https://res.cloudinary.com/dvdjz4igb/image/upload/c_fill,g_center,h_1250,w_1000/q_auto/f_auto/v1/auvra/archive/ezmxxsrfdx0zpzomrawl" unoptimized fill className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Arc'teryx Bib Pants" />
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-2 rounded-xl border border-white/10">
                      <p className="text-[7px] font-black text-white uppercase tracking-widest text-center">Arc'teryx Bib Pants</p>
                   </div>
                </div>
                <div className="aspect-[4/5] bg-white rounded-3xl border border-zinc-200 p-2 shadow-xl -rotate-6 -translate-y-4 hover:rotate-0 transition-transform duration-500 relative group">
                   <div className="w-full h-full bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden">
                      <Image src="https://res.cloudinary.com/dvdjz4igb/image/upload/c_fill,g_center,h_1250,w_1000/q_auto/f_auto/v1/auvra/archive/u0ocezd7zzdtbfelpbux" unoptimized fill className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="ASICS Gel NYC" />
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-2 rounded-xl border border-white/10">
                      <p className="text-[7px] font-black text-white uppercase tracking-widest text-center">ASICS Gel NYC</p>
                   </div>
                </div>
                <div className="aspect-[4/5] bg-white rounded-3xl border border-zinc-200 p-2 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 relative group">
                   <div className="w-full h-full bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden">
                      <Image src="https://res.cloudinary.com/dvdjz4igb/image/upload/c_fill,g_center,h_1250,w_1000/q_auto/f_auto/v1/auvra/archive/rar3s1sn1pfsoc3899qb" unoptimized fill className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Salomon S/Lab Vesta" />
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-2 rounded-xl border border-white/10">
                      <p className="text-[7px] font-black text-white uppercase tracking-widest text-center">Salomon S/Lab</p>
                   </div>
                </div>
             </div>
             
             {/* Decorative UI elements */}
             <div className="absolute top-12 right-12 bg-white p-4 rounded-2xl border border-zinc-200 shadow-lg animate-bounce duration-[3000ms]">
                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
