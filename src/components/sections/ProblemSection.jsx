import React from 'react';
import { Layers } from 'lucide-react';

export default function ProblemSection() {
  const painPoints = [
    "Finding a reliable healthcare provider",
    "Comparing prices & diagnostic options",
    "Scheduling a home sample visit or nursing care",
    "Following up on reports & digital records",
    "Managing healthcare for your parents or children"
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50/40 via-white to-slate-50/60 text-slate-900 border-y border-purple-100/60 relative overflow-hidden text-left">
      
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-extrabold uppercase tracking-widest text-purple-900 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-purple-700" />
            <span>THE HEALTHCARE CHALLENGE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            Healthcare shouldn't feel like a <span className="text-purple-700">second job.</span>
          </h2>

          <div className="bg-white p-7 sm:p-10 rounded-3xl space-y-6 text-left shadow-xl shadow-purple-900/5 border border-purple-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {painPoints.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/50 transition-all hover:translate-x-1 group"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px] group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    ✕
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-purple-950 transition-colors">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-slate-100 text-xs sm:text-sm font-extrabold text-purple-900 text-center bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
              ⚡ Health Express brings these tasks together, so you don't have to manage healthcare across multiple places.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
