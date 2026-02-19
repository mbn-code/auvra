import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] px-4 py-12 md:py-24">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>
        <article className="prose prose-zinc prose-sm md:prose-base max-w-none">
          {children}
        </article>
      </div>
    </div>
  );
}
