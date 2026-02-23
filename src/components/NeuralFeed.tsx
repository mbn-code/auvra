"use client";

import { useEffect, useState } from "react";
import { Zap, Terminal as TerminalIcon } from "lucide-react";

const SYSTEM_LOGS = [
  "SCANNING_VINTED_PL_NODE...",
  "SECURED: CHROME_HEARTS_ZIP_UP",
  "NEURAL_FILTER_ACTIVE: LV_ARCHIVE",
  "BYPASSING_MARKET_GATE...",
  "UPLOADING_ARCHIVE_SELECTION_01",
  "INTEGRITY_CHECK: 98%_COMPLETE",
  "NEW_DROP_DETECTED: STUSSY_8BALL",
  "LOGISTICS_NODE_DE_ONLINE",
  "TRANSFERRING_TO_AUVRA_VAULT..."
];

export default function NeuralFeed() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [SYSTEM_LOGS[Math.floor(Math.random() * SYSTEM_LOGS.length)], ...prev].slice(0, 5));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#09090B] border border-white/5 rounded-[2rem] p-8 font-mono text-[10px] overflow-hidden relative shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-green-500">
          <TerminalIcon size={14} />
          <span className="font-black uppercase tracking-widest">Auvra_Neural_Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-zinc-500">LIVE</span>
        </div>
      </div>
      
      <div className="space-y-3 opacity-80">
        {logs.length === 0 ? (
          <p className="text-zinc-700 italic">Initiating link sequence...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-500">
              <span className="text-zinc-700">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className={i === 0 ? "text-white font-bold" : "text-zinc-500"}>
                {log}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}
