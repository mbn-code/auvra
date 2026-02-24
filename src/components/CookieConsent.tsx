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

  const reject = () => {
    localStorage.setItem("cookie-consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[200] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-zinc-100 flex flex-col gap-6">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-zinc-900">Privacy Preference</h4>
          <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
            We use essential cookies to manage your secure checkout and archive session. We do not use tracking or marketing cookies without your explicit consent.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={reject}
            className="flex-1 bg-zinc-50 text-zinc-500 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all"
          >
            Essential Only
          </button>
          <button 
            onClick={accept}
            className="flex-1 bg-black text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all"
          >
            Accept All
          </button>
        </div>
        <Link href="/privacy" className="text-[10px] font-black text-zinc-300 uppercase tracking-widest text-center hover:text-zinc-900 transition-colors">
          Read Privacy Policy
        </Link>
      </div>
    </div>
  );
}
