"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[200] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-zinc-100 flex flex-col gap-6">
        <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
          Auvra uses minimal cookies to enhance your archive experience. By continuing, you agree to our <Link href="/privacy" className="text-zinc-900 underline">Privacy Policy</Link>.
        </p>
        <button 
          onClick={accept}
          className="w-full bg-black text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
