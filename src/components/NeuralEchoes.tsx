"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

export function NeuralEchoes({ productId }: { productId: string }) {
  const [echoes, setEchoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchEchoes() {
      if (!productId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/archive/echoes?id=${productId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEchoes(data.echoes || []);
      } catch (err) {
        console.error("Failed to fetch echoes", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEchoes();
  }, [productId]);

  if (isLoading) return (
    <div className="pt-20 border-t border-zinc-100 text-center py-12">
      <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-zinc-400">Searching Latent Space...</p>
    </div>
  );

  if (hasError || echoes.length === 0) return null;

  return (
    <section className="pt-20 border-t border-zinc-100">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-4">
            <Cpu size={10} className="text-red-500" />
            Neural Vector Matching
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Neural Echoes.</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Visually similar pieces detected in the latent space</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {echoes.map((item) => (
          <Link 
            key={item.id} 
            href={`/archive/${item.id}`}
            className="group flex flex-col gap-4"
          >
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-zinc-100 relative group-hover:shadow-xl transition-all duration-700 bg-white">
              <img 
                src={item.images[0]} 
                alt={item.title}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm">
                  €{Math.round(item.listing_price)}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 truncate italic">{item.title}</h4>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{item.brand}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
