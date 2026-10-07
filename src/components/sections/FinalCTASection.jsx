import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TestTube2, Home, Pill, Stethoscope, ArrowRight, Upload, 
  ShieldCheck, CheckCircle2, HeartPulse, Activity, Sparkles, MessageSquare
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function FinalCTASection({ onOpenUploadModal }) {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 relative overflow-hidden">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ===================================================
            1. SECTION HEADER: EDITORIAL HEALTHCARE POSITIONING
           =================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>ONE PLATFORM. EVERY HEALTHCARE NEED.</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            From a test to{' '}
            <span className="text-purple-700 underline decoration-purple-200 underline-offset-4 decoration-2">
              ongoing care
            </span>
            , we're with you.
          </h2>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Discover, book and coordinate healthcare services for you and your family — from diagnostics and home care to medicines and specialist support.
          </p>

        </div>

        {/* ===================================================
            2. CENTRAL ECOSYSTEM FLOW CONNECTOR
           =================================================== */}
        <div className="hidden md:flex items-center justify-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider py-2 border-y border-slate-200/60 max-w-4xl mx-auto">
          <span className="flex items-center gap-1.5 text-purple-900 font-extrabold">
            <TestTube2 className="w-4 h-4 text-purple-700" /> Diagnostics
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1.5 text-purple-900 font-extrabold">
            <Home className="w-4 h-4 text-purple-700" /> Healthcare
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1.5 text-purple-900 font-extrabold">
            <Activity className="w-4 h-4 text-purple-700" /> Care Coordination
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
            <HeartPulse className="w-4 h-4 text-emerald-600" /> Family Health
          </span>
        </div>

        {/* ===================================================
            3. BENTO HEALTHCARE ECOSYSTEM GRID
           =================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* -------------------------------------------------
              CARD 1 — DIAGNOSTICS (ANCHOR CARD - SPANS 7 COLS ON DESKTOP)
             ------------------------------------------------- */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100/60 transition-colors pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              
              {/* Category & Status Row */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  Diagnostics & Lab
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-extrabold px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Home sample collection
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-700/20 group-hover:scale-105 transition-transform">
                  <TestTube2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-2">
                  Diagnostics & Lab Tests
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                  Book diagnostic tests, health packages and home sample collection across certified partner laboratories with digital report delivery.
                </p>
              </div>

              {/* Visual Preview Snippet */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-700" />
                  Popular Tests & Packages Included:
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Full Body Checkup</span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Lipid & Cardiac Profile</span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Thyroid & Diabetes</span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">Vitamin D & B12</span>
                </div>
              </div>

            </div>

            {/* CTA Link */}
            <div className="pt-6 relative z-10">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-700 group-hover:text-purple-900 group-hover:translate-x-1 transition-all"
              >
                <span>Explore Diagnostics →</span>
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------
              CARD 2 — HOME HEALTHCARE (SPANS 5 COLS ON DESKTOP)
             ------------------------------------------------- */}
          <div className="md:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100/50 transition-colors pointer-events-none" />

            <div className="space-y-6 relative z-10">
              
              {/* Category & Status Row */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  Home Services
                </span>
                <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 border border-purple-200/80 text-[11px] font-extrabold px-3 py-1 rounded-full">
                  <Home className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  Care at Home
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-2">
                  Home Healthcare
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Professional nursing and care services, coordinated around your family by verified medical care experts.
                </p>
              </div>

              {/* Image / Feature Snippet */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs relative h-28">
                <img 
                  src="/hero_home_care.jpg" 
                  alt="Home Healthcare Professional" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Nursing • Eldercare • Post-Op Recovery
                  </span>
                </div>
              </div>

            </div>

            {/* CTA Link */}
            <div className="pt-6 relative z-10">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-700 group-hover:text-purple-900 group-hover:translate-x-1 transition-all"
              >
                <span>Explore Home Care →</span>
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------
              CARD 3 — MEDICINES & HEALTH PRODUCTS (SPANS 6 COLS ON DESKTOP)
             ------------------------------------------------- */}
          <div className="md:col-span-6 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  Pharmacy & Supplies
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                  Verified Distributors
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-700/20 group-hover:scale-105 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-2">
                  Medicines & Health Products
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Find the healthcare products and medicines you need with guidance from our care team.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Prescription Refills</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Chronic Care Products</span>
                </div>
              </div>

            </div>

            <div className="pt-6 relative z-10">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-700 group-hover:text-purple-900 group-hover:translate-x-1 transition-all"
              >
                <span>Explore Products →</span>
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------
              CARD 4 — SPECIALIST & PREVENTIVE CARE (SPANS 6 COLS ON DESKTOP)
             ------------------------------------------------- */}
          <div className="md:col-span-6 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  Preventive Care
                </span>
                <span className="text-xs font-extrabold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/80">
                  Proactive Health
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-800 text-white flex items-center justify-center shadow-md shadow-purple-800/20 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-2">
                  Specialist & Preventive Care
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Explore specialist services, procedures and preventive healthcare designed for long-term wellness.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Specialist Consults</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Annual Health Checks</span>
                </div>
              </div>

            </div>

            <div className="pt-6 relative z-10">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-700 group-hover:text-purple-900 group-hover:translate-x-1 transition-all"
              >
                <span>Explore Care →</span>
              </Link>
            </div>
          </div>

        </div>

        {/* ===================================================
            4. PRESCRIPTION UPLOAD & HEALTH MANAGER COORDINATION CTA
           =================================================== */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl shadow-purple-900/5 max-w-4xl mx-auto relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Not sure what you need?
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Upload your prescription and let our care team help coordinate the next step.
              </p>
              <div className="pt-1 flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>No account required • Private & secure</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
              
              {/* Primary CTA: Upload Prescription */}
              <button
                onClick={onOpenUploadModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm shadow-lg shadow-purple-700/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 touch-target"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>Upload Prescription →</span>
              </button>

            </div>

          </div>

          {/* Subtle WhatsApp contact action (No duplicate "WhatsApp Us" text) */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-slate-600 text-center sm:text-left">
            <span>Prefer to talk directly?</span>
            <button
              onClick={() => openWhatsApp("Hello Health Express! I'd like to speak with a Health Manager regarding my healthcare needs.")}
              className="inline-flex items-center gap-1.5 text-purple-700 font-bold hover:text-purple-900 hover:underline transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-current" />
              <span>Need help? Talk to your Health Manager →</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
