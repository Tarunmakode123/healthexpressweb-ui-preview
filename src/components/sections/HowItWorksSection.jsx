import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, CalendarCheck, Activity, CheckCircle2, ArrowRight, ShieldCheck, PhoneCall, UserCheck, HeartPulse, Play, Pause, Volume2, VolumeX, FlaskConical, FileText } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../../utils/whatsapp';

export default function HowItWorksSection({ onOpenUploadModal }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Book & Upload',
      shortDesc: 'Choose test or upload prescription instantly',
      detailTitle: 'Simple Request Submission',
      detailDesc: 'Upload your prescription file, doctor order, or select a diagnostic test or home care service from our catalog in seconds.',
      badge: 'Step 01 — Request & Upload',
      icon: Upload,
      visualType: 'upload',
      ctaText: 'Upload Prescription',
      ctaAction: 'upload'
    },
    {
      num: '02',
      title: 'Care Team Verification',
      shortDesc: 'Health Manager reviews requirement',
      detailTitle: 'Human Care Manager Verification',
      detailDesc: 'Our dedicated Health Manager reviews your request, verifies lab partner & phlebotomist slot availability, and confirms pricing with zero guesswork.',
      badge: 'Step 02 — Verification',
      icon: UserCheck,
      visualType: 'review',
      ctaText: 'Talk to Health Manager',
      ctaAction: 'whatsapp'
    },
    {
      num: '03',
      title: 'Home Collection & Testing',
      shortDesc: 'Doorstep pickup by trained phlebotomist',
      detailTitle: 'Hassle-Free Doorstep Sample Pickup',
      detailDesc: 'A certified phlebotomist visits your home at your scheduled time. Samples are safely transferred in temperature-controlled kits to NABL-accredited labs.',
      badge: 'Step 03 — Home Collection',
      icon: FlaskConical,
      visualType: 'coordinate',
      ctaText: 'Explore Available Services',
      ctaAction: 'services'
    },
    {
      num: '04',
      title: 'Express Digital Report',
      shortDesc: 'Verified PDF report in 6 hours',
      detailTitle: 'Quick & Easy Digital Report Access',
      detailDesc: 'Receive digitally signed PDF reports directly on WhatsApp and Email within 6 hours. Reports are also safely archived in your private patient vault.',
      badge: 'Step 04 — Report Delivery',
      icon: FileText,
      visualType: 'delivery',
      ctaText: 'Get Started Today',
      ctaAction: 'upload'
    }
  ];

  const currentStep = steps[activeStep];

  const handleCTA = (action) => {
    if (action === 'upload' && onOpenUploadModal) {
      onOpenUploadModal();
    } else if (action === 'whatsapp') {
      openWhatsApp(DEFAULT_MESSAGES.prescription);
    } else {
      window.location.href = '/services';
    }
  };

  return (
    <section className="py-12 md:py-16 bg-slate-950 text-white relative overflow-hidden" id="how-it-works">
      
      {/* Ambient Dark Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/80 border border-purple-700/80 text-purple-200 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            PATIENT HEALTH CHECKUP JOURNEY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            How Health Express <span className="text-purple-400">Works.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            A seamless, 4-step healthcare coordination journey from your home to verified NABL laboratories and digital report delivery.
          </p>
        </div>

        {/* CONNECTED PROCESS FLOW DIAGRAM (Dashed Wave Line) */}
        <div className="relative py-6 px-4 hidden md:block">
          {/* Dashed Connecting Wave Line */}
          <div className="absolute top-10 left-20 right-20 h-0.5 border-t-2 border-dashed border-purple-500/50 z-0 pointer-events-none" />

          <div className="grid grid-cols-4 gap-6 relative z-10">
            {steps.map((s, idx) => {
              const isActive = activeStep === idx;
              const IconComp = s.icon;
              return (
                <div 
                  key={s.num}
                  onClick={() => setActiveStep(idx)}
                  className="cursor-pointer transition-all duration-300 text-center flex flex-col items-center space-y-3 group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md relative ${
                    isActive 
                      ? 'bg-purple-600 text-white ring-4 ring-purple-500/40 scale-110 shadow-purple-600/50' 
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-purple-400 hover:text-white'
                  }`}>
                    <IconComp className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800">
                      {s.num}
                    </span>
                  </div>

                  <div className="space-y-1 max-w-[180px]">
                    <h4 className={`text-xs font-extrabold transition-colors ${isActive ? 'text-purple-300' : 'text-slate-200 group-hover:text-white'}`}>
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-2">
                      {s.shortDesc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP SELECTOR BAR (MOBILE ONLY) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const IconComp = s.icon;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-purple-900/90 border-purple-500 shadow-md text-white'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-purple-300">{s.num}</span>
                  <IconComp className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold truncate">{s.title}</h3>
              </button>
            );
          })}
        </div>

        {/* FEATURED WORKSPACE: ACTIVE STEP DETAILS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-10 shadow-2xl relative overflow-hidden text-left">
          
          <div key={activeStep} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-extrabold uppercase tracking-wider">
                {currentStep.badge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                {currentStep.detailTitle}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-medium">
                {currentStep.detailDesc}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => handleCTA(currentStep.ctaAction)}
                  className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{currentStep.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Visual Snippet */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-extrabold">
                    STAGE PREVIEW • {currentStep.num} OF 04
                  </span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>

                {currentStep.visualType === 'upload' && (
                  <div className="space-y-3 py-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
                      <Upload className="w-5 h-5 text-purple-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-white">Prescription / Order File</div>
                        <div className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-purple-950/60 border border-purple-800/80 rounded-xl text-[11px] text-purple-200 font-medium">
                      ✓ Instant upload to Health Express Care Manager
                    </div>
                  </div>
                )}

                {currentStep.visualType === 'review' && (
                  <div className="space-y-3 py-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-white">Dedicated Care Manager</div>
                        <div className="text-[10px] text-slate-400">Bengaluru Locality Specialist</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-[11px] text-emerald-200 font-medium">
                      ✓ Partner laboratory & nurse slot verification
                    </div>
                  </div>
                )}

                {currentStep.visualType === 'coordinate' && (
                  <div className="space-y-3 py-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
                      <FlaskConical className="w-5 h-5 text-purple-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-white">Doorstep Sample Collection</div>
                        <div className="text-[10px] text-slate-400">Temperature Controlled Transfer</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-purple-950/60 border border-purple-800/80 rounded-xl text-[11px] text-purple-200 font-medium">
                      ✓ Zero back-and-forth phone calls
                    </div>
                  </div>
                )}

                {currentStep.visualType === 'delivery' && (
                  <div className="space-y-3 py-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-white">Express PDF Report Delivery</div>
                        <div className="text-[10px] text-slate-400">Direct WhatsApp & Email PDF</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-[11px] text-emerald-200 font-medium">
                      ✓ Digital records saved in your patient vault
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
