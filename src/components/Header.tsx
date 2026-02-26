import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
import AnnouncementMarquee from "./AnnouncementMarquee";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase-server";

export default async function Header() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <AnnouncementMarquee />
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex lg:hidden">
            <Menu size={20} strokeWidth={2} className="text-zinc-900" />
          </div>
          
          <nav className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            <Link href="/archive" className="hover:text-black transition-colors text-zinc-900 italic">Archive Pulse</Link>
            <Link href="/stylist" className="hover:text-black transition-colors">AI Stylist</Link>
            <Link href="/pricing" className="text-zinc-900 hover:opacity-50 transition-opacity border-b-2 border-yellow-400 pb-0.5">Society</Link>
            <Link href="/shipping" className="hover:text-black transition-colors">Logistics</Link>
          </nav>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo />
          </div>
          
          <div className="flex items-center gap-6">
            <Link href={session ? "/account" : "/login"} className="p-2 text-zinc-900 hover:opacity-50 transition-opacity">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <button className="relative p-2 text-zinc-900">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 bg-black text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">0</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
