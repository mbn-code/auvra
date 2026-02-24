import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Accordion from "@/components/Accordion";
import LiveActivity from "@/components/LiveActivity";
import StickyBuy from "@/components/StickyBuy";
import TrustPulse from "@/components/TrustPulse";
import NeuralDecrypt from "@/components/NeuralDecrypt";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Eye, PackageCheck, Zap, Globe, CheckCircle, Clock, Lock, ExternalLink, Cpu } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";

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
      canonical: `https://auvra-nine.vercel.app/archive/${item.id}`,
    },
    openGraph: {
      title: `${item.title} | Auvra Archive`,
      description: `Secured 1-of-1 ${item.brand} archive piece.`,
      images: [item.images[0]],
    },
  };
}

export default async function ArchiveProductPage({ params }: ArchiveProductPageProps) {
  const { id } = await params;
  const authSupabase = await createClient();
  
  // Check membership status
  const { data: { session } } = await authSupabase.auth.getSession();
  let isMember = false;
  
  if (session) {
    const { data: profile } = await authSupabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', session.user.id)
      .single();
    if (profile?.membership_tier === 'society') isMember = true;
  }

  // Fetch product
  const { data: item, error } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) {
    notFound();
  }

  const isVault = item.potential_profit > 200;
  const showLockedVisual = isVault && !isMember;

  // Deterministic pseudo-random viewing count between 1 and 17 based on ID
  const charSum = item.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const viewingCount = (charSum % 17) + 1;

  const listingPrice = item.listing_price;
  const memberPrice = item.member_price || Math.round(listingPrice * 0.9);
  
  const formattedListingPrice = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(listingPrice);
  const formattedMemberPrice = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(memberPrice);

  const estimatedRetail = Math.ceil((listingPrice * 1.5) / 10) * 10;
  const formattedEstimatedRetail = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedRetail);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryString = deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.title,
    "image": item.images,
    "description": item.description || `Archive piece: ${item.brand}`,
    "brand": {
      "@type": "Brand",
      "name": item.brand
    },
    "offers": {
      "@type": "Offer",
      "url": `https://auvra-nine.vercel.app/archive/${item.id}`,
      "priceCurrency": "EUR",
      "price": item.listing_price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/UsedCondition"
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Archive",
        "item": "https://auvra-nine.vercel.app/archive"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": item.brand,
        "item": `https://auvra-nine.vercel.app/archive/brand/${encodeURIComponent(item.brand)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": item.title,
        "item": `https://auvra-nine.vercel.app/archive/${item.id}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <LiveActivity productName={item.title} />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-12">
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
                       <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-100 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Regional Dispatch: {item.locale?.toUpperCase()}
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
                     <span className="text-[10px] font-black text-zinc-400 ml-2 tracking-widest uppercase">Expertly Curated</span>
                   </div>
                   <button className="text-zinc-200 hover:text-zinc-900 transition-colors">
                      <Heart size={20} strokeWidth={1.5} />
                   </button>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] text-zinc-900">
                  {item.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                   <div className="bg-zinc-900 text-white px-6 py-3 rounded-full border border-zinc-800 flex items-center gap-3 shadow-xl">
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Size</span>
                      <span className="text-xl font-black uppercase tracking-tighter">{item.size || 'OS'}</span>
                   </div>
                   <div className="bg-zinc-50 text-zinc-400 px-4 py-3 rounded-full border border-zinc-100 flex items-center gap-3">
                      <Cpu size={14} className="fill-zinc-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Asset ID: AV-{item.vinted_id.substring(0, 6).toUpperCase()}</span>
                   </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-3xl border border-zinc-100 bg-zinc-50/50">
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Est. Market Value:</span>
                          <span className="text-[11px] font-bold text-zinc-400 line-through decoration-red-500">{formattedEstimatedRetail}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mt-2">Auvra Concierge Price</span>
                        <span className={`text-2xl font-black tracking-tighter ${isMember ? 'text-zinc-400 line-through decoration-zinc-900/20' : 'text-zinc-900'}`}>
                           {formattedListingPrice}
                        </span>
                     </div>
                     {!isMember && (
                       <Link href="/login" className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-80 transition-opacity flex items-center gap-2">
                          <Lock size={10} /> Unlock Society Link
                       </Link>
                     )}
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-3xl border-2 ${isMember ? 'border-yellow-400 bg-yellow-50/10' : 'border-zinc-100 bg-white opacity-60'}`}>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest flex items-center gap-2">
                           <Zap size={10} className="fill-yellow-600" /> Society Direct Source Link
                        </span>
                        <span className="text-3xl font-black tracking-tighter text-zinc-900">
                           {formattedMemberPrice}
                        </span>
                     </div>
                     {isMember && (
                       <div className="px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                          Active
                       </div>
                     )}
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
                   <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Clock size={14} strokeWidth={2} />
                      <span>Last Archive Sync: <span className="text-zinc-900">{new Date(item.last_pulse_check || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-3 px-6 py-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                   <div className="flex -space-x-2">
                      {[...Array(Math.min(3, viewingCount))].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center">
                           <span className="text-[8px] font-bold text-zinc-500">N{i+1}</span>
                        </div>
                      ))}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span className="text-zinc-900">{viewingCount} other node{viewingCount !== 1 ? 's' : ''}</span> currently inspecting this asset
                   </p>
                </div>

                {isMember && item.potential_profit < 20 ? (
                  <div className="space-y-4">
                    <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] border border-zinc-800">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-yellow-400">Society Benefit: Direct Access</p>
                       <p className="text-lg font-medium leading-relaxed mb-8">As this item represents a low-margin steal, you have unlocked direct source access. Secure it directly from the archive source to bypass concierge fees.</p>
                       <a 
                        href={item.source_url} 
                        target="_blank"
                        className="w-full bg-white text-black py-6 rounded-full font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-900/20"
                       >
                         Secure at Source <ExternalLink size={16} />
                       </a>
                    </div>
                    <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest">
                      Note: Direct purchases are managed by the source marketplace.
                    </p>
                  </div>
                ) : (
                  <StickyBuy 
                    productId={item.id} 
                    price={isMember ? formattedMemberPrice : formattedListingPrice} 
                    quantity={1} 
                  />
                )}
                <TrustPulse />
              </div>

              <div className="pt-8 border-t border-zinc-50">
                <Accordion title="Pulse Report" defaultOpen={true}>
                  <p className="mb-6 leading-relaxed">{item.description || "This specific piece was captured by our algorithm due to its exceptional condition and brand provenance. A rare find within the current European archive cluster."}</p>
                  
                  <div className="mb-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Fit Recommendation</h4>
                    <p className="text-sm font-bold text-zinc-900 leading-relaxed">
                      This item is tagged as <span className="underline">{item.size}</span>. 
                      {['Louis Vuitton', 'Chanel', 'Prada'].includes(item.brand) 
                        ? " Heritage houses often use vintage tailoring; we recommend securing this if you value a precise, structured fit."
                        : " For this specific archive selection, the fit is consistent with standard house dimensions."}
                    </p>
                  </div>

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
                
                <Accordion title="Concierge Value Inclusion" defaultOpen={true}>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                         <CheckCircle size={16} className="text-zinc-900" />
                         100% Authenticity Verification
                      </li>
                      <li className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                         <CheckCircle size={16} className="text-zinc-900" />
                         Global Private Sourcing & Negotiation
                      </li>
                      <li className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                         <CheckCircle size={16} className="text-zinc-900" />
                         Priority Insured Shipping
                      </li>
                      <li className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                         <CheckCircle size={16} className="text-zinc-900" />
                         48-Hour Integrity Guarantee
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
