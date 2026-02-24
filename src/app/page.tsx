import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { products } from "@/config/products";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Sparkles, Flame, Zap, Lock } from "lucide-react";
import NeuralFeed from "@/components/NeuralFeed";
import { createClient } from "@/lib/supabase-server";
import LimitedIntakes from "@/components/LimitedIntakes";

export default async function Home() {
  const staticProducts = Object.values(products);
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
  
  // Fetch high-margin available + recently sold clothing for the homepage (Only premium items)
  const { data: archiveItems } = await supabase
    .from('pulse_inventory')
    .select('*')
    .in('status', ['available', 'sold'])
    .gte('listing_price', 100) // Ensure only premium items > €100 show on homepage
    .order('created_at', { ascending: false })
    .limit(12);

  // Fetch last sync time
  const { data: latestItem } = await supabase
    .from('pulse_inventory')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const lastSyncTime = latestItem ? new Date(latestItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Real-time';

  return (
    <div className="min-h-screen bg-white">
      {/* 1. ARCHIVE CAROUSEL HERO */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full z-0 opacity-[0.05] pointer-events-none">
           <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 flex items-center gap-2">
                <Zap size={12} className="fill-zinc-900 text-zinc-900" />
                Live Archive Pulse • Last Sync: {lastSyncTime}
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.9]">
                Recent <br />Secured Drops.
              </h1>
            </div>
            <Link href="/archive" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1">
              View Entire Archive <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide -mx-6 px-6 mask-fade-right">
            {archiveItems && archiveItems.length > 0 ? (
              archiveItems.map((item) => {
                const isSold = item.status === 'sold';
                const isVault = item.potential_profit > 200;
                const isLocked = isVault && !isMember && !isSold;
                
                // Deterministic pseudo-random viewing count between 1 and 17 based on ID
                const charSum = item.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                const viewingCount = (charSum % 17) + 1;

                return (
                  <Link 
                    key={item.id} 
                    href={isSold ? "#" : `/archive/${item.id}`} 
                    className={`min-w-[300px] md:min-w-[400px] group ${isSold ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className={`aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-50 border border-zinc-100 mb-6 relative transition-all duration-700 ${isSold ? 'grayscale' : ''} ${isLocked ? 'bg-zinc-950' : ''}`}>
                      <img 
                        src={item.images[0]} 
                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${isLocked ? 'blur-md opacity-90 scale-105' : ''} ${isSold ? 'opacity-40' : ''} ${!isSold && !isLocked && item.images.length > 1 ? 'group-hover:opacity-0' : ''}`} 
                        alt={`${item.brand} ${item.title} - Auvra Archive Selection`} 
                      />
                      
                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                          <Lock size={24} className="text-yellow-400 mb-4 animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] leading-relaxed">
                            Society <br /> Decryption Required
                          </span>
                        </div>
                      )}

                      {!isSold && !isLocked && item.images.length > 1 && (
                        <img 
                          src={item.images[1]} 
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100" 
                          alt={`${item.brand} ${item.title} - View 2`} 
                        />
                      )}
                      <div className="absolute top-6 left-6">
                         <div className="bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                            {item.brand}
                         </div>
                      </div>
                      
                      {isSold && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/80 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 -rotate-12">
                            <span className="text-xs font-black text-white uppercase tracking-[0.4em]">Secured</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                         <div className={`bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm ${isSold ? 'opacity-50' : ''}`}>
                            Size: {item.size || 'OS'}
                         </div>
                         {!isSold && (
                           <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm">
                              Best Seller
                           </div>
                         )}
                      </div>
                      {!isSold && item.potential_profit > 60 && (
                        <div className="absolute bottom-6 left-6 flex flex-col gap-2 items-start">
                           {item.potential_profit > 150 && (
                             <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse flex items-center gap-2">
                               <Flame size={10} className="fill-white" /> {viewingCount} other nodes currently inspecting this asset
                             </div>
                           )}
                           <div className="bg-yellow-400 text-black px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                             Rare Find
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-end px-2">
                      <h3 className={`text-xl font-black text-zinc-900 tracking-tighter leading-tight pb-1 ${isSold ? 'opacity-40' : ''}`}>{item.title}</h3>
                      <div className={`flex flex-col items-end shrink-0 ${isSold ? 'opacity-20' : ''}`}>
                        <span className="text-[10px] font-bold text-zinc-400 line-through decoration-red-500 mb-1">€{Math.ceil((item.listing_price * 1.5) / 10) * 10}</span>
                        <div className="bg-zinc-900 text-white px-4 py-2 rounded-full text-lg font-black shadow-lg">
                          €{Math.round(item.listing_price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="w-full py-24 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Awaiting Pulse Sync...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 1.5. SOCIETY MEMBERSHIP CTA */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto bg-zinc-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="absolute top-0 right-0 p-64 bg-yellow-400 blur-[150px] opacity-10 rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap size={12} className="fill-black" />
                Auvra Society
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.95]">
                Unlock the Inner Archive <br /> <span className="text-zinc-500">So You Can</span> Secure Grails At Cost.
              </h2>
              <p className="text-zinc-400 text-lg font-medium max-w-lg leading-relaxed">
                Stop paying retail markups. Members gain exclusive access to direct source links for steals, priority acquisition on high-heat drops, and up to 15% off concierge pricing.
              </p>
           </div>

           <div className="relative z-10 flex-shrink-0 text-center">
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-900/20"
              >
                Join Society <ArrowRight size={16} />
              </Link>
              <div className="mt-6 space-y-1">
                <LimitedIntakes />
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  Batch 01/2026 Intake
                </p>
              </div>
           </div>
        </div>
      </section>

      {/* 2. ATMOSPHERIC GRID (Mood Board - Commercial Safe) */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
           <div className="md:col-span-4 rounded-[3rem] overflow-hidden relative group border border-zinc-100">
              <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-8 left-8 text-white">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em]">Curation 01</p>
                 <h4 className="text-xl font-black tracking-tight uppercase">High House Heritage.</h4>
              </div>
           </div>
           <div className="md:col-span-8 grid grid-cols-2 gap-6">
              <div className="rounded-[3rem] overflow-hidden relative group border border-zinc-100">
                 <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" alt="" />
                 <div className="absolute inset-0 bg-black/40" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] opacity-0 group-hover:opacity-100 transition-opacity">Archive Pulse</p>
                 </div>
              </div>
              <div className="rounded-[3rem] overflow-hidden relative group border border-zinc-100">
                 <img src="https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" alt="" />
                 <div className="absolute inset-0 bg-black/30" />
              </div>
           </div>
        </div>
      </section>

      {/* 3. THE PHILOSOPHY (Atmospheric) */}
      <section className="relative py-40 mx-6 overflow-hidden rounded-[5rem]">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.3]" alt="" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 text-white">
           <Sparkles size={32} className="mx-auto text-yellow-400 mb-8" />
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Archive Sourcing <br /> Reimagined.</h2>
           <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
             Auvra is a premium sourcing concierge. Our neural engine monitors global private collections in real-time, securing 1-of-1 archive pieces for our clients. We don't just sell clothing; we manage the discovery and acquisition of modern artifacts.
           </p>
           <div className="flex justify-center gap-12 opacity-50">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Concierge</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Search Network</span>
           </div>
        </div>
      </section>

      {/* 3.5. BROWSE BY CATEGORY (SEO & Navigation) */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Browse Categories</h2>
          <Link href="/archive" className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Archive Pulse</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {["Jackets", "Pants", "Sweaters", "Tops", "Headwear", "Accessories"].map((cat) => (
            <Link 
              key={cat} 
              href={`/archive?category=${cat}`}
              className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] text-center hover:bg-black hover:text-white transition-all group"
            >
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">{cat}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. THE PULSE LOGIC */}
      <section className="max-w-7xl mx-auto px-6 py-32">
         <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">The Acquisition Engine</p>
               <h2 className="text-5xl font-black tracking-tighter text-zinc-900 leading-[0.95]">Discover. <br />Authenticate. <br />Acquire.</h2>
               <p className="text-zinc-500 font-medium text-lg max-w-sm">When you secure a piece, our concierge network immediately initiates the acquisition and verification process from its current global location.</p>
               <Link href="/archive" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:opacity-50 transition-opacity">
                  View Private Archives <ArrowRight size={14} />
               </Link>
            </div>
            <div className="flex-1 w-full">
               <NeuralFeed />
            </div>
         </div>
      </section>

      {/* 5. COMMUNITY / SOCIAL PROOF */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">
            Community Intel
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">
            Connected to the Culture.
          </h2>
        </div>
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6">
          <blockquote className="tiktok-embed rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm" cite="https://www.tiktok.com/@.auvra/video/7610089089915718934" data-video-id="7610089089915718934" style={{ width: "100%", maxWidth: "325px" }} >
            <section> 
              <a target="_blank" title="@.auvra" href="https://www.tiktok.com/@.auvra?refer=embed" rel="noreferrer">@.auvra</a> always best on Auvra <a title="fashion" target="_blank" href="https://www.tiktok.com/tag/fashion?refer=embed" rel="noreferrer">#fashion</a> <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed" rel="noreferrer">#fyp</a> <a title="ootd" target="_blank" href="https://www.tiktok.com/tag/ootd?refer=embed" rel="noreferrer">#ootd</a> <a title="fashiontiktok" target="_blank" href="https://www.tiktok.com/tag/fashiontiktok?refer=embed" rel="noreferrer">#fashiontiktok</a> <a title="streetwear" target="_blank" href="https://www.tiktok.com/tag/streetwear?refer=embed" rel="noreferrer">#streetwear</a> <a target="_blank" title="♬ original sound - Auvra" href="https://www.tiktok.com/music/original-sound-7610089075831950102?refer=embed" rel="noreferrer">♬ original sound - Auvra</a> 
            </section> 
          </blockquote>
          <blockquote className="tiktok-embed rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm" cite="https://www.tiktok.com/@.auvra/video/7610173889662029078" data-video-id="7610173889662029078" style={{ width: "100%", maxWidth: "325px" }} > 
            <section> 
              <a target="_blank" title="@.auvra" href="https://www.tiktok.com/@.auvra?refer=embed" rel="noreferrer">@.auvra</a> LINK IN BIO new drops every hour <a title="fashion" target="_blank" href="https://www.tiktok.com/tag/fashion?refer=embed" rel="noreferrer">#fashion</a> <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed" rel="noreferrer">#fyp</a> <a title="ootd" target="_blank" href="https://www.tiktok.com/tag/ootd?refer=embed" rel="noreferrer">#ootd</a> <a title="fashiontiktok" target="_blank" href="https://www.tiktok.com/tag/fashiontiktok?refer=embed" rel="noreferrer">#fashiontiktok</a> <a title="streetwear" target="_blank" href="https://www.tiktok.com/tag/streetwear?refer=embed" rel="noreferrer">#streetwear</a> <a target="_blank" title="♬ original sound - Auvra" href="https://www.tiktok.com/music/original-sound-7610173899687938838?refer=embed" rel="noreferrer">♬ original sound - Auvra</a> 
            </section> 
          </blockquote>
          <blockquote className="tiktok-embed rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm" cite="https://www.tiktok.com/@.auvra/video/7609838351478181142" data-video-id="7609838351478181142" style={{ width: "100%", maxWidth: "325px" }} > 
            <section> 
              <a target="_blank" title="@.auvra" href="https://www.tiktok.com/@.auvra?refer=embed" rel="noreferrer">@.auvra</a> save 💵 when shopping CLICK LINK IN BIO <a title="fashion" target="_blank" href="https://www.tiktok.com/tag/fashion?refer=embed" rel="noreferrer">#fashion</a> <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed" rel="noreferrer">#fyp</a> <a title="ootd" target="_blank" href="https://www.tiktok.com/tag/ootd?refer=embed" rel="noreferrer">#ootd</a> <a title="fashiontiktok" target="_blank" href="https://www.tiktok.com/tag/fashiontiktok?refer=embed" rel="noreferrer">#fashiontiktok</a> <a title="streetwear" target="_blank" href="https://www.tiktok.com/tag/streetwear?refer=embed" rel="noreferrer">#streetwear</a> <a target="_blank" title="♬ original sound - Auvra" href="https://www.tiktok.com/music/original-sound-7609838383141112598?refer=embed" rel="noreferrer">♬ original sound - Auvra</a> 
            </section> 
          </blockquote>
        </div>
        <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      </section>

    </div>
  );
}
