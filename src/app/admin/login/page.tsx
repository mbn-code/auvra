"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/review");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Unauthorized access.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-zinc-100 text-center">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
          <Lock className="text-white" size={24} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-2">TERMINAL ACCESS</h1>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-12">Restricted Area</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="password" 
              placeholder="Authorization Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 px-6 py-4 rounded-2xl text-center font-bold outline-none focus:border-black transition-colors"
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-black text-white py-5 rounded-full font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
