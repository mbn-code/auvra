import Link from "next/link";
import { Check, Zap, Lock, Cpu, Layers, ShieldCheck, Mail, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-24">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 flex items-center justify-center gap-2">
            <Lock size={12} />
            Members Only
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-8 leading-[0.95]">
            Unlock the <br /> Archive.
          </h1>
          <p className="text-lg text-zinc-500 font-medium max-w-lg mx-auto leading-relaxed">
            Gain immediate access to member pricing, priority acquisition, and the neural creative workstation.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Guest Tier */}
          <div className="bg-white p-12 rounded-[3rem] border border-zinc-100 flex flex-col relative group hover:border-zinc-300 transition-all duration-500">
            <div className="mb-8">
              <h3 className="text-2xl font-black tracking-tighter mb-2">Guest Access</h3>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Public Archive</p>
            </div>
            <div className="text-4xl font-black mb-12">€0<span className="text-lg font-bold text-zinc-200">/mo</span></div>
            
            <div className="space-y-8 mb-12 flex-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Discovery</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-bold text-zinc-600">
                    <Check size={16} className="text-zinc-900" /> Browse Neural Archive
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-zinc-600">
                    <Check size={16} className="text-zinc-900" /> Basic Aesthetic Tuning
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Workstation</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-bold text-zinc-600">
                    <Check size={16} className="text-zinc-900" /> Manifest & Layer Outfits
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <Lock size={14} /> Cloud Saving Locked
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <Lock size={14} /> DNA Export Locked
                  </li>
                </ul>
              </div>
            </div>

            <Link 
              href="/archive"
              className="w-full py-5 rounded-full border-2 border-zinc-100 text-center font-black text-xs uppercase tracking-widest hover:border-black transition-all group-hover:bg-zinc-50"
            >
              Continue as Guest
            </Link>
          </div>

          {/* Society Tier */}
          <div className="bg-zinc-900 text-white p-12 rounded-[3rem] flex flex-col relative overflow-hidden shadow-2xl shadow-zinc-300 group">
            {/* Ambient Background Effect */}
            <div className="absolute top-0 right-0 p-48 bg-yellow-400 blur-[120px] opacity-10 rounded-full pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>
            
            <div className="mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-yellow-400/20">
                <Zap size={10} className="fill-black" /> Recommended
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-2 italic">Auvra Society</h3>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">The Inner Circle</p>
            </div>

            <div className="text-5xl font-black mb-8 relative z-10">
              €19<span className="text-lg font-bold text-zinc-600">/mo</span>
              <div className="text-sm font-medium text-zinc-500 mt-2 line-through">Value: €145/mo</div>
            </div>

            <div className="space-y-8 mb-12 flex-1 relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Neural Workstation Unlocked</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-bold">
                    <ShieldCheck size={16} className="text-yellow-400" /> Save Lookbooks to Cloud
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold">
                    <Mail size={16} className="text-yellow-400" /> High-Fidelity Style DNA Briefs
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold">
                    <Cpu size={16} className="text-yellow-400" /> 
                    <span>Neural Continuity <span className="text-[8px] bg-yellow-400 text-black px-2 py-0.5 rounded-full ml-2">ALWAYS SYNCED</span></span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Acquisition Privileges</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-bold text-yellow-400">
                    <Sparkles size={16} /> 10% Off All Archive Pieces
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold">
                    <Check size={16} className="text-yellow-400" /> Direct Source Links (Steals)
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold">
                    <Layers size={16} className="text-yellow-400" /> 
                    <span>Priority Queue <span className="text-[8px] bg-white text-black px-2 py-0.5 rounded-full ml-2 uppercase">Fast Pass</span></span>
                  </li>
                </ul>
              </div>
            </div>

            <Link 
              href="/api/checkout/subscribe"
              className="w-full bg-white text-black py-6 rounded-full text-center font-black text-xs uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all relative z-10 shadow-xl shadow-white/5 active:scale-[0.98]"
            >
              Enter The Society
            </Link>
          </div>
        </div>

        <footer className="mt-20 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            Cancel anytime. Membership is verified on the Auvra Neural Network.
          </p>
        </footer>
      </div>
    </div>
  );
}
