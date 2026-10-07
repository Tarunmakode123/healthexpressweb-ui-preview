import React, { useState, useEffect } from 'react';
import { 
  X, Scale, Flame, Zap, Target, Activity, Droplet, HeartPulse, 
  Calendar, Heart, Sparkles, MessageSquare, ShieldCheck, ArrowRight, RefreshCw 
} from 'lucide-react';
import { CALCULATORS } from '../../data/calculators';
import { openWhatsApp } from '../../utils/whatsapp';

const iconMap = {
  Scale, Flame, Zap, Target, Activity, Droplet, HeartPulse, Calendar, Heart, Sparkles
};

export default function CalculatorModal({ isOpen, calculatorSlug, onClose }) {
  const [currentCalc, setCurrentCalc] = useState(null);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    if (!calculatorSlug) {
      setCurrentCalc(CALCULATORS[0]);
    } else {
      const found = CALCULATORS.find(c => c.slug === calculatorSlug || c.id === calculatorSlug);
      setCurrentCalc(found || CALCULATORS[0]);
    }
  }, [calculatorSlug, isOpen]);

  useEffect(() => {
    if (currentCalc && currentCalc.inputs) {
      const initial = {};
      currentCalc.inputs.forEach(input => {
        initial[input.id] = input.default;
      });
      setFormValues(initial);
    }
  }, [currentCalc]);

  if (!isOpen || !currentCalc) return null;

  const IconComp = iconMap[currentCalc.iconName] || Scale;

  const handleInputChange = (id, val) => {
    setFormValues(prev => ({ ...prev, [id]: val }));
  };

  const result = currentCalc.calculate ? currentCalc.calculate(formValues) : null;

  const handleWhatsAppCTA = () => {
    if (result && result.cta) {
      openWhatsApp(result.cta.message);
    } else {
      openWhatsApp(`Hello Health Express! I am using the ${currentCalc.title} on your website and would like assistance from a Health Manager.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto pointer-events-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100/80 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200 text-left">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-700/80 border border-purple-500/40 flex items-center justify-center text-purple-200 shrink-0">
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-800/80 text-purple-200 border border-purple-600/40">
                {currentCalc.categoryName}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">{currentCalc.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-purple-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {currentCalc.shortDesc}
          </p>

          {/* Form Inputs & Sliders */}
          <div className="space-y-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100/70">
            {currentCalc.inputs.map((input) => (
              <div key={input.id} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <label htmlFor={`modal-input-${input.id}`}>{input.label}</label>
                  {input.type === 'number' && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-purple-200 font-extrabold text-purple-900 shadow-2xs">
                      {formValues[input.id] || input.default}
                    </span>
                  )}
                </div>

                {input.type === 'select' ? (
                  <select
                    id={`modal-input-${input.id}`}
                    value={formValues[input.id] || input.default}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {input.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : input.type === 'date' ? (
                  <input
                    type="date"
                    id={`modal-input-${input.id}`}
                    value={formValues[input.id] || input.default}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-purple-600"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step || 1}
                      value={formValues[input.id] || input.default}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full accent-purple-700 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{input.min}</span>
                      <span>{input.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Real-time Calculation Result Card */}
          {result && (
            <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-purple-800/40 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {result.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Validated Formula
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">{result.mainValue}</span>
                <span className="text-sm font-extrabold text-purple-200">{result.unit}</span>
              </div>

              <p className="text-xs text-slate-200 font-medium leading-relaxed bg-purple-950/60 p-3 rounded-xl border border-purple-800/40">
                {result.summary}
              </p>

              {/* Detailed Breakdown list */}
              {result.details && result.details.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-purple-900/60 text-xs">
                  {result.details.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 font-medium">
                      <span>{item.label}:</span>
                      <strong className="text-white">{item.value}</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Health Manager Conversion CTA */}
              {result.cta && (
                <div className="pt-3 border-t border-purple-800/60 space-y-2">
                  <div className="text-xs font-bold text-purple-200">
                    {result.cta.title}
                  </div>
                  <button
                    onClick={handleWhatsAppCTA}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>{result.cta.btnText}</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-medium">
            <strong>Disclaimer:</strong> {currentCalc.disclaimer}
          </div>

        </div>

      </div>
    </div>
  );
}
