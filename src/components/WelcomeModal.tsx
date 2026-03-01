"use client";

import { useState, useEffect } from "react";
import { X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the modal or submitted
    const hasSeenModal = localStorage.getItem("auvra_welcome_modal");
    
    if (!hasSeenModal) {
      // Trigger after 5 seconds of browsing
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      // Or trigger on exit intent (mouse leaves viewport)
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsOpen(true);
        }
      };
      
      document.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("auvra_welcome_modal", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        localStorage.setItem("auvra_welcome_modal", "true");
        
        // Auto close after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error("Subscription error:", err);
      alert('Failed to connect to the network. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="bg-zinc-900 text-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative z-10 animate-in zoom-in-95 fade-in duration-300 shadow-2xl border border-zinc-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-32 bg-yellow-400 blur-[100px] opacity-10 rounded-full pointer-events-none" />
        
        <button 
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
              <Zap size={10} className="fill-black" /> Pulse Network Access
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 leading-tight">
              Unlock the <br /> Inner Archive.
            </h2>
            
            <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
              Join the Auvra Pulse network to get <span className="text-white font-bold">10% off</span> your first Curation Fee and 1-hour early access to daily drops.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-zinc-500 transition-colors font-medium placeholder:text-zinc-500"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 group"
              >
                Secure Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-6">
              No spam. Just pure archive curation.
            </p>
          </div>
        ) : (
          <div className="relative z-10 text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={24} className="text-green-400 fill-green-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-4">Access Granted.</h2>
            <p className="text-zinc-500 font-medium">Check your inbox for your exclusive access link and discount code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
