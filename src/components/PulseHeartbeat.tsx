"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const EVENTS = [
  "Scanning Northern EU Archives...",
  "Secured 1-of-1 Chrome Hearts Piece",
  "Verifying Authenticity: LV Archive",
  "Node 01: Sourcing Stüssy 8-Ball",
  "Neurolink established with Global Vaults",
  "Integrity check passed for 42 items",
  "Filtering 1,200+ new entries..."
];

export default function PulseHeartbeat() {
  const [event, setEvent] = useState(EVENTS[0]);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setEvent(EVENTS[Math.floor(Math.random() * EVENTS.length)]);
    }, 4000);

    const timer = setInterval(() => {
      const now = new Date();
      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const diff = nextHour.getTime() - now.getTime();
      const mins = Math.floor(diff / 1000 / 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="bg-zinc-50 border-y border-zinc-100 py-3 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-12">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
          <Zap size={10} className="fill-zinc-400" />
          {event}
        </span>
      </div>
      
      <div className="hidden md:block h-4 w-[1px] bg-zinc-200" />

      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Next Archive Injection:</span>
        <span className="text-[10px] font-mono font-black text-zinc-900 tracking-tighter bg-white px-2 py-0.5 rounded border border-zinc-100 shadow-sm">
          {timeLeft || "00:00"}
        </span>
      </div>
    </div>
  );
}
