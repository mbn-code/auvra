"use client";

import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Check your email for the secure access link.");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-zinc-100 text-center">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
          <Lock className="text-white" size={24} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Society Access</h1>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-12">Members Only Area</p>

        {message ? (
          <div className="bg-zinc-900 text-white p-6 rounded-2xl text-sm font-medium mb-8">
            {message}
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-8 p-1 bg-zinc-50 rounded-full">
              <button
                onClick={() => setMode("magic")}
                className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === "magic" ? "bg-white shadow-sm text-black" : "text-zinc-400"
                }`}
              >
                Magic Link
              </button>
              <button
                onClick={() => setMode("password")}
                className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === "password" ? "bg-white shadow-sm text-black" : "text-zinc-400"
                }`}
              >
                Password
              </button>
            </div>

            <form onSubmit={mode === "magic" ? handleMagicLink : handlePasswordLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 px-6 py-4 rounded-2xl text-center font-bold outline-none focus:border-black transition-colors"
                required
              />
              {mode === "password" && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 px-6 py-4 rounded-2xl text-center font-bold outline-none focus:border-black transition-colors"
                  required
                />
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-full font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50"
              >
                {loading ? "Authenticating..." : mode === "magic" ? "Send Access Link" : "Enter Society"}
              </button>
            </form>
          </>
        )}
        
        <p className="mt-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Not a member? <Link href="/pricing" className="text-black underline">Apply for Access</Link>
        </p>
      </div>
    </div>
  );
}
