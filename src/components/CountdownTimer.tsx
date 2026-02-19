"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 52 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 14, seconds: 59 }; // Reset for psychological loop
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">
        Special Offer Ends In: {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </p>
    </div>
  );
}
