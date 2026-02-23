"use client";

import { useEffect, useState } from "react";
import "./marquee.css";

export default function AnnouncementMarquee() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const diff = nextHour.getTime() - now.getTime();
      const mins = Math.floor(diff / 1000 / 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const messages = [
    "AUTHENTICITY GUARANTEED ON ALL ARCHIVE PIECES",
    `NEXT ARCHIVE INJECTION IN ${timeLeft || "00:00"}`,
    "COMPLIMENTARY EU SHIPPING ON ORDERS OVER $150",
    "ONE-OF-ONE CURATED SELECTIONS",
    "REAL-TIME PULSE UPDATES EVERY 60 MINUTES",
    "SECURED BY AUVRA ARCHIVE INTEGRITY",
  ];

  return (
    <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap border-b border-white/10">
      <div className="marquee flex gap-12 items-center">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-12 items-center">
            {messages.map((msg, j) => (
              <span key={j} className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4">
                <span className="w-1 h-1 bg-white rounded-full" />
                {msg}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
