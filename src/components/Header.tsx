import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import AnnouncementMarquee from "./AnnouncementMarquee";
import Logo from "./Logo";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <AnnouncementMarquee />
      <header className="glass border-b border-zinc-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex lg:hidden">
            <Menu size={20} strokeWidth={1.5} className="text-zinc-400" />
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Link href="/archive" className="hover:text-black transition-colors text-zinc-900">Archive Pulse</Link>
            <Link href="/pricing" className="text-yellow-600 hover:text-yellow-700 transition-colors">Join Society</Link>
            <Link href="/shipping" className="hover:text-black transition-colors">Logistics</Link>
          </nav>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo />
          </div>
          
          <div className="flex items-center gap-6">
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
