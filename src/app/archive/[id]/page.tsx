import { notFound } from "next/navigation";
import Link from "next/link";
import Accordion from "@/components/Accordion";
// LiveActivity removed — was displaying fabricated user activity. See components/LiveActivity.tsx.
import StickyBuy from "@/components/StickyBuy";
import TrustPulse from "@/components/TrustPulse";
import NeuralDecrypt from "@/components/NeuralDecrypt";
import { Star, ShieldCheck, Zap, Lock, ExternalLink, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";
import { VaultButton } from "@/components/VaultButton";
import { NeuralEchoes } from "@/components/NeuralEchoes";

interface ArchiveProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArchiveProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabaseServer = await createClient();
  const { data: item } = await supabaseServer
    .from('pulse_inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (!item) return { title: "Archive Piece Not Found" };

  return {
    title: `${item.title} | ${item.brand} Archive`,
    description: `Unlock the source link for this unique ${item.brand} ${item.category} from the Auvra Archive. Discovered by our neural network in ${item.condition} condition.`,
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

export const revalidate = 60;

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

  // viewingCount removed — was a deterministic hash of the product ID presented
  // as a live "X people viewing" count. This is fabricated social proof, prohibited
  // under EU Omnibus Directive 2019/2161.

  const listingPrice = item.listing_price;
  const curationFee = Math.max(Math.floor(listingPrice * 0.05), 5);
  
  const formattedCurationFee = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(curationFee);
  const formattedListingPrice = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(listingPrice);

  // For sticky buy, stable items cost full price, archive items cost the curation fee
  const displayPrice = item.is_stable 
    ? formattedListingPrice 
    : (isMember ? "Included" : formattedCurationFee);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* LiveActivity removed — was displaying fabricated user notifications */}
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-12">
          <Link href="/archive" className="hover:text-black">Archive</Link>
          <span className="opacity-30">/</span>
          <Link href={`/archive/brand/${encodeURIComponent(item.brand)}`} className="hover:text-black">{item.brand}</Link>
          <span className="opacity-30">/</span>
          <span className="text-zinc-900 truncate max-w-[150px]">{item.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 xl:gap-32">
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
                       {item.is_stable && (
                         <div className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm border border-blue-400">
                            <Layers size={10} className="text-white" />
                            Core Allocation Node
                         </div>
                       )}
                    </div>
                  )}
               </div>
               
               <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible">
                  {item.images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 relative snap-center w-[85vw] md:w-full shrink-0">
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
                
                <div className="flex items-center justify-between gap-6">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-zinc-900 uppercase italic flex-1">
                    {item.title}
                  </h1>
                  <VaultButton productId={item.id} className="scale-125" />
                </div>
                
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                      <ShieldCheck size={14} />
                      High Confidence Score • 1-of-1 Piece
                   </div>
                 </div>

                <div className="flex flex-wrap items-center gap-3">
                   <div className="bg-zinc-900 text-white px-6 py-3 rounded-full border border-zinc-800 flex items-center gap-3 shadow-xl">
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Size</span>
                      <span className="text-xl font-black uppercase tracking-tighter">{item.size || 'OS'}</span>
                   </div>
                </div>
                
                {item.is_stable ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-4xl font-black tracking-tighter">{formattedListingPrice}</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Physical Product Allocation</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 text-zinc-500 p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                      <Lock size={14} className="mt-0.5 shrink-0 opacity-40" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-zinc-700">Digital Access Link:</strong> You are paying a curation fee to unlock the direct source link. You are not buying the physical item from Auvra. The images depict the physical product you will be able to purchase yourself at the source.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                       <div className="flex-1 flex flex-col p-4 rounded-3xl border border-zinc-100 bg-white shadow-sm">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                            <ExternalLink size={10} /> Item Source Price
                          </span>
                          <span className="text-2xl font-black tracking-tighter text-zinc-900">
                             {formattedListingPrice}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400 mt-1">Paid later to the seller</span>
                       </div>

                       <div className="flex-1 flex flex-col p-4 rounded-3xl border border-zinc-100 bg-white shadow-sm relative overflow-hidden">
                          {isMember && <div className="absolute inset-0 bg-yellow-50/50" />}
                          <div className="relative z-10">
                            <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Auvra Curation Fee</span>
                            <div className="flex items-baseline gap-2">
                              <span className={`text-2xl font-black tracking-tighter ${isMember ? 'text-zinc-500 line-through decoration-zinc-900/20' : 'text-zinc-900'}`}>
                                 {formattedCurationFee}
                              </span>
                              {isMember && <span className="text-sm font-black text-yellow-600 uppercase">Included</span>}
                            </div>
                            <span className="text-[10px] font-medium text-zinc-400 mt-1">Current unlock fee</span>
                          </div>
                       </div>
                    </div>
                    
                    {!isMember && (
                      <div className="flex justify-center mt-2">
                         <Link href="/pricing" className="px-6 py-3 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-yellow-500 transition-colors flex items-center gap-2">
                            <Zap size={12} className="fill-black" />
                            Join Society to Unlock Links for Free
                         </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Archive Integrity</p>
                      <p className="text-lg font-medium leading-relaxed mb-6">Discovered by our neural network with high confidence scoring for brand provenance.</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400">
                         <ShieldCheck size={14} />
                         Algorithmic Verification
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <StickyBuy 
                  productId={item.id} 
                  price={displayPrice} 
                  quantity={1} 
                  isStable={item.is_stable}
                  stockLevel={item.stock_level}
                  preOrderStatus={item.pre_order_status}
                  isMember={isMember}
                  sourceUrl={item.source_url}
                />
                <TrustPulse />
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <Accordion title="Pulse Report" defaultOpen={true}>
                  <p className="mb-6 leading-relaxed text-zinc-500">{item.description || "Captured by our algorithm for brand provenance and condition."}</p>
                </Accordion>
                <Accordion title="Curation Protocol">
                  <p className="leading-relaxed text-zinc-500">
                    Auvra uses advanced neural algorithms to discover rare, unlisted archive pieces across the global secondary market. By paying the curation fee, you instantly unlock the direct source link to purchase the item yourself. We recommend securing the physical piece immediately after unlocking, as these are unique 1-of-1 items.
                  </p>
                </Accordion>
              </div>

              <NeuralEchoes productId={item.id} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
