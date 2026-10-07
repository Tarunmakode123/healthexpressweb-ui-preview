import React, { useState, useMemo } from 'react';
import { Thermometer, AlertTriangle, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { Link } from 'react-router-dom';

export default function TemperatureTool() {
  const [tempInput, setTempInput] = useState(101.4);
  const [unit, setUnit] = useState('F'); // 'F' or 'C'
  const [ageGroup, setAgeGroup] = useState('adult');

  const evaluation = useMemo(() => {
    const val = parseFloat(tempInput) || 98.6;
    let tempF = 0;
    let tempC = 0;

    if (unit === 'F') {
      tempF = val;
      tempC = ((val - 32) * 5) / 9;
    } else {
      tempC = val;
      tempF = (val * 9) / 5 + 32;
    }

    let category = '';
    let categoryColor = '';
    let gaugeColor = '';
    let isRedFlag = false;
    let guidance = '';

    if (tempF < 97.0) {
      category = 'Below Usual Temperature Range';
      categoryColor = 'text-sky-800 border-sky-200 bg-sky-50';
      gaugeColor = 'bg-sky-500';
      guidance = 'Body temperature can fluctuate with room temperature or measurement method. Keep warm and re-check in 15 minutes.';
    } else if (tempF <= 99.0) {
      category = 'Normal Body Temperature';
      categoryColor = 'text-emerald-800 border-emerald-200 bg-emerald-50';
      gaugeColor = 'bg-emerald-500';
      guidance = 'Your temperature is within standard normal healthy reference limits.';
    } else if (tempF <= 100.4) {
      category = 'Low-Grade / Slightly Elevated';
      categoryColor = 'text-amber-800 border-amber-200 bg-amber-50';
      gaugeColor = 'bg-amber-400';
      guidance = 'Slightly elevated temperature can be a mild response to fatigue or minor immune activity. Ensure fluid intake and rest.';
    } else if (tempF <= 102.9) {
      category = 'Moderate Fever';
      categoryColor = 'text-amber-900 border-amber-300 bg-amber-100/70';
      gaugeColor = 'bg-amber-600';
      guidance = 'Moderate fever indicates an active immune response. Stay hydrated and rest. Consult a physician if fever persists over 48 hours.';
    } else {
      category = 'High Fever — Red Flag Warning';
      categoryColor = 'text-rose-900 border-rose-300 bg-rose-50';
      gaugeColor = 'bg-rose-600';
      isRedFlag = true;
      guidance = 'High fever requires prompt medical attention. If accompanied by severe headache, stiff neck, or breathing difficulty, seek urgent care.';
    }

    if (ageGroup === 'child' && tempF >= 100.4) {
      guidance += ' Note: For infants under 3 months, any fever ≥100.4°F (38.0°C) requires urgent medical evaluation.';
    }

    return {
      tempF: tempF.toFixed(1),
      tempC: tempC.toFixed(1),
      category,
      categoryColor,
      gaugeColor,
      isRedFlag,
      guidance
    };
  }, [tempInput, unit, ageGroup]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: CONTROLS & SLIDERS (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Question Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider">
            <Thermometer className="w-3.5 h-3.5 text-amber-600" />
            <span>FEVER & TEMPERATURE CHECK</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            Is my temperature concerning?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Use the control below to enter your reading in °F or °C for immediate clinical guidance.
          </p>
        </div>

        {/* Form Inputs & Sliders */}
        <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          
          {/* Unit Toggle & Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Recorded Temperature
              </label>

              {/* °F / °C Unit Switch Pills */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setUnit('F')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-md transition-colors ${
                    unit === 'F' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  °F
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('C')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-md transition-colors ${
                    unit === 'C' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  °C
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  step="0.1"
                  min={unit === 'F' ? 95 : 35}
                  max={unit === 'F' ? 106 : 41}
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-base font-black text-slate-900 text-center focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="text-sm font-extrabold text-slate-700">°{unit}</span>
              </div>

              <input
                type="range"
                step="0.1"
                min={unit === 'F' ? 95 : 35}
                max={unit === 'F' ? 106 : 41}
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>

          {/* Age Group Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Age Group
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'child', label: 'Child (0-12)' },
                { key: 'teen', label: 'Teen (13-17)' },
                { key: 'adult', label: 'Adult (18-64)' },
                { key: 'older', label: 'Older Adult' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setAgeGroup(item.key)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-extrabold transition-all ${
                    ageGroup === item.key
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
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
          * This utility is informational and does not diagnose infections or prescribe medications.
        </p>

      </div>

      {/* RIGHT COLUMN: THERMAL GAUGE RESULT (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className={`p-6 sm:p-7 rounded-3xl border ${evaluation.categoryColor} space-y-5 shadow-lg transition-all`}>
          
          {/* Large Dual Temperature Display */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                THERMAL CONVERSION
              </span>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {evaluation.tempF}°F
                </span>
                <span className="text-slate-400 font-bold text-lg">=</span>
                <span className="text-2xl font-black text-slate-700 font-mono tracking-tight">
                  {evaluation.tempC}°C
                </span>
              </div>
            </div>

            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full text-white ${evaluation.gaugeColor}`}>
              {evaluation.category}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
            {evaluation.guidance}
          </p>

          {evaluation.isRedFlag && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>If accompanied by severe headache, stiff neck, or breathing difficulty, seek emergency medical care.</span>
            </div>
          )}

          {/* Ecosystem CTA */}
          <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-700 font-bold">Need medical help or nursing care?</span>
            <button
              type="button"
              onClick={() => openWhatsApp(`Namaste Health Express! I checked a temperature reading (${evaluation.tempF}°F / ${evaluation.tempC}°C) and would like to speak with a Health Manager.`)}
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
