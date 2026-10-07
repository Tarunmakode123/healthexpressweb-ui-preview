import React from 'react';
import { Users, Home, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WhyHealthExpressSection() {
  const benefits = [
    {
      num: '01',
      title: 'Family profiles and shared care coordination',
      description: 'Manage healthcare needs across your household — from diagnostics to home nursing — with unified care coordination.',
      icon: Users
    },
    {
      num: '02',
      title: 'Home-based diagnostics and nursing support',
      description: 'Receive certified phlebotomists for home sample collection and professional nursing care where it is most comfortable.',
      icon: Home
    },
    {
      num: '03',
      title: 'A dedicated care team for updates, follow-ups, and next steps',
      description: 'A human care manager assists you with partner slot verification, prescription coordination, and clear next steps.',
      icon: HeartHandshake
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50/30 via-white to-slate-50 border-t border-purple-100/60 relative overflow-hidden" id="care-commitment">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-purple-100/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>OUR CARE COMMITMENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Healthcare shouldn't <span className="text-purple-700">feel complicated.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Healthcare can be fragmented. Health Express brings multiple services, partner providers, and care coordination together.
          </p>
        </div>

        {/* 3 Card Strip Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {benefits.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.num}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group text-left flex flex-col justify-between space-y-5 relative overflow-hidden min-h-[260px] h-full"
              >
                <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-700/20 group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                      BENEFIT {item.num}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col justify-start">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors leading-snug min-h-[3.25rem] flex items-center">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed flex-1 min-h-[3.5rem]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Coordinated Care Standard</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
