import Link from "next/link";
import { Check, Zap, Lock } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-24">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6 flex items-center justify-center gap-2">
            <Lock size={12} />
            Members Only
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-8 leading-[0.95]">
            Unlock the <br /> Archive.
          </h1>
          <p className="text-lg text-zinc-500 font-medium max-w-lg mx-auto leading-relaxed">
            Gain immediate access to member pricing, priority acquisition, and the direct source vault.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white p-12 rounded-[3rem] border border-zinc-100 flex flex-col relative">
            <div className="mb-8">
              <h3 className="text-2xl font-black tracking-tighter mb-2">Guest Access</h3>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Public Archive</p>
            </div>
            <div className="text-4xl font-black mb-12">€0<span className="text-lg font-bold text-zinc-300">/mo</span></div>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-sm font-bold text-zinc-600">
                <Check size={16} className="text-zinc-900" /> Browse Full Archive
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-zinc-600">
                <Check size={16} className="text-zinc-900" /> Concierge Fulfillment
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                <Lock size={16} /> Member Pricing Locked
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                <Lock size={16} /> Source Links Locked
              </li>
            </ul>
            <Link 
              href="/archive"
              className="w-full py-5 rounded-full border-2 border-zinc-100 text-center font-black text-xs uppercase tracking-widest hover:border-black transition-all"
            >
              Continue as Guest
            </Link>
          </div>

          {/* Society Tier */}
          <div className="bg-zinc-900 text-white p-12 rounded-[3rem] flex flex-col relative overflow-hidden shadow-2xl shadow-zinc-200">
            <div className="absolute top-0 right-0 p-32 bg-yellow-400 blur-[100px] opacity-10 rounded-full pointer-events-none"></div>
            <div className="mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                <Zap size={10} className="fill-black" /> Recommended
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Auvra Society</h3>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Full Access</p>
            </div>
            <div className="text-4xl font-black mb-8 relative z-10">
              €19<span className="text-lg font-bold text-zinc-600">/mo</span>
              <div className="text-sm font-medium text-zinc-500 mt-2 line-through">Value: €145/mo</div>
            </div>
            <ul className="space-y-4 mb-12 flex-1 relative z-10">
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check size={16} className="text-yellow-400" /> 10% Off All Archive Pieces
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check size={16} className="text-yellow-400" /> Direct Source Links (Steals)
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check size={16} className="text-yellow-400" /> 
                <span>Priority Acquisition Queue <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full ml-2">FAST PASS</span></span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold opacity-60">
                <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                   +
                </div>
                <span>24/7 Concierge Support <span className="text-yellow-400 ml-1">INCLUDED FREE</span></span>
              </li>
            </ul>
            <Link 
              href="/api/checkout/subscribe"
              className="w-full bg-white text-black py-5 rounded-full text-center font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all relative z-10"
            >
              Join Society
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
