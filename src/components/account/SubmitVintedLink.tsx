"use client";

import { useState } from "react";
import { Link2, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function SubmitVintedLink() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.includes("vinted.")) {
      setStatus("error");
      setMessage("Please enter a valid Vinted listing URL.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/user/submit-vinted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit link");
      }

      setStatus("success");
      setMessage("Listing submitted! Our curation engine is analyzing it.");
      setUrl("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-zinc-50 rounded-full">
          <Link2 size={20} className="text-zinc-900" />
        </div>
        <div>
          <h4 className="text-lg font-black tracking-tight uppercase">Submit Listing</h4>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Earn curation fee shares
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="url"
            placeholder="https://www.vinted.fr/items/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="w-full pl-4 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50"
            required
          />
          {status === "loading" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 size={18} className="animate-spin text-zinc-400" />
            </div>
          )}
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">
            <AlertCircle size={14} />
            {message}
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 p-3 rounded-xl">
            <CheckCircle size={14} />
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || status === "success" || !url}
          className="w-full py-4 rounded-xl bg-black text-white text-center font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {status === "loading" ? "Processing..." : status === "success" ? "Submitted" : "Submit Link"}
        </button>

        {status === "success" && (
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="w-full text-center text-xs font-bold text-zinc-400 hover:text-black mt-2"
          >
            Submit another listing
          </button>
        )}
      </form>
    </div>
  );
}
