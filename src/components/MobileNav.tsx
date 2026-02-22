"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Archive, User, Home } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "Society", href: "/pricing", icon: Zap },
    { name: "Account", href: "/account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[150] lg:hidden bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 pb-8 pt-4">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? "bg-zinc-100" : "bg-transparent"}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
