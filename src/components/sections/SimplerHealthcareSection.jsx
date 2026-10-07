import React from 'react';
import { FileText, Users, CheckCircle2 } from 'lucide-react';

export default function SimplerHealthcareSection() {
  const threePillars = [
    {
      num: '01',
      title: 'Tell us what you need',
      description: 'Upload a prescription, medical order, or simply tell us what kind of care you need.',
      icon: FileText
    },
    {
      num: '02',
      title: 'We help coordinate it',
      description: 'We help you find suitable options from our healthcare partners and coordinate the next steps.',
      icon: Users
    },
    {
      num: '03',
      title: 'You stay in control',
      description: 'Review your options, choose what works for you, and manage the service from one place.',
      icon: CheckCircle2
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-mesh-purple relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-extrabold uppercase tracking-wider text-purple-700 shadow-2xs">
            WHAT HEALTH EXPRESS DOES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            One Place, One Step. <span className="gradient-text-purple">We do the Rest.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Instead of navigating multiple websites, diagnostic centers, and clinics — let Health Express coordinate the journey for you.
          </p>
        </div>

        {/* 3 Step Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {threePillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div 
                key={pillar.num}
                className="glass-card hover:bg-white border border-purple-100 rounded-3xl p-8 transition-all duration-300 card-interactive text-left space-y-5 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-purple-800 transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-purple-100 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                    {pillar.num}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
