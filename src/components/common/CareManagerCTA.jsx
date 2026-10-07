import React, { useState, useEffect } from 'react';
import { PhoneCall } from 'lucide-react';
import { HEALTH_MANAGER_PHONE, HEALTH_MANAGER_DISPLAY_PHONE } from '../../config/constants';

export default function CareManagerCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating Care Manager CTA only after scrolling past hero section (250px)
      // This prevents overlapping hero section buttons like "Upload Prescription"
      setIsVisible(window.scrollY > 250);
    };

    // Run on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside aria-label="Direct Phone Assistance" className="fixed bottom-20 left-4 z-40 sm:left-6 sm:bottom-6 animate-in slide-in-from-bottom-3 duration-300">
      <a
        href={`tel:${HEALTH_MANAGER_PHONE}`}
        title={`Call Health Manager (${HEALTH_MANAGER_DISPLAY_PHONE})`}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-xl shadow-slate-900/25 border border-purple-400/30 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-bold"
      >
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <PhoneCall className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="hidden xs:inline text-slate-100 font-extrabold tracking-wide">
          Talk to your Health Manager
        </span>
        <span className="xs:hidden text-slate-100 font-extrabold">
          Call Health Manager
        </span>
      </a>
    </aside>
  );
}
