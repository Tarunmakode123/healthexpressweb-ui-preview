import React from 'react';
import { Users, HeartHandshake, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../../utils/whatsapp';

export default function FamilySection({ onOpenUploadModal }) {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50/40 via-white to-slate-50 border-y border-purple-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-extrabold uppercase tracking-wider text-purple-900">
              FOR YOUR FAMILY
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One health manager<br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent"> for the whole family.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Manage healthcare needs across your household — from a diagnostic test for yourself to professional home nursing for an elderly parent.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-bold text-purple-900 shadow-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Family profiles</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-bold text-purple-900 shadow-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Service coordination</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-bold text-purple-900 shadow-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Health records & reports</span>
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-700/20 transition-all hover:scale-[1.02]"
              >
                <span>Manage Family Healthcare</span>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100 group">
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src="/family_care.jpg"
                  alt="Multi-generational Indian family care with Health Express"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-600/90 text-white backdrop-blur-md">
                    Multi-Generational Care
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5 drop-shadow-sm">
                    Healthcare for parents, partner & children.
                  </h3>
                </div>
              </div>

              <div className="p-5 bg-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>Personal Care Manager Assistance</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Our team stays in touch to update you on report timings, home nursing schedules, and appointment follow-ups across your entire family.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
