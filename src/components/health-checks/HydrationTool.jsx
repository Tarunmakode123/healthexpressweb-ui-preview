import React, { useState, useMemo } from 'react';
import { Droplet, Activity, Sun, MessageSquare, ArrowRight } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { Link } from 'react-router-dom';

export default function HydrationTool() {
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState('kg');
  const [activity, setActivity] = useState('moderate');
  const [climate, setClimate] = useState('moderate');

  const evaluation = useMemo(() => {
    const w = parseFloat(weight) || 70;
    const weightKg = weightUnit === 'lbs' ? w * 0.453592 : w;

    let fluidMl = weightKg * 35;
    if (activity === 'moderate') fluidMl += 350;
    if (activity === 'high') fluidMl += 700;
    if (climate === 'hot') fluidMl += 400;

    const targetLiters = (fluidMl / 1000).toFixed(1);
    const glasses = Math.round(fluidMl / 250);

    const morningL = (targetLiters * 0.35).toFixed(1);
    const afternoonL = (targetLiters * 0.45).toFixed(1);
    const eveningL = (targetLiters * 0.20).toFixed(1);

    return { targetLiters, glasses, morningL, afternoonL, eveningL };
  }, [weight, weightUnit, activity, climate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: INPUT CONTROLS & SLIDERS (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Question Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200 text-[11px] font-extrabold uppercase tracking-wider">
            <Droplet className="w-3.5 h-3.5 text-sky-600 fill-current" />
            <span>DAILY HYDRATION TARGET</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            Am I drinking enough water?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Calculate your estimated daily fluid target based on your weight, activity level, and climate.
          </p>
        </div>

        {/* Form Inputs & Sliders */}
        <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          
          {/* Weight Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Body Weight
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-extrabold text-slate-900 text-center focus:ring-2 focus:ring-sky-500 outline-none"
                />

                <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-2 py-0.5 text-xs font-extrabold rounded transition-colors ${
                      weightUnit === 'kg' ? 'bg-sky-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-2 py-0.5 text-xs font-extrabold rounded transition-colors ${
                      weightUnit === 'lbs' ? 'bg-sky-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>

            <input
              type="range"
              min="30"
              max="160"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Activity Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Daily Activity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'sedentary', label: 'Desk / Light' },
                { key: 'moderate', label: 'Moderate' },
                { key: 'high', label: 'Heavy Exercise' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivity(item.key)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-extrabold transition-all ${
                    activity === item.key
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Climate Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Climate Context
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'moderate', label: 'Moderate Climate' },
                { key: 'hot', label: 'Hot / Humid Climate' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setClimate(item.key)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-extrabold transition-all ${
                    climate === item.key
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        <p className="text-[11px] text-slate-500 italic leading-relaxed">
          * Estimated fluid target. Individual needs vary based on health conditions, kidney health, and pregnancy.
        </p>

      </div>

      {/* RIGHT COLUMN: VISUAL DAY FLUID TARGET DISPLAY (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className="bg-sky-950 text-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl border border-sky-900 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-sky-800/80 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300">
                ESTIMATED FLUID TARGET
              </span>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-4xl font-black text-white font-mono">{evaluation.targetLiters} L</span>
                <span className="text-xs text-sky-200 font-semibold">/ day</span>
              </div>
            </div>

            <div className="bg-sky-900/90 border border-sky-700 px-3.5 py-2 rounded-2xl text-center">
              <span className="text-base font-extrabold text-sky-200 font-mono">~{evaluation.glasses}</span>
              <span className="text-[10px] text-sky-300 block font-medium">glasses (250ml)</span>
            </div>
          </div>

          {/* Time-of-Day Progress Visualization */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300 block">
              SUGGESTED TIME-OF-DAY BREAKDOWN:
            </span>

            {/* Morning */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-sky-200">
                <span>💧 Morning</span>
                <span className="font-mono">{evaluation.morningL} L</span>
              </div>
              <div className="h-2 w-full bg-sky-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Afternoon */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-sky-200">
                <span>💧 Afternoon</span>
                <span className="font-mono">{evaluation.afternoonL} L</span>
              </div>
              <div className="h-2 w-full bg-sky-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Evening */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-sky-200">
                <span>💧 Evening</span>
                <span className="font-mono">{evaluation.eveningL} L</span>
              </div>
              <div className="h-2 w-full bg-sky-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

          </div>

          {/* Ecosystem CTA */}
          <div className="pt-4 border-t border-sky-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-sky-200 font-medium">Explore preventive health services</span>
            <Link
              to="/services"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
