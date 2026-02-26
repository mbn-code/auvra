import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Accordion from "@/components/Accordion";
import LiveActivity from "@/components/LiveActivity";
import StickyBuy from "@/components/StickyBuy";
import TrustPulse from "@/components/TrustPulse";
import NeuralDecrypt from "@/components/NeuralDecrypt";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Eye, PackageCheck, Zap, Globe, CheckCircle, Clock, Lock, ExternalLink, Cpu } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";
import { getEstimatedMarketValue } from "@/lib/pricing";

interface ArchiveProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArchiveProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: item } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (!item) return { title: "Archive Piece Not Found" };

  return {
    title: `${item.title} | ${item.brand} Archive`,
    description: `Secure this unique ${item.brand} ${item.category} from the Auvra Archive. Sourced and verified quality archive piece in ${item.condition} condition.`,
    alternates: {
      canonical: `https://auvra.eu/archive/${item.id}`,
    },
    openGraph: {
      title: `${item.title} | Auvra Archive`,
      description: `Secured 1-of-1 ${item.brand} archive piece.`,
      images: [item.images[0]],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function ArchiveProductPage({ params }: ArchiveProductPageProps) {
  const { id } = await params;
  const supabaseServer = await createClient();
  
  // Check membership status with fresh server session
  const { data: { user } } = await supabaseServer.auth.getUser();
  let isMember = false;
  
  if (user) {
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single();
    if (profile?.membership_tier === 'society') isMember = true;
  }

  // Fetch product using the server client for consistency
  const { data: item, error } = await supabaseServer
    .from('pulse_inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) {
    notFound();
  }

  const isVault = item.potential_profit > 200;
  // If user is member, we NEVER show locked visual
  const showLockedVisual = isVault && !isMember;

  const charSum = item.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const viewingCount = (charSum % 17) + 1;

  const listingPrice = item.listing_price;
  const memberPrice = item.member_price || Math.round(listingPrice * 0.9);
  
  const formattedListingPrice = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(listingPrice);
  const formattedMemberPrice = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(memberPrice);

  const estimatedRetail = getEstimatedMarketValue(listingPrice, item.brand, item.category);
  const formattedEstimatedRetail = estimatedRetail 
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedRetail)
    : null;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryString = deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <LiveActivity productName={item.title} />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-12">
          <Link href="/archive" className="hover:text-black">Archive</Link>
          <span className="opacity-30">/</span>
          <Link href={`/archive/brand/${encodeURIComponent(item.brand)}`} className="hover:text-black">{item.brand}</Link>
          <span className="opacity-30">/</span>
          <span className="text-zinc-900 truncate max-w-[150px]">{item.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-20 xl:gap-32">
          <section className="lg:w-[55%] space-y-6">
            <div className="sticky top-32 space-y-6">
               <div className="rounded-[3.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 relative group transition-all duration-1000 aspect-[4/5]">
                  <NeuralDecrypt 
                    imageUrl={item.images[0]} 
                    isLocked={showLockedVisual} 
                  />
                  {!showLockedVisual && (
                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                       <div className="bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
                          <Zap size={10} className="text-yellow-400" />
                          Auvra Pulse Selection
                       </div>
                    </div>
                  )}
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  {item.images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 relative">
                      <NeuralDecrypt 
                        imageUrl={img} 
                        isLocked={showLockedVisual} 
                      />
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
                     <span className="text-[10px] font-black text-zinc-500 ml-2 tracking-widest uppercase">Expertly Curated</span>
                   </div>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] text-zinc-900 uppercase italic">
                  {item.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                   <div className="bg-zinc-900 text-white px-6 py-3 rounded-full border border-zinc-800 flex items-center gap-3 shadow-xl">
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Size</span>
                      <span className="text-xl font-black uppercase tracking-tighter">{item.size || 'OS'}</span>
                   </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-3xl border border-zinc-100 bg-white shadow-sm">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Concierge Price</span>
                        <span className={`text-2xl font-black tracking-tighter ${isMember ? 'text-zinc-500 line-through decoration-zinc-900/20' : 'text-zinc-900'}`}>
                           {formattedListingPrice}
                        </span>
                     </div>
                     {!isMember && (
                       <Link href="/pricing" className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-80 transition-opacity">
                          Unlock Society Price
                       </Link>
                     )}
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-3xl border-2 ${isMember ? 'border-yellow-400 bg-yellow-50/10' : 'border-zinc-100 bg-white opacity-60'}`}>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest flex items-center gap-2">
                           <Zap size={10} className="fill-yellow-600" /> Society Direct Source
                        </span>
                        <span className="text-3xl font-black tracking-tighter text-zinc-900">
                           {formattedMemberPrice}
                        </span>
                     </div>
                  </div>
                </div>

                <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Archive Integrity</p>
                      <p className="text-lg font-medium leading-relaxed mb-6">Sourced from a verified archive with high confidence scoring.</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400">
                         <ShieldCheck size={14} />
                         Authenticity Guaranteed
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <StickyBuy 
                  productId={item.id} 
                  price={isMember ? formattedMemberPrice : formattedListingPrice} 
                  quantity={1} 
                />
                <TrustPulse />
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <Accordion title="Pulse Report" defaultOpen={true}>
                  <p className="mb-6 leading-relaxed text-zinc-500">{item.description || "Captured by our algorithm for brand provenance and condition."}</p>
                </Accordion>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
