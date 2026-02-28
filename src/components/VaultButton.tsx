"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export function VaultButton({ productId, className = "" }: { productId: string, className?: string }) {
  const [inVault, setInVault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    
    if (isLoading) return;

    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("No active session found. Redirecting to login.");
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    // Optimistic UI update
    const previousState = inVault;
    setInVault(!previousState);

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId }),
        // Ensure credentials (cookies) are sent
        credentials: 'same-origin'
      });
      
      if (!res.ok) {
        setInVault(previousState);
        const errData = await res.json().catch(() => ({ error: "Server Error" }));
        console.error("Vault API Error:", errData.error);
      } else {
        const data = await res.json();
        setInVault(data.action === "added");
      }
    } catch (err) {
      console.error("Fetch Exception:", err);
      setInVault(previousState);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button 
      onClick={toggleVault}
      disabled={isLoading}
      className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
        inVault 
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
          : "bg-white/90 text-zinc-900 border border-zinc-100 hover:bg-zinc-50"
      } ${className}`}
    >
      <Heart size={16} fill={inVault ? "white" : "none"} className={isLoading ? "animate-pulse" : ""} />
    </button>
  );
}
