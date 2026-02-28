import Link from "next/link";
import Image from "next/image";
import { products } from "@/config/products";
import { ArrowRight, Sparkles, Flame, Zap, Lock, Cpu, Globe, Fingerprint, Hexagon, Layers } from "lucide-react";
import NeuralFeed from "@/components/NeuralFeed";
import TikTokEmbeds from "@/components/TikTokEmbeds";
import StylistFeature from "@/components/StylistFeature";
import { createClient } from "@/lib/supabase-server";
import LimitedIntakes from "@/components/LimitedIntakes";
import { getEstimatedMarketValue } from "@/lib/pricing";
import { NeuralInjections } from "@/components/NeuralInjections";
import StableShowcase from "@/components/StableShowcase";

export const revalidate = 60;

export default async function Home() {
  const supabaseServer = await createClient();
  
  // Check membership status with fresh server context
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
  
  const allowedBrands = [
    "Lacoste", "Adidas", "Supreme", "New Balance", "Dickies", "Louis Vuitton", 
    "Chanel", "Levis", "Hermès", "Ralph Lauren", "Chrome Hearts", "Nike", 
    "CP Company", "Moncler", "A Bathing Ape", "Prada"
  ];

  const [archiveRes, latestItemRes, stableNodesRes] = await Promise.all([
    supabaseServer
      .from('pulse_inventory')
      .select('*')
      .in('status', ['available', 'sold'])
      .in('brand', allowedBrands)
      .gte('listing_price', 200) 
      .order('created_at', { ascending: false })
      .limit(12),
    supabaseServer
      .from('pulse_inventory')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabaseServer
      .from('pulse_inventory')
      .select('*')
      .eq('is_stable', true)
      .order('created_at', { ascending: false })
      .limit(4)
  ]);

  const archiveItems = archiveRes.data;
  const latestItem = latestItemRes.data;
  const stableNodes = stableNodesRes.data;

  const lastSyncTime = latestItem ? new Date(latestItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Real-time';

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <NeuralInjections />
      {/* ARCHIVE CAROUSEL HERO */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none text-black">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="hero-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <header className="flex flex-col items-start mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-8 shadow-sm">
              <Fingerprint size={12} className="text-zinc-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Sync Active</span>
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic mb-12">
              Recent <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Secured.</span>
            </h1>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-8">
              <p className="text-zinc-500 text-xl font-medium max-w-lg leading-tight tracking-tight">
                Monitoring global private archives in real-time. Verified quality. Mathematical precision.
              </p>
              <Link href="/archive" className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] bg-black text-white px-10 py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl">
                Enter Network <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </header>

          <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide -mx-6 px-6 mask-fade-right">
            {archiveItems && archiveItems.length > 0 ? (
              archiveItems.map((item) => {
                const isSold = item.status === 'sold';
                const isVault = item.potential_profit > 200;
                // SOCIETY MEMBER BYPASS BLUR
                const isLocked = isVault && !isMember && !isSold;
                const charSum = item.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                const viewingCount = (charSum % 17) + 1;

                return (
                  <Link 
                    key={item.id} 
                    href={isSold ? "#" : `/archive/${item.id}`} 
                    className={`min-w-[320px] md:min-w-[450px] group ${isSold ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className={`aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-white border border-zinc-100 mb-8 relative transition-all duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group-hover:shadow-[0_30px_60px_rgb(0,0,0,0.06)] group-hover:-translate-y-2 ${isSold ? 'grayscale' : ''} ${isLocked ? 'bg-zinc-950' : ''}`}>
                      <Image 
                        src={item.images[0]} 
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 450px"
                        className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${isLocked ? 'blur-md opacity-90 scale-105' : ''} ${isSold ? 'opacity-40' : ''}`} 
                        alt={`${item.brand} ${item.title}`} 
                      />
                      
                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20">
                          <Lock size={24} className="text-yellow-400 mb-4 animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] leading-relaxed">
                            Society <br /> Decryption Required
                          </span>
                        </div>
                      )}

                      <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
                         <div className="bg-black text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {item.brand}
                         </div>
                         {item.is_stable && (
                           <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 border border-blue-400 animate-in fade-in zoom-in duration-500">
                              <Layers size={10} className="text-white" />
                              Core Allocation
                           </div>
                         )}
                      </div>
                      
                      <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 items-end">
                         <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm">
                            {item.size || 'OS'}
                         </div>
                      </div>

                      {isSold && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="bg-black/80 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 -rotate-12">
                            <span className="text-xs font-black text-white uppercase tracking-[0.4em]">Secured</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter leading-none uppercase italic">{item.title}</h3>
                        <div className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full text-lg font-black italic">
                          €{Math.round(item.listing_price)}
                        </div>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Authenticated Asset</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="w-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Awaiting Pulse Sync...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <StylistFeature />

      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto bg-black rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="absolute top-0 right-0 p-64 bg-yellow-400 blur-[180px] opacity-[0.08] rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                <Zap size={12} fill="black" /> Society Membership
              </div>
              <h2 className="text-5xl md:text-[5.5rem] font-black text-white tracking-[-0.06em] mb-10 leading-[0.85] uppercase italic">
                Bypass the <br /> <span className="text-zinc-600">Standard.</span>
              </h2>
              <p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-md">
                Secure 1-of-1 artifacts at cost. Direct seller links. Neural workstation persistence. Unlocked.
              </p>
           </div>

           <div className="relative z-10 flex flex-col items-center gap-8">
              <Link 
                href="/pricing" 
                className="bg-white text-black px-16 py-8 rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 flex items-center gap-4"
              >
                Authenticate <ArrowRight size={20} />
              </Link>
              <div className="text-center">
                <LimitedIntakes />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Node Capacity Limited</p>
              </div>
           </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-40 text-center">
         <Hexagon size={40} className="mx-auto text-zinc-900 mb-12 animate-in fade-in duration-1000" />
         <h2 className="text-6xl md:text-[8rem] font-black tracking-[-0.06em] mb-12 leading-[0.8] uppercase italic">
           Modern <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-300">Artifacts.</span>
         </h2>
         <p className="text-zinc-500 text-2xl font-medium leading-relaxed max-w-3xl mx-auto tracking-tight mb-16">
           We manage the discovery and acquisition of global archives. Our neural network monitors unlisted grails, ensuring you possess what others simply browse.
         </p>
         <div className="flex flex-wrap justify-center gap-12 text-zinc-300">
            <span className="text-[11px] font-black uppercase tracking-[0.6em]">Global Sourcing Mesh</span>
            <span className="text-[11px] font-black uppercase tracking-[0.6em]">Verified Integrity</span>
            <span className="text-[11px] font-black uppercase tracking-[0.6em]">Neural Latent Space</span>
         </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-zinc-100">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Indexing</h2>
          <Link href="/archive" className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-black pb-1">View Full Mesh</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {["Jackets", "Pants", "Sweaters", "Tops", "Headwear", "Accessories"].map((cat) => (
            <Link 
              key={cat} 
              href={`/archive?category=${cat}`}
              className="bg-white border border-zinc-100 p-10 rounded-[3rem] text-center hover:border-black transition-all group shadow-sm hover:shadow-xl duration-500"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.3em] group-hover:italic transition-all">{cat}</p>
            </Link>
          ))}
        </div>
      </section>
      
      <StableShowcase items={stableNodes || []} isMember={isMember} />

      <section className="max-w-7xl mx-auto px-6 pb-40">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 mb-6">
             <div className="w-8 h-[1px] bg-zinc-200"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400">Node Connections</p>
             <div className="w-8 h-[1px] bg-zinc-200"></div>
          </div>
          <h2 className="text-5xl md:text-[7xl] font-black tracking-tighter text-zinc-900 leading-none uppercase">
            Global Intel.
          </h2>
        </div>
        <TikTokEmbeds />
      </section>
    </div>
  );
}
