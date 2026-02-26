import Link from "next/link";
import { Check, Zap, Lock, Cpu, Layers, ShieldCheck, Mail, Sparkles, ArrowRight, Hexagon } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 overflow-hidden relative">
      {/* Background Noise/Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Hero Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-32 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-10 shadow-2xl">
            <Hexagon size={12} className="text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Membership Nodes</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">
            Own the <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">Archive.</span>
          </h1>
          
          <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
            Transcend standard shopping. Gain direct access to the neural creative workstation and the inner circle of Auvra.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-32">
          
          {/* GUEST ACCESS */}
          <div className="relative group animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
            <div className="absolute inset-0 bg-zinc-900 rounded-[4rem] transition-all duration-500 group-hover:bg-zinc-800/50 group-hover:scale-[1.02]"></div>
            <div className="relative p-12 h-full flex flex-col border border-zinc-800 rounded-[4rem]">
              <div className="mb-12">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2">Standard Protocol</p>
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-6">Guest</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black italic">€0</span>
                  <span className="text-zinc-600 text-sm font-bold uppercase tracking-widest">/forever</span>
                </div>
              </div>

              <div className="space-y-10 mb-16 flex-1">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-2">Discovery Access</h4>
                  <ul className="space-y-5">
                    <li className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                      <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600"><Check size={12} /></div>
                      Neural Archive Indexing
                    </li>
                    <li className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                      <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600"><Check size={12} /></div>
                      Basic Centroid Seeding
                    </li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-2">Workstation State</h4>
                  <ul className="space-y-5 text-zinc-600">
                    <li className="flex items-center gap-4 text-sm font-medium opacity-50 italic">
                      <Lock size={14} className="text-zinc-800" />
                      Cloud State Persistence
                    </li>
                    <li className="flex items-center gap-4 text-sm font-medium opacity-50 italic">
                      <Lock size={14} className="text-zinc-800" />
                      High-Fidelity DNA Exports
                    </li>
                  </ul>
                </section>
              </div>

              <Link 
                href="/archive"
                className="w-full py-6 rounded-full bg-zinc-900 border border-zinc-800 text-center font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 active:scale-95"
              >
                Continue Protocol
              </Link>
            </div>
          </div>

          {/* SOCIETY ACCESS */}
          <div className="relative group animate-in fade-in slide-in-from-right-10 duration-1000 delay-500">
            {/* Outer Glow */}
            <div className="absolute inset-[-2px] bg-gradient-to-b from-zinc-700 to-transparent rounded-[4.1rem] opacity-50"></div>
            <div className="absolute inset-0 bg-zinc-950 rounded-[4rem] z-10"></div>
            
            {/* Ambient Inner Glow */}
            <div className="absolute top-0 right-0 p-48 bg-yellow-400 blur-[140px] opacity-10 rounded-full pointer-events-none z-20 group-hover:opacity-20 transition-opacity duration-1000"></div>

            <div className="relative p-12 h-full flex flex-col z-30">
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-2xl shadow-yellow-400/20">
                  <Zap size={12} fill="black" /> Elite Status
                </div>
                <h3 className="text-5xl font-black tracking-tighter uppercase italic mb-6">Society</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black italic">€19</span>
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">/monthly</span>
                  <span className="ml-4 text-[10px] font-black text-zinc-600 line-through">Value €145</span>
                </div>
              </div>

              <div className="space-y-10 mb-16 flex-1">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-800 pb-2">Full Neural Suite</h4>
                  <ul className="space-y-5">
                    <li className="flex items-center gap-4 text-sm font-bold">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-400/10"><ShieldCheck size={14} /></div>
                      Unlimited Cloud Archive Persistence
                    </li>
                    <li className="flex items-center gap-4 text-sm font-bold">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-400/10"><Mail size={14} /></div>
                      Premium DNA Brief PDF Deliverables
                    </li>
                    <li className="flex items-center gap-4 text-sm font-bold">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-400/10"><Cpu size={14} /></div>
                      Multi-Device Neural Synchronization
                    </li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-800 pb-2">Acquisition Privileges</h4>
                  <ul className="space-y-5">
                    <li className="flex items-center gap-4 text-sm font-bold text-yellow-400">
                      <Sparkles size={16} /> 10% Protocol Discount on All Pieces
                    </li>
                    <li className="flex items-center gap-4 text-sm font-bold">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white"><Layers size={14} /></div>
                      Direct Acquisition Links Unlocked
                    </li>
                    <li className="flex items-center gap-4 text-sm font-bold opacity-80">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-[10px] font-black italic">!</div>
                      Fast-Pass Priority Fulfillment Queue
                    </li>
                  </ul>
                </section>
              </div>

              <Link 
                href="/api/checkout/subscribe"
                className="w-full bg-white text-black py-7 rounded-full text-center font-black text-sm uppercase tracking-[0.4em] hover:bg-yellow-400 transition-all duration-500 shadow-2xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-4"
              >
                Authenticate Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-20 py-20 border-t border-zinc-900 text-center animate-in fade-in duration-1000 delay-700">
          <div className="max-w-lg mx-auto">
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.5em] mb-4 leading-relaxed">
              Cancel anytime. Access is validated on the Auvra Global Neural Mesh.
            </p>
            <div className="flex justify-center gap-8 mt-10 opacity-30 group">
               <div className="text-[8px] font-black uppercase tracking-widest grayscale group-hover:grayscale-0 transition-all duration-500">Secured with Neural-Key</div>
               <div className="text-[8px] font-black uppercase tracking-widest grayscale group-hover:grayscale-0 transition-all duration-500 underline underline-offset-4 decoration-zinc-800">Verified Society Node</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
