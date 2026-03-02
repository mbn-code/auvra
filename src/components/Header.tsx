"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, User, Zap } from "lucide-react";
import AnnouncementMarquee from "./AnnouncementMarquee";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase-client";

export default function Header() {
  const [isSociety, setIsSociety] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('membership_tier')
          .eq('id', user.id)
          .single();
        if (profile?.membership_tier === 'society') setIsSociety(true);
      }
    }
    checkUser();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <AnnouncementMarquee />
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-24 flex items-center">
          {/* LEFT: Navigation */}
          <div className="flex-1 flex items-center">
            
            <nav className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
              <Link href="/archive" className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-black after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 text-zinc-900 italic hover:text-black transition-colors">Archive Pulse</Link>
              <Link href="/stylist" className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-black after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 hover:text-black transition-colors">AI Stylist</Link>
              <Link href="/core" className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-blue-600 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 hover:text-blue-600 transition-colors text-blue-600">Core Hardware</Link>
              {isSociety ? (
                <Link href="/account" className="text-yellow-600 flex items-center gap-2 hover:opacity-80 active:scale-95 transition-all">
                  <Zap size={10} className="fill-yellow-600" /> Society Node
                </Link>
              ) : (
                <Link href="/pricing" className="text-zinc-900 hover:opacity-50 active:scale-95 transition-all border-b-2 border-yellow-400 pb-0.5">Society</Link>
              )}
              <Link href="/shipping" className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-black after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 hover:text-black transition-colors">Delivery</Link>
            </nav>
          </div>

          {/* CENTER: Logo */}
          <div className="flex-shrink-0 flex justify-center active:scale-95 transition-transform">
            <Logo />
          </div>
          
          {/* RIGHT: User & Cart */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <Link href={user ? "/account" : "/login"} className="p-2 text-zinc-900 hover:opacity-50 active:scale-95 transition-all">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <button className="relative p-2 text-zinc-900 active:scale-90 transition-transform">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 bg-black text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">0</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
