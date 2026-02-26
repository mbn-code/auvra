"use client";

import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Lock, Fingerprint, Mail, Key } from "lucide-react";

type AuthMode = "magic" | "login" | "register";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setMessage("Check your email for the secure access link.");
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (err) setError(err.message);
      else {
        router.refresh();
        router.push("/stylist");
      }
    } else {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        }
      });
      setLoading(false);
      if (err) setError(err.message);
      else setMessage("Society node initialized. Please verify your email to activate.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none text-black">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="auth-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-zinc-100 text-center">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl">
            <Fingerprint className="text-white" size={32} />
          </div>
          
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-[-0.06em] uppercase italic leading-none mb-2">
              {mode === "register" ? "Initialize node" : "Authenticate"}
            </h1>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">
              {mode === "register" ? "Join the Auvra Society" : "Secure Archive Access"}
            </p>
          </div>

          {message ? (
            <div className="bg-zinc-900 text-white p-8 rounded-[2rem] text-sm font-medium leading-relaxed italic animate-in zoom-in-95 duration-500">
              "{message}"
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-8 p-1.5 bg-zinc-50 rounded-full border border-zinc-100">
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    mode === "login" ? "bg-white shadow-sm text-black border border-zinc-100" : "text-zinc-400"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    mode === "register" ? "bg-white shadow-sm text-black border border-zinc-100" : "text-zinc-400"
                  }`}
                >
                  Register
                </button>
                <button
                  onClick={() => { setMode("magic"); setError(""); }}
                  className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    mode === "magic" ? "bg-white shadow-sm text-black border border-zinc-100" : "text-zinc-400"
                  }`}
                >
                  Magic
                </button>
              </div>

              {error && (
                <div className="mb-6 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={mode === "magic" ? handleMagicLink : handlePasswordAuth} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={16} />
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 pl-14 pr-6 py-5 rounded-2xl text-xs font-black outline-none focus:bg-white focus:border-black transition-all"
                    required
                  />
                </div>
                
                {mode !== "magic" && (
                  <div className="relative group">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={16} />
                    <input
                      type="password"
                      placeholder="PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-100 pl-14 pr-6 py-5 rounded-2xl text-xs font-black outline-none focus:bg-white focus:border-black transition-all"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      {mode === "magic" ? "Send Access Link" : mode === "login" ? "Authenticate" : "Initialize Account"}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
          
          <div className="mt-12 pt-8 border-t border-zinc-100">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              By authenticating, you agree to the <br />
              <Link href="/terms" className="text-zinc-900 underline underline-offset-4">Society Protocol</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/" className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 hover:text-black transition-colors flex items-center justify-center gap-2">
            Return to Public Feed
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper icon component for loading state
function RefreshCw({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
