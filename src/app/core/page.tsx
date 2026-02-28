import { createClient } from "@/lib/supabase-server";
import StableShowcase from "@/components/StableShowcase";
import { Metadata } from "next";
import { Fingerprint, Cpu, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Core Hardware | Auvra Stable Nodes",
  description: "High-fidelity, permanent artifacts engineered for the Auvra network. Non-secondhand, verified hardware.",
};

export const dynamic = 'force-dynamic';

export default async function CorePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  let isMember = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single();
    if (profile?.membership_tier === 'society') isMember = true;
  }

  const { data: items } = await supabase
    .from("pulse_inventory")
    .select("*")
    .eq("is_stable", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <header className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white mb-8 shadow-sm">
            <Cpu size={12} className="text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">System Hardware</span>
          </div>
          
          <h1 className="text-7xl md:text-[9rem] font-black tracking-[-0.06em] text-zinc-900 leading-[0.8] uppercase italic mb-12">
            Core <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-400">Inventory.</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full mt-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <Globe size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Allocation</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Stable nodes are engineered for consistency. Unlike the archive, these pieces are always available for physical manifestation.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <Fingerprint size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Neural Verification</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Every core piece undergoes 1:1 silhouette alignment. We only list hardware that passes our structural integrity thresholds.
              </p>
            </div>
            <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-zinc-500">Network Logic</p>
                  <p className="text-lg font-black italic tracking-tighter uppercase mb-4 text-white">Buy Once. Style Forever.</p>
                  <p className="text-zinc-400 text-xs">Society members receive -15% automated allocation discount on all Core Hardware.</p>
               </div>
            </div>
          </div>
        </header>
      </div>

      <StableShowcase items={items || []} isMember={isMember} />

      {(!items || items.length === 0) && (
        <div className="max-w-7xl mx-auto px-6 py-40 text-center bg-white rounded-[4rem] border border-dashed border-zinc-200">
          <p className="text-zinc-300 font-black text-2xl uppercase tracking-widest italic">"Awaiting Hardware Ingestion..."</p>
        </div>
      )}
    </div>
  );
}
