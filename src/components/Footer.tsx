import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Youtube, ShieldCheck, Music2 } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-24 pb-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
        <div className="md:col-span-4">
          <div className="mb-6">
            <Logo />
          </div>
          <p className="text-[14px] text-zinc-500 max-w-sm leading-relaxed font-medium mb-8">
            Elevating the everyday through intentional design. We curate the world's most trending essentials with an uncompromising focus on quality and minimalism.
          </p>
          <div className="flex gap-4">
             <Link href="https://www.instagram.com/auvra.clothing/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all"><Instagram size={18} strokeWidth={1.5} /></Link>
             <Link href="https://www.tiktok.com/@.auvra" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-2 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all"><Music2 size={18} strokeWidth={1.5} /></Link>
          </div>
        </div>
        
        <div className="md:col-span-2 md:col-start-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-8">Shop</h4>
          <ul className="space-y-4 text-[13px] font-bold text-zinc-500">
            <li><Link href="/" className="hover:text-black transition-colors">All Products</Link></li>
            <li><Link href="/" className="hover:text-black transition-colors">New Arrivals</Link></li>
            <li><Link href="/" className="hover:text-black transition-colors">Best Sellers</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-8">Company</h4>
          <ul className="space-y-4 text-[13px] font-bold text-zinc-500">
            <li><Link href="/shipping" className="hover:text-black transition-colors">Shipping Info</Link></li>
            <li><Link href="/refunds" className="hover:text-black transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy & GDPR</Link></li>
            <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
            <li><Link href="/legal" className="hover:text-black transition-colors">Legal Notice</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-8">Join the Circle</h4>
          <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full bg-zinc-50 border-b border-zinc-200 px-0 py-4 text-sm outline-none focus:border-black transition-colors font-medium text-zinc-900 placeholder:text-zinc-500"
            />
            <button aria-label="Subscribe" className="absolute right-0 bottom-4 text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} AUVRA. Designed for the Modern Individual.
          </p>
          <p className="text-[9px] text-zinc-500 font-medium max-w-lg leading-relaxed text-center md:text-left italic">
            Auvra is an independent curator of pre-owned items and is not affiliated, associated, or authorized by the brands it curates. All brand names and logos are property of their respective owners.
          </p>
        </div>
        <div className="flex gap-4 items-center opacity-40 grayscale">
            <div className="flex items-center gap-1.5 mr-4 border-r border-zinc-300 pr-6">
               <ShieldCheck size={12} className="text-zinc-900" />
               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900">PCI DSS Compliant</span>
            </div>
            <Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" width={32} height={16} className="h-4 w-auto" />
            <Image src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" width={32} height={12} className="h-3 w-auto" />
            <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={32} height={20} className="h-5 w-auto" />
            <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={32} height={16} className="h-4 w-auto" />
        </div>
      </div>
    </footer>
  );
}
