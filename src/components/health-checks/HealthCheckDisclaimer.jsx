import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function HealthCheckDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium text-center pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span>Informational tool only. Not a substitute for professional medical advice.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1.5">
      <div className="flex items-center gap-2 text-slate-800 font-bold">
        <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
        <span>Medical Disclaimer & Safety Guidance</span>
      </div>
      <p className="leading-relaxed">
        These tools provide general information for everyday wellness tracking and organization. They do not diagnose conditions, prescribe medications, or replace direct consultation with a qualified healthcare professional.
      </p>
      <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px] pt-0.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>If you are experiencing severe, sudden, or emergency symptoms, seek immediate emergency medical care.</span>
      </div>
    </div>
  );
}
