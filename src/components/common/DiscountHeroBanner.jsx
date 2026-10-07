import React from 'react';
import { MessageSquare } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function DiscountHeroBanner({ className = '' }) {
  const handleWhatsApp = () => {
    openWhatsApp("Hello Health Express! I would like to speak to my Health Manager regarding getting up to 70% discount on healthcare services.");
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-extrabold shadow-md border border-purple-500/30 ${className}`}>
      <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px] tracking-wide uppercase">
        OFFER
      </span>
      <span className="text-purple-100 font-extrabold">Get up to 70% discount</span>
      <span className="text-slate-500 hidden sm:inline">•</span>
      <button
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline cursor-pointer font-bold transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 fill-current" />
        <span>Talk to your Health Manager</span>
      </button>
    </div>
  );
}
