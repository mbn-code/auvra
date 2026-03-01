"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Zap, Lock, Cpu, Layers, ShieldCheck, Mail, Sparkles, ArrowRight, Hexagon, Globe, Database, Fingerprint } from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 overflow-hidden relative selection:bg-yellow-400 selection:text-black">

      {/* 1. LAYER: NEURAL MESH BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 2. LAYER: AMBIENT PULSE */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER: MISSION STATEMENT */}
        <header className="flex flex-col items-center text-center mb-24">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-zinc-800 bg-black mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Fingerprint size={14} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400">Node Authentication Required</span>
          </div>

          <h1 className="text-7xl md:text-[10rem] font-black tracking-[ -0.08em] leading-[0.8] mb-12 uppercase italic animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-800">Archive</span> <br />
            Is Yours.
          </h1>

          <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed tracking-tight animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            Auvra Society is not a subscription. It is a key to the neural creative mesh. Access the workstation, bypass the retail markup, and secure artifacts.
          </p>
        </header>

        {/* PRICING TOGGLE */}
        <div className="flex justify-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-full flex items-center relative">
             <button
               onClick={() => setIsAnnual(false)}
               className={`relative z-10 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-colors ${!isAnnual ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
             >
               Monthly
             </button>
             <button
               onClick={() => setIsAnnual(true)}
               className={`relative z-10 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2 ${isAnnual ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
             >
               Annual <span className={`text-[8px] px-2 py-0.5 rounded-full ${isAnnual ? 'bg-black text-yellow-400' : 'bg-yellow-400/20 text-yellow-400'}`}>Save 20%</span>
             </button>

             {/* Toggle Background Pill */}
             <div
               className={`absolute top-1.5 bottom-1.5 w-[50%] bg-white rounded-full transition-transform duration-500 ease-out`}
               style={{ transform: isAnnual ? 'translateX(95%)' : 'translateX(0)' }}
             ></div>
          </div>
        </div>

        {/* TIERS: ARCHITECTURAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-40">

          {/* GUEST: THE EXTERNAL NODE */}
          <div className="lg:col-span-5 relative group">
            <div className="h-full bg-zinc-950/50 backdrop-blur-xl border border-zinc-900 rounded-[4rem] p-12 flex flex-col transition-all duration-700 hover:border-zinc-700">
              <div className="mb-16">
                <div className="flex items-center gap-2 text-zinc-600 mb-4">
                   <Globe size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">External Access</span>
                </div>
                <h3 className="text-4xl font-black italic uppercase mb-2">Guest</h3>
                <p className="text-zinc-500 text-sm font-medium">Standard Discovery Mode</p>
              </div>

              <div className="space-y-12 flex-1 mb-16">
                <div className="grid grid-cols-1 gap-8">
                   <div className="flex items-start gap-4">
                      <div className="mt-1 text-zinc-700"><Check size={16} /></div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Archive Pulse</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">Real-time view of the global sourcing network.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="mt-1 text-zinc-700"><Check size={16} /></div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Aesthetic Centroid</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">Basic neural matching for local sessions.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4 opacity-30 grayscale">
                      <div className="mt-1 text-zinc-800"><Lock size={16} /></div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest mb-1">Cloud Syncing</p>
                        <p className="text-xs italic">Authentication required for persistence.</p>
                      </div>
                   </div>
                </div>
              </div>

              <Link
                href="/archive"
                className="w-full py-6 rounded-full bg-zinc-900 border border-zinc-800 text-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500"
              >
                Enter Archive
              </Link>
            </div>
          </div>

          {/* SOCIETY: THE CORE MESH */}
          <div className="lg:col-span-7 relative">
            {/* High-Impact Glow Container */}
            <div className="absolute inset-0 bg-yellow-400/10 blur-[100px] rounded-full animate-pulse"></div>

            <div className="relative h-full bg-white text-black rounded-[4rem] p-12 md:p-16 flex flex-col shadow-[0_0_100px_rgba(255,255,255,0.1)] overflow-hidden">

              {/* Animated Label */}
              <div className="absolute top-12 right-12">
                 <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Node Active</span>
                 </div>
              </div>

              <div className="mb-16">
                <h3 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">Society</h3>
                <div className="flex items-baseline gap-4">
                   <span className="text-4xl font-black">€{isAnnual ? '15' : '19'}</span>
                   <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">/ monthly for Membership Access {isAnnual && '(Billed Annually)'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1 mb-16">
                <div className="space-y-10">
                   <div className="group">
                      <div className="flex items-center gap-3 mb-3 text-yellow-600">
                         <Database size={18} />
                         <span className="text-[11px] font-black uppercase tracking-widest">Neural Continuity</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">Save your outfits and Style DNA to the cloud. Access your manifestation workstation on any device, forever.</p>
                   </div>
                   <div className="group">
                      <div className="flex items-center gap-3 mb-3 text-yellow-600">
                         <Mail size={18} />
                         <span className="text-[11px] font-black uppercase tracking-widest">DNA Briefs</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">Every lookbook you build is exported as a high-fidelity PDF dossier with direct acquisition paths.</p>
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="group">
                      <div className="flex items-center gap-3 mb-3 text-zinc-900">
                         <Sparkles size={18} />
                         <span className="text-[11px] font-black uppercase tracking-widest">Member Pricing</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">Automatic 10% reduction on all archive acquisitions. No retail markup, just the artifact at cost + service fee.</p>
                   </div>
                   <div className="group">
                      <div className="flex items-center gap-3 mb-3 text-zinc-900">
                         <Layers size={18} />
                         <span className="text-[11px] font-black uppercase tracking-widest">The Source Vault</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">Direct links to private sellers and unlisted grails. Beat the public to the high-heat steals.</p>
                   </div>
                </div>
              </div>

              <Link
                href="/api/checkout/subscribe"
                className="w-full bg-black text-white py-8 rounded-full text-center font-black text-sm uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all shadow-2xl flex items-center justify-center gap-6"
              >
                Initialize Society Access <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER: THE FINE PRINT */}
        <div className="max-w-4xl mx-auto border-t border-zinc-900 pt-20 text-center">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Network</p>
                 <p className="text-xs font-bold">99.9% Sourcing Uptime</p>
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Integrity</p>
                 <p className="text-xs font-bold">Neural Verification</p>
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Protocol</p>
                 <p className="text-xs font-bold">Cancel Anytime</p>
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Support</p>
                 <p className="text-xs font-bold">Society Concierge</p>
              </div>
           </div>

           <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.8em]">Auvra • Neural Archive Network • 2026</p>
        </div>
      </div>
    </div>
  );
}
