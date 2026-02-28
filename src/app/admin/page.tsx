import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { verifyAdmin } from "@/lib/admin";
import AdminSystemControls from "./AdminSystemControls";
import Link from "next/link";
import { 
  Package, 
  Activity, 
  ShoppingBag, 
  Search, 
  Target, 
  ArrowRight,
  ShieldCheck,
  Terminal as TerminalIcon,
  LayoutDashboard
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminMainPage() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const adminSectors = [
    {
      title: "Stable Nodes",
      description: "Manage permanent collection, stock levels, and ROI margins.",
      href: "/admin/stable",
      icon: Package,
      color: "text-blue-500"
    },
    {
      title: "Creative Engine",
      description: "Neural intelligence dashboard for TikTok/IG performance.",
      href: "/admin/creative",
      icon: Activity,
      color: "text-red-500"
    },
    {
      title: "Order Fulfillment",
      description: "Process active checkouts, update tracking, and manage refunds.",
      href: "/admin/orders",
      icon: ShoppingBag,
      color: "text-green-500"
    },
    {
      title: "Hunt Terminal",
      description: "Global marketplace monitoring and price-drop arbitrage.",
      href: "/personal-hunt",
      icon: Target,
      color: "text-yellow-500"
    },
    {
      title: "Review Queue",
      description: "Approve or discard scraped items before they hit the archive.",
      href: "/admin/review",
      icon: Search,
      color: "text-zinc-400"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8 md:p-20">
      <header className="max-w-5xl mx-auto mb-20">
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <ShieldCheck size={24} />
          <span className="text-xs font-black uppercase tracking-[0.5em]">Command Hierarchy</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
          Auvra <br />
          <span className="text-zinc-800">Sentinel.</span>
        </h1>
        <div className="mt-8 flex items-center gap-4 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Status: Core Neural Connection Active
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSectors.map((sector) => (
            <Link 
              key={sector.href}
              href={sector.href}
              className="group bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-500 transition-all duration-500 flex flex-col justify-between h-64 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-16 bg-red-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <sector.icon size={32} className={`${sector.color} mb-6`} />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 italic">{sector.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[240px]">{sector.description}</p>
              </div>

              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">
                Initialize Sector <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))}

          <div className="bg-zinc-950 border border-dashed border-zinc-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center h-64 opacity-50">
            <TerminalIcon size={24} className="text-zinc-700 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Reserved for Neural Sub-systems</p>
          </div>
        </div>

        <AdminSystemControls />
      </main>

      <footer className="max-w-5xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
        <div>System Version 5.3.2</div>
        <div className="flex gap-8">
          <Link href="/" className="hover:text-white transition-colors italic">Bypass to Archive</Link>
          <button className="hover:text-red-500 transition-colors">Terminate Session</button>
        </div>
      </footer>
    </div>
  );
}

