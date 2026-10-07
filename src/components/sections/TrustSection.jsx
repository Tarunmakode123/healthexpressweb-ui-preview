import React from 'react';
import { ShieldCheck, Award, Eye } from 'lucide-react';

export default function TrustSection() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Verified healthcare providers',
      description: 'Partner network with quality and service checks.'
    },
    {
      icon: Award,
      title: 'Accredited diagnostic partners',
      description: 'Access diagnostic services through trusted partner laboratories.'
    },
    {
      icon: Eye,
      title: 'Transparent options before you decide',
      description: 'See clear pricing, service details, and provider options upfront.'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-mesh-purple border-t border-purple-100/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-extrabold uppercase tracking-wider text-purple-700 shadow-2xs">
            TRUST & SAFETY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Healthcare coordination <span className="gradient-text-purple">you can trust.</span>
          </h2>
        </div>

        {/* 3 Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
          {trustItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx}
                className="glass-card hover:bg-white p-7 rounded-3xl border border-purple-100/80 shadow-xs hover-glow space-y-4 text-left group transition-all min-h-[240px] h-full flex flex-col justify-between"
              >
                <div className="space-y-4 flex-1 flex flex-col justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-purple-800 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors min-h-[3rem] flex items-center">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium flex-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
