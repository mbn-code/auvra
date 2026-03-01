import Link from "next/link";
import { CheckCircle, Zap } from "lucide-react";

// The webhook (src/app/api/webhook/route.ts) now owns all post-purchase work:
// inventory updates, order record creation, customer confirmation email, and
// operator notifications. This page is a pure confirmation screen only.
export default async function SuccessPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const productIds: string[] = params.session_id
    ? [] // Count is unknown here without a Stripe call — show generic copy
    : params.id
    ? [params.id]
    : [];

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center relative">
            <CheckCircle className="text-zinc-900" size={48} strokeWidth={1.5} />
            <Zap className="absolute -top-2 -right-2 text-yellow-400 fill-yellow-400" size={24} />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Acquisition Initiated.</h1>
        <p className="text-zinc-500 mb-8 leading-relaxed font-medium px-6 text-sm">
          Your request to secure this piece has been received. Our concierge is initiating the acquisition and authentication process. You will receive a confirmation email and tracking details within 24–48 hours.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-black text-white py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all shadow-xl shadow-zinc-200"
        >
          Return to Archive
        </Link>
      </div>
    </div>
  );
}
