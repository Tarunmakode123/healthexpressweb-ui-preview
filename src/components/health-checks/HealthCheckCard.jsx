import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HealthCheckCard({ id, title, description, icon: Icon, categoryBadge, badgeColor, onClick, spanCol = 'md:col-span-6' }) {
  return (
    <div 
      onClick={onClick}
      className={`${spanCol} bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden`}
    >
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-purple-50/70 rounded-full blur-xl group-hover:bg-purple-100/60 transition-colors pointer-events-none" />

      <div className="space-y-4 relative z-10">
        
        {/* Category Badge & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${badgeColor}`}>
            {categoryBadge}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {description}
          </p>
        </div>

      </div>

      {/* Action Prompt */}
      <div className="pt-5 flex items-center justify-between text-xs font-extrabold text-purple-700 group-hover:text-purple-900 relative z-10">
        <span className="flex items-center gap-1">
          <span>Start Quick Check</span>
        </span>
        <div className="w-7 h-7 rounded-full bg-purple-50 group-hover:bg-purple-700 group-hover:text-white flex items-center justify-center transition-colors">
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
