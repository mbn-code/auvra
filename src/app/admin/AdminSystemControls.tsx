"use client";

import { useState } from "react";
import { Play, Zap, Trash2, RefreshCw, Smartphone, Terminal, Code } from "lucide-react";

export default function AdminSystemControls() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function triggerCommand(command: string) {
    setLoading(command);
    setStatus(`Initializing ${command}...`);
    try {
      const res = await fetch("/api/admin/system/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Success: ${data.message}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Failed to communicate with system API.");
    } finally {
      setLoading(null);
    }
  }

  const commands = [
    { id: "pulse", label: "Pulse Hunt", icon: Play, desc: "Run marketplace scrapers" },
    { id: "sync", label: "Neural Sync", icon: Zap, desc: "Process new DNA embeddings" },
    { id: "prune", label: "Integrity Prune", icon: Trash2, desc: "Clean sold/dead links" },
    { id: "content", label: "Social Gen", icon: Smartphone, desc: "Create Telegram assets" },
    { id: "sync-force", label: "Force Re-Sync", icon: RefreshCw, desc: "Re-vectorize entire archive" },
  ];

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <Terminal size={20} className="text-zinc-500" />
        <h2 className="text-xl font-black uppercase tracking-tighter">System Controls</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {commands.map((cmd) => (
          <button
            key={cmd.id}
            disabled={!!loading}
            onClick={() => triggerCommand(cmd.id)}
            className={`flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-red-500 transition-all group ${loading === cmd.id ? 'opacity-50' : ''}`}
          >
            <cmd.icon size={24} className={`mb-4 group-hover:scale-110 transition-transform ${loading === cmd.id ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white mb-1">{cmd.label}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">{cmd.desc}</span>
          </button>
        ))}
      </div>

      {status && (
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl font-mono text-[10px] text-zinc-400 flex items-center gap-3">
          <Code size={14} className="text-green-500" />
          {status}
        </div>
      )}

      <div className="bg-zinc-950/50 border border-dashed border-zinc-800 p-8 rounded-[2.5rem]">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 flex items-center gap-2">
          <Code size={12} /> Terminal Reference (Local/Pi)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[9px] font-mono text-zinc-600 leading-loose">
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400 mb-1"># Execute Scraping Pipeline</p>
              <code className="bg-black px-2 py-1 rounded">npx tsx scripts/pulse-run.ts</code>
            </div>
            <div>
              <p className="text-zinc-400 mb-1"># Start Master Sentinel Loop</p>
              <code className="bg-black px-2 py-1 rounded">python3 scripts/sentinel.py</code>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400 mb-1"># Run Archive Pruning Bot</p>
              <code className="bg-black px-2 py-1 rounded">python3 scripts/prune_archive.py</code>
            </div>
            <div>
              <p className="text-zinc-400 mb-1"># Synchronize Neural Latent Space</p>
              <code className="bg-black px-2 py-1 rounded">python3 scripts/neural_sync.py</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
