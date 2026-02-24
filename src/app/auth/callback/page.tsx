"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get("code");
      
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        router.push("/account");
      } else {
        router.push("/");
      }
    };
    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-sm font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
        Verifying Society Access...
      </div>
    </div>
  );
}
