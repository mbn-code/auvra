import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap, Mail, Crown, Package, LogOut, ArrowRight, Layers, Cpu, Fingerprint, Lock, Sparkles } from "lucide-react";

/**
 * AUVRA ACCOUNT TERMINAL v1.0
 * Premium user dashboard for membership management and lookbook archive.
 */
export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Profile & Membership
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch User Outfits
  const { data: outfits } = await supabase
    .from('user_outfits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const isSociety = profile?.membership_tier === 'society';

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6 overflow-hidden relative">
      {/* Background Architectural Mesh */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none text-black">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="account-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#account-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER: IDENTITY */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-6 shadow-sm">
              <Fingerprint size={12} className="text-zinc-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Verified Society Node</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic">
              Profile <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Terminal.</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-4">
             <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{user.email}</p>
             <form action="/api/auth/logout" method="POST">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">
                   <LogOut size={14} /> De-Authenticate Node
                </button>
             </form>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: MEMBERSHIP CARD */}
          <div className="lg:col-span-4 space-y-8">
            <div className={`relative p-10 rounded-[3rem] overflow-hidden border transition-all duration-700 ${isSociety ? 'bg-zinc-950 text-white border-zinc-800 shadow-2xl' : 'bg-white text-black border-zinc-100 shadow-lg'}`}>
              {isSociety && (
                <div className="absolute top-0 right-0 p-32 bg-yellow-400 blur-[100px] opacity-10 rounded-full pointer-events-none"></div>
              )}
              
              <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-8 ${isSociety ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-zinc-100 text-zinc-500'}`}>
                  {isSociety ? <Zap size={10} fill="black" /> : <Lock size={10} />}
                  {isSociety ? 'Society Elite' : 'Guest Access'}
                </div>
                
                <h3 className="text-3xl font-black tracking-tight uppercase italic mb-2">
                  {isSociety ? 'The Inner Circle' : 'Standard Node'}
                </h3>
                <p className={`text-sm font-medium mb-10 ${isSociety ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {isSociety ? 'Neural Workstation Unlocked. Sourcing mesh priority active.' : 'Basic archive discovery. Upgrade to unlock manifestation workstation.'}
                </p>

                <div className="space-y-4 mb-10 text-[11px] font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className={isSociety ? 'text-yellow-400' : 'text-zinc-200'} />
                      <span>Archive Persistence: {isSociety ? 'Active' : 'Locked'}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Mail size={16} className={isSociety ? 'text-yellow-400' : 'text-zinc-200'} />
                      <span>DNA Briefs: {isSociety ? 'Unlimited' : 'None'}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Package size={16} className={isSociety ? 'text-yellow-400' : 'text-zinc-200'} />
                      <span>Member Pricing: {isSociety ? '10% OFF' : 'Standard'}</span>
                   </div>
                </div>

                {!isSociety && (
                  <Link 
                    href="/pricing" 
                    className="w-full py-5 rounded-full bg-black text-white text-center font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    Upgrade Tier <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Navigation Nodes</h4>
               <Link href="/stylist" className="flex items-center justify-between group p-2">
                  <span className="text-sm font-bold group-hover:italic transition-all">Manifest Lookbook</span>
                  <Cpu size={16} className="text-zinc-300 group-hover:text-black" />
               </Link>
               <Link href="/archive" className="flex items-center justify-between group p-2">
                  <span className="text-sm font-bold group-hover:italic transition-all">Enter Archive Mesh</span>
                  <Layers size={16} className="text-zinc-300 group-hover:text-black" />
               </Link>
            </div>
          </div>

          {/* RIGHT: OUTFIT ARCHIVE */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-12 border-b border-zinc-100 pb-6">
               <h3 className="text-xl font-black uppercase tracking-tighter">Your Manifestations</h3>
               <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{outfits?.length || 0} Lookbooks Stored</span>
            </div>

            {!outfits || outfits.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[3.5rem] border border-dashed border-zinc-200 group">
                 <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="text-zinc-200" size={24} />
                 </div>
                 <p className="text-zinc-400 font-black text-sm uppercase tracking-widest mb-8 italic">"No neural DNA patterns stored."</p>
                 <Link href="/stylist" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b-2 border-black pb-1 hover:opacity-50">
                    Initialize First Curation <ArrowRight size={12} />
                 </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <h4 className="text-lg font-black tracking-tight uppercase mb-1">{outfit.name || 'Neural Pattern'}</h4>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{new Date(outfit.created_at).toLocaleDateString()}</p>
                       </div>
                       <Link href={`/stylist?outfit=${outfit.id}`} className="p-3 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all">
                          <ArrowRight size={16} />
                       </Link>
                    </div>
                    {/* Tiny preview thumbnails would go here */}
                    <div className="flex -space-x-4">
                       {Object.entries(outfit.slots).filter(([_, val]) => val !== null).slice(0, 4).map(([slot, id]) => (
                          <div key={slot} className="w-16 h-16 rounded-full border-2 border-white bg-zinc-100 overflow-hidden shadow-sm">
                             {/* Note: In a real app we'd fetch the product image here */}
                             <div className="w-full h-full flex items-center justify-center">
                                <Cpu size={12} className="text-zinc-300" />
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
