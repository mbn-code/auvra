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

  useEffect(() => {
    const interval = setInterval(() => {
      setEvent(EVENTS[Math.floor(Math.random() * EVENTS.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-50 border-y border-zinc-100 py-3 flex items-center justify-center gap-3">
      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
        <Zap size={10} className="fill-zinc-400" />
        {event}
      </span>
    </div>
  );
}
