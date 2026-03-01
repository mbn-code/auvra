"use client";

import { useState } from "react";
import { Loader2, ArrowRight, Shield } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { toast } from "sonner";

interface StickyBuyProps {
  productId: string;
  price: string;
  quantity: number;
  isStable?: boolean;
  stockLevel?: number;
  preOrderStatus?: boolean;
  isMember?: boolean;
  sourceUrl?: string;
}

export default function StickyBuy({ productId, price, quantity, isStable, stockLevel, preOrderStatus, isMember, sourceUrl }: StickyBuyProps) {
  const [status, setStatus] = useState<"idle" | "securing" | "redirecting">("idle");

  const isPreOrder = isStable && stockLevel === 0 && preOrderStatus;

  const handleCheckout = async () => {
    triggerHaptic('medium');
    
    if (isMember && sourceUrl) {
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
      toast.success("Source Link Revealed");
      return;
    }

    setStatus("securing");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId, 
          quantity,
          cancelUrl: window.location.href
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        const defaultMsg = isPreOrder ? "Pre-allocation request failed." : "Link unlock failed. The archive piece may have just been secured by another node.";
        triggerHaptic('heavy');
        toast.error("Transaction Failed", { description: error.error || defaultMsg });
        setStatus("idle");
        return;
      }

      setStatus("redirecting");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      triggerHaptic('heavy');
      toast.error("System Error", { description: "Could not communicate with the checkout node." });
      setStatus("idle");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-zinc-200 z-[110] md:relative md:bg-transparent md:border-0 md:p-0">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between md:hidden">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total</span>
            <span className="text-xl font-black">{price}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-green-600 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {isPreOrder ? 'Allocation Online' : 'Node Online'}
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={status !== "idle"}
          className="w-full bg-black text-white py-6 rounded-full font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-80 transition-all active:scale-95 disabled:opacity-70 shadow-2xl group"
        >
          {status === "securing" ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generating Source Link...
            </>
          ) : status === "redirecting" ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Initiating Transfer...
            </>
          ) : (
            <>
              {isMember ? 'REVEAL SOURCE LINK' : 'Secure Source Link'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1 opacity-40">
                <Shield size={10} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">Norton Secured</span>
            </div>
            <div className="flex items-center gap-1 opacity-40">
                <Shield size={10} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">AES-256 Bit</span>
            </div>
        </div>
      </div>
    </div>
  );
}
