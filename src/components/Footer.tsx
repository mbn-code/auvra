import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Youtube, ShieldCheck, Music2 } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#fafafa] border-t border-zinc-100 pt-32 pb-20 px-6 mt-40 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-12 relative z-10">
        <div className="md:col-span-5">
          <div className="mb-10 scale-110 origin-left">
            <Logo />
          </div>
          <p className="text-xl text-zinc-500 max-w-md leading-relaxed font-medium mb-12 tracking-tight italic">
            "We manage the discovery and curation of global archives. Our neural network monitors unlisted grails, giving you the direct source to what others simply browse."
          </p>
          <div className="flex gap-6">
             <Link href="https://www.instagram.com/auvra.eu/" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-zinc-100 rounded-full hover:bg-black hover:text-white hover:scale-110 transition-all shadow-sm"><Instagram size={20} strokeWidth={1.5} /></Link>
             <Link href="https://www.tiktok.com/@.auvra" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-zinc-100 rounded-full hover:bg-black hover:text-white hover:scale-110 transition-all shadow-sm"><Music2 size={20} strokeWidth={1.5} /></Link>
          </div>
        </div>

        <div className="md:col-span-2 md:col-start-7">
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 mb-10">Index</h4>
          <ul className="space-y-5 text-sm font-bold text-zinc-400">
            <li><Link href="/archive" className="hover:text-black transition-colors hover:italic">The Archive</Link></li>
            <li><Link href="/stylist" className="hover:text-black transition-colors hover:italic">Workstation</Link></li>
            <li><Link href="/pricing" className="hover:text-black transition-colors hover:italic">The Society</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 mb-10">Protocol</h4>
          <ul className="space-y-5 text-sm font-bold text-zinc-400">
            <li><Link href="/shipping" className="hover:text-black transition-colors hover:italic">Delivery</Link></li>
            <li><Link href="/refunds" className="hover:text-black transition-colors hover:italic">Integrity</Link></li>
            <li><Link href="/privacy" className="hover:text-black transition-colors hover:italic">Neural Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-black transition-colors hover:italic">Legal Mesh</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 mb-10">Intel</h4>
          <p className="text-xs text-zinc-400 font-medium mb-8 leading-relaxed">Subscribe to the neural mesh updates.</p>
          <div className="relative group">
            <input
              type="email"
              placeholder="Authentication Email"
              className="w-full bg-transparent border-b-2 border-zinc-200 py-4 text-sm outline-none focus:border-black transition-all font-bold text-zinc-900 placeholder:text-zinc-300 italic"
            />
            <button aria-label="Subscribe" className="absolute right-0 bottom-4 text-[10px] font-black uppercase tracking-[0.2em] hover:tracking-[0.4em] transition-all">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-32 pt-16 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-10 opacity-50">
        <div className="flex flex-col gap-4">
          <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.6em] text-center md:text-left">
            © {new Date().getFullYear()} AUVRA • NEURAL ARCHIVE NETWORK • AUTHENTICATED
          </p>
          <p className="text-[8px] text-zinc-400 font-medium max-w-xl leading-loose text-center md:text-left uppercase tracking-widest">
            Independent curator mesh. All assets verified by Auvra Neural Engine. Not authorized by represented labels.
          </p>
        </div>
            <div className="flex gap-6 items-center grayscale group hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2 mr-6 border-r border-zinc-200 pr-8">
                   <ShieldCheck size={14} className="text-zinc-900" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">Secure Node</span>
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Visa</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mastercard</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stripe</span>
            </div>
      </div>
    </footer>
  );
}
