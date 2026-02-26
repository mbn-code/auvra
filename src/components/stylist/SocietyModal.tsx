"use client";

import React from 'react';
import { X, ShieldCheck, Zap, Mail, Crown, ArrowRight } from 'lucide-react';

interface SocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  feature: 'save' | 'export';
}

export function SocietyModal({ isOpen, onClose, title, description, feature }: SocietyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl border border-zinc-100 animate-in zoom-in-95 fade-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-zinc-400 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-8 shadow-xl">
            <Crown size={24} className="text-yellow-400" />
          </div>

          <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">{title}</h2>
          <p className="text-zinc-500 font-medium mb-10 leading-relaxed px-4">{description}</p>

          <div className="w-full space-y-4 mb-10">
            <div className="flex items-start gap-4 text-left bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div className="mt-1 text-zinc-900"><ShieldCheck size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Permanent Archive</p>
                <p className="text-[11px] text-zinc-500 font-medium leading-tight">Society members get unlimited cloud storage for neural lookbooks.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-left bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div className="mt-1 text-zinc-900"><Mail size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">DNA Briefs</p>
                <p className="text-[11px] text-zinc-500 font-medium leading-tight">Receive high-fidelity PDF summaries of your aesthetics via email.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div className="mt-1 text-zinc-900"><Zap size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Neural Continuity</p>
                <p className="text-[11px] text-zinc-500 font-medium leading-tight">Your aesthetic centroid is remembered across all your devices.</p>
              </div>
            </div>
          </div>

          <a 
            href="/membership"
            className="w-full py-6 rounded-full bg-black text-white text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            Join The Society <ArrowRight size={16} />
          </a>
          
          <button 
            onClick={onClose}
            className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
          >
            Continue Manifesting as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
