import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";
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
             <Link href="#" className="p-2 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all"><Instagram size={18} strokeWidth={1.5} /></Link>
             <Link href="#" className="p-2 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all"><Twitter size={18} strokeWidth={1.5} /></Link>
             <Link href="#" className="p-2 bg-zinc-50 rounded-full hover:bg-black hover:text-white transition-all"><Youtube size={18} strokeWidth={1.5} /></Link>
          </div>
        </div>
        
        <div className="md:col-span-2 md:col-start-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-8">Shop</h4>
          <ul className="space-y-4 text-[13px] font-bold text-zinc-400">
            <li><Link href="/" className="hover:text-black transition-colors">All Products</Link></li>
            <li><Link href="/" className="hover:text-black transition-colors">New Arrivals</Link></li>
            <li><Link href="/" className="hover:text-black transition-colors">Best Sellers</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-8">Company</h4>
          <ul className="space-y-4 text-[13px] font-bold text-zinc-400">
            <li><Link href="/shipping" className="hover:text-black transition-colors">Shipping Info</Link></li>
            <li><Link href="/refunds" className="hover:text-black transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy & GDPR</Link></li>
            <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-8">Join the Circle</h4>
          <p className="text-xs text-zinc-400 font-medium mb-6 leading-relaxed">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full bg-zinc-50 border-b border-zinc-200 px-0 py-4 text-sm outline-none focus:border-black transition-colors font-medium"
            />
            <button className="absolute right-0 bottom-4 text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} AUVRA. Designed for the Modern Individual.
        </p>
        <div className="flex gap-4 items-center opacity-40 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
        </div>
      </div>
    </footer>
  );
}
