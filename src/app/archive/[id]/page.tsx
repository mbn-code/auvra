import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Accordion from "@/components/Accordion";
import LiveActivity from "@/components/LiveActivity";
import StickyBuy from "@/components/StickyBuy";
import TrustPulse from "@/components/TrustPulse";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Eye, PackageCheck, Zap, Globe, CheckCircle } from "lucide-react";

interface ArchiveProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchiveProductPage({ params }: ArchiveProductPageProps) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(item.listing_price);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryString = deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-white">
      <LiveActivity productName={item.title} />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-20 xl:gap-32">
          
          <section className="lg:w-[55%] space-y-6">
            <div className="sticky top-32 space-y-6">
               <div className="rounded-[3.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 relative group transition-all duration-1000">
                  <img 
                    src={item.images[0]} 
                    className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt={item.title} 
                  />
                  <div className="absolute top-8 left-8 flex flex-col gap-3">
                     <div className="bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
                        <Zap size={10} className="text-yellow-400" />
                        Auvra Pulse Selection
                     </div>
                     <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Regional Dispatch: {item.locale?.toUpperCase()}
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  {item.images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100">
                      <img src={img} className="w-full h-full object-cover" alt={`${item.title} ${i}`} />
                    </div>
                  ))}
               </div>
            </div>
          </section>

          <section className="lg:w-[45%]">
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-zinc-900 text-zinc-900" />
                        ))}
                     </div>
                     <span className="text-[10px] font-black text-zinc-400 ml-2 tracking-widest uppercase">Expertly Curated</span>
                   </div>
                   <button className="text-zinc-200 hover:text-zinc-900 transition-colors">
                      <Heart size={20} strokeWidth={1.5} />
                   </button>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] text-zinc-900">
                  {item.title}
                </h1>
                
                <div className="flex items-center gap-6">
                   <p className="text-5xl font-black text-zinc-900 tracking-tighter">
                     {formattedPrice}
                   </p>
                   <div className="bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-black text-black" />)}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified Seller</span>
                   </div>
                </div>

                <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Archive Integrity</p>
                      <p className="text-lg font-medium leading-relaxed mb-6">Sourced from a verified archive with a <span className="text-yellow-400">5.0 rating</span> and {item.seller_reviews_count || '120'}+ successful transfers.</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400">
                           <ShieldCheck size={14} />
                           Authenticity Guaranteed
                        </div>
                        {item.confidence_score > 90 && (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                             <CheckCircle size={14} />
                             Confidence Score: High
                          </div>
                        )}
                      </div>
                   </div>
                   <Zap size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                </div>

                <div className="flex flex-col gap-3 py-4 border-y border-zinc-50">
                   <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Truck size={14} strokeWidth={2} />
                      <span>Estimated Arrival: <span className="text-zinc-900">{deliveryString}</span></span>
                   </div>
                   <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Globe size={14} strokeWidth={2} />
                      <span>Logistics Scope: <span className="text-zinc-900">{item.shipping_zone === 'GLOBAL' ? 'Global Dispatch' : 'European Union Only'}</span></span>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <StickyBuy productId={item.id} price={formattedPrice} quantity={1} />
                <TrustPulse />
              </div>

              <div className="pt-8 border-t border-zinc-50">
                <Accordion title="Pulse Report" defaultOpen={true}>
                  <p className="mb-6 leading-relaxed">{item.description || "This specific piece was captured by our algorithm due to its exceptional condition and brand provenance. A rare find within the current European archive cluster."}</p>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-zinc-900">
                        <ShieldCheck size={14} className="text-green-500" />
                        Condition: {item.condition}
                     </li>
                     <li className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-zinc-900">
                        <ShieldCheck size={14} className="text-green-500" />
                        Region: Northern Europe ({item.locale?.toUpperCase()})
                     </li>
                  </ul>
                </Accordion>
                
                <Accordion title="Logistics & Guarantee">
                   <p className="text-sm leading-relaxed">Secured via express logistics. As a one-of-one archive piece, all transfers are final once the authentication tag is removed. 30-day protection included against any listing discrepancies.</p>
                </Accordion>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
