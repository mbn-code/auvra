import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, ShieldAlert, Terminal as TerminalIcon } from "lucide-react";

export default async function VaultPage() {
  if (process.env.NODE_ENV === 'production') return notFound();

  const { data: items } = await supabase
    .from('pulse_inventory')
    .select('*')
    .limit(40);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-mono selection:bg-red-500 selection:text-white">
      {/* Glitch Header */}
      <header className="max-w-7xl mx-auto py-12 border-b border-white/10 mb-12 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <ShieldAlert size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.5em]">Unauthorized Access</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Internal_Archive_Pulse.exe</h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-zinc-500">Node: 01_DK_Copenhagen</p>
          <p className="text-xs text-zinc-500">Bypass Status: <span className="text-green-500">Active</span></p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items?.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-white/5 p-4 rounded-xl relative group overflow-hidden">
            <div className="aspect-square mb-4 rounded-lg overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase">{item.brand}</p>
              <h3 className="text-xs font-bold truncate opacity-80">{item.title}</h3>
              <div className="pt-2 border-t border-white/5 mt-2 flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase font-black">Raw_Cost:</span>
                <span className="text-sm font-black text-red-500 animate-pulse">€{Math.round(item.source_price)}</span>
              </div>
            </div>
            {/* Terminal Matrix Overlay */}
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
          </div>
        ))}
      </div>

      {/* Secret Floating Terminal */}
      <div className="fixed bottom-12 right-12 bg-black border-2 border-red-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] max-w-xs animate-bounce">
         <div className="flex items-center gap-3 mb-4 text-red-500">
            <TerminalIcon size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Bot Command</span>
         </div>
         <p className="text-xs font-bold leading-relaxed mb-4">LEAK DETECTED: Archive link is spreading on TikTok. Securing entries now...</p>
         <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-2/3 animate-pulse"></div>
         </div>
      </div>
    </div>
  );
}
