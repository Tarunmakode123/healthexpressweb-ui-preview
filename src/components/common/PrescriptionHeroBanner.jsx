import React from 'react';
import { Upload, FileText, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function PrescriptionHeroBanner({ onOpenUploadModal }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-purple-800/60 shadow-xl relative overflow-hidden my-6">
      
      {/* Background Ambient Glow & Graphic Accent */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* Left Copy Column */}
        <div className="space-y-2 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>HAVE A DOCTOR'S PRESCRIPTION?</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Upload Your Prescription & <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">We Do the Rest.</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Upload your prescription file or doctor order. Our dedicated Health Manager will parse your required tests, check partner lab slots, and arrange convenient home collection in minutes.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200 pt-1 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>NABL Lab Verification</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-300 shrink-0" />
              <span>Digital Report Delivery</span>
            </span>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={onOpenUploadModal}
            className="w-full md:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-purple-950/50 border border-purple-400/30 transition-all hover:scale-105 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer touch-target"
          >
            <Upload className="w-4.5 h-4.5" />
            <span>Upload Prescription Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
