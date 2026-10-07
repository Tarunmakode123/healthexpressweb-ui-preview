import React, { useState, useMemo } from 'react';
import { HeartPulse, Activity, AlertTriangle, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { Link } from 'react-router-dom';

export default function BloodPressureTool() {
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);

  // Compute live visual BP indicator position & clinical category
  const evaluation = useMemo(() => {
    const sys = parseInt(systolic, 10) || 120;
    const dia = parseInt(diastolic, 10) || 80;

    let category = '';
    let statusText = '';
    let categoryColor = '';
    let badgeBg = '';
    let percentage = 20; // Default normal position on gauge (0-100%)
    let isRedFlag = false;

    if (sys > 180 || dia > 120) {
      category = 'Hypertensive Crisis (Red Flag Warning)';
      statusText = 'Significantly elevated reading. Seek urgent medical attention if feeling unwell.';
      categoryColor = 'text-rose-700 border-rose-300 bg-rose-50';
      badgeBg = 'bg-rose-600 text-white';
      percentage = 95;
      isRedFlag = true;
    } else if (sys >= 140 || dia >= 90) {
      category = 'Above Usual Adult Range (Stage 2)';
      statusText = 'Your reading is above the usual adult range. Rest for 5 minutes and re-check.';
      categoryColor = 'text-amber-800 border-amber-300 bg-amber-50';
      badgeBg = 'bg-amber-600 text-white';
      percentage = 75;
    } else if (sys >= 130 || dia >= 80) {
      category = 'Slightly Above Usual Range (Stage 1)';
      statusText = 'Reading is slightly above the ideal range. Stress or recent activity can temporarily raise BP.';
      categoryColor = 'text-amber-700 border-amber-200 bg-amber-50/60';
      badgeBg = 'bg-amber-500 text-white';
      percentage = 50;
    } else if (sys >= 120 && dia < 80) {
      category = 'Elevated Adult Range';
      statusText = 'Systolic reading is slightly elevated while diastolic remains standard.';
      categoryColor = 'text-yellow-800 border-yellow-200 bg-yellow-50';
      badgeBg = 'bg-yellow-500 text-white';
      percentage = 35;
    } else if (sys < 90 || dia < 60) {
      category = 'Below Usual Range (Low BP)';
      statusText = 'Reading is below standard range. Ensure adequate hydration and rest.';
      categoryColor = 'text-sky-800 border-sky-200 bg-sky-50';
      badgeBg = 'bg-sky-600 text-white';
      percentage = 8;
    } else {
      category = 'Normal Adult Blood Pressure Range';
      statusText = 'Your reading falls within standard healthy adult reference levels.';
      categoryColor = 'text-emerald-800 border-emerald-200 bg-emerald-50';
      badgeBg = 'bg-emerald-600 text-white';
      percentage = 22;
    }

    return { sys, dia, category, statusText, categoryColor, badgeBg, percentage, isRedFlag };
  }, [systolic, diastolic]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: INPUT CONTROLS & SLIDERS (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Question Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-extrabold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>BLOOD PRESSURE INTERPRETATION</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            What does my BP reading mean?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Adjust the sliders or enter your Systolic and Diastolic values for instant clinical context.
          </p>
        </div>

        {/* Form Inputs & Sliders */}
        <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          
          {/* Systolic Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Systolic (Top Number)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="70"
                  max="220"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-extrabold text-slate-900 text-center focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <span className="text-[11px] font-bold text-slate-500">mmHg</span>
              </div>
            </div>
            <input
              type="range"
              min="70"
              max="220"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Diastolic Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Diastolic (Bottom Number)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-extrabold text-slate-900 text-center focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <span className="text-[11px] font-bold text-slate-500">mmHg</span>
              </div>
            </div>
            <input
              type="range"
              min="40"
              max="140"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Quick presets:</span>
            <button
              type="button"
              onClick={() => { setSystolic(120); setDiastolic(80); }}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              120/80 Normal
            </button>
            <button
              type="button"
              onClick={() => { setSystolic(135); setDiastolic(85); }}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              135/85 Stage 1
            </button>
          </div>

        </div>

        <p className="text-[11px] text-slate-500 italic leading-relaxed">
          * This utility provides general reference categories. It does not diagnose medical conditions.
        </p>

      </div>

      {/* RIGHT COLUMN: INTERACTIVE VISUAL BP GAUGE RESULT (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className={`p-6 sm:p-7 rounded-3xl border ${evaluation.categoryColor} space-y-6 shadow-lg transition-all`}>
          
          {/* Top Reading Highlight */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                CURRENT READING
              </span>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight pt-0.5">
                {evaluation.sys} / {evaluation.dia} <span className="text-sm text-slate-500 font-semibold font-sans">mmHg</span>
              </div>
            </div>

            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${evaluation.badgeBg}`}>
              {evaluation.category}
            </span>
          </div>

          {/* VISUAL BP GAUGE BAR */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <span>LOW</span>
              <span>NORMAL</span>
              <span>STAGE 1</span>
              <span>HIGH</span>
            </div>

            {/* Gauge Track */}
            <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div className="w-[15%] bg-sky-400" />
              <div className="w-[30%] bg-emerald-500" />
              <div className="w-[25%] bg-amber-400" />
              <div className="w-[30%] bg-rose-500" />

              {/* Indicator Dot Pointer */}
              <div 
                className="absolute top-0 bottom-0 w-3 bg-slate-950 rounded-full border-2 border-white shadow-md transition-all duration-300 -ml-1.5"
                style={{ left: `${evaluation.percentage}%` }}
              />
            </div>
          </div>

          {/* Category Description */}
          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
            {evaluation.statusText}
          </p>

          {evaluation.isRedFlag && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>If accompanied by severe headache, chest tightness, or shortness of breath, seek emergency medical care immediately.</span>
            </div>
          )}

          {/* Ecosystem CTA */}
          <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-700 font-bold">Want to discuss your result?</span>
            <button
              type="button"
              onClick={() => openWhatsApp(`Namaste Health Express! I evaluated my BP reading (${evaluation.sys}/${evaluation.dia} mmHg) on your site and would like to speak with a Health Manager.`)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Talk to Health Manager</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
