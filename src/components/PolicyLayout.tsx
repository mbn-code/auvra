import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PolicyLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] px-6 py-24 md:py-32">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black mb-12 transition-colors"
        >
          <ArrowLeft size={14} />
          Return to Archive
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 uppercase">{title}</h1>
        <div className="prose prose-zinc max-w-none prose-sm md:prose-base text-zinc-600 leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}
