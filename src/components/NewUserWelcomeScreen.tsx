"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Zap, Crown, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import Link from "next/link";

export default function NewUserWelcomeScreen() {
  const [show, setShow] = useState(false);
  const [tier, setTier] = useState<string>("free");
  const [dismissing, setDismissing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkNewUser() {
      // Avoid running if already seen
      if (localStorage.getItem("auvra_network_welcome_seen")) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at, membership_tier")
        .eq("id", user.id)
        .single();

      if (profile) {
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

        // If user was created in the last 120 seconds (generous buffer)
        if (diffSeconds < 120) {
          setTier(profile.membership_tier || "free");
          setShow(true);
        } else {
          // User is not new, don't show again
          localStorage.setItem("auvra_network_welcome_seen", "true");
        }
      }
    }
    
    checkNewUser();
  }, [supabase]);

  if (!show) return null;

  const handleEnter = () => {
    triggerHaptic('heavy');
    setDismissing(true);
    setTimeout(() => {
      setShow(false);
      localStorage.setItem("auvra_network_welcome_seen", "true");
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-[500] flex flex-col items-center justify-center bg-zinc-950 text-white transition-opacity duration-1000 ${dismissing ? "opacity-0" : "opacity-100"}`}>
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-yellow-400/20 blur-[150px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-1000 slide-in-from-bottom-8">
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(250,204,21,0.2)]">
          {tier === 'society' ? <Crown size={32} className="text-yellow-400" /> : <Zap size={32} className="text-yellow-400 fill-yellow-400" />}
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Node Connected
        </p>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none bg-gradient-to-br from-white to-zinc-500 text-transparent bg-clip-text">
          Welcome to <br /> The Network
        </h1>

        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full mb-12 shadow-xl">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Clearance Level:</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {tier === 'society' ? 'SOCIETY TIER' : 'FREE NODE'}
          </span>
        </div>

        <button 
          onClick={handleEnter}
          className="bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          Enter The Archive <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}