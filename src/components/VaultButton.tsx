"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { triggerHaptic } from "@/lib/haptics";
import { toast } from "sonner";

export function VaultButton({ productId, className = "" }: { productId: string, className?: string }) {
  const [inVault, setInVault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkStatus() {
      if (!productId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const res = await fetch(`/api/vault?id=${productId}`);
        if (!res.ok) return;
        const data = await res.json();
        setInVault(!!data.inVault);
      } catch (err) {
        // Silent fail for status check
      }
    }
    checkStatus();
  }, [productId, supabase]);

  async function toggleVault(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("No active session found. Redirecting to login.");
      window.location.href = "/login";
      return;
    }

    triggerHaptic('light');
    
    // Optimistic UI update
    const previousState = inVault;
    setInVault(!previousState);
    if (!previousState) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 500);
      toast.success("Added to The Vault ✦", { description: "Artifact secured in your personal collection." });
    } else {
      toast.info("Removed from Vault", { description: "Artifact removed from your collection." });
    }

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId }),
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        setInVault(previousState);
        const errData = await res.json().catch(() => ({ error: "Server Error" }));
        console.error("Vault API Error:", errData.error);
        toast.error("Vault Error", { description: "Could not update vault status." });
      } else {
        const data = await res.json();
        setInVault(data.action === "added");
      }
    } catch (err) {
      console.error("Fetch Exception:", err);
      setInVault(previousState);
    }
  }

  return (
    <button 
      onClick={toggleVault}
      className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
        inVault 
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
          : "bg-white/90 text-zinc-900 border border-zinc-100 hover:bg-zinc-50"
      } ${justAdded ? "animate-ping scale-125" : ""} ${className}`}
    >
      <Heart size={16} fill={inVault ? "white" : "none"} className={justAdded ? "scale-110" : ""} />
    </button>
  );
}
