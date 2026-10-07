import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Scale, Flame, Zap, Target, Activity, Droplet, HeartPulse, 
  Calendar, Heart, Sparkles, ChevronRight, ShieldCheck, MessageSquare, 
  ArrowRight, BookOpen, ExternalLink, PhoneCall
} from 'lucide-react';
import { CALCULATORS, getCalculatorBySlug } from '../data/calculators';
import { openWhatsApp } from '../utils/whatsapp';
import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

const iconMap = {
  Scale, Flame, Zap, Target, Activity, Droplet, HeartPulse, Calendar, Heart, Sparkles
};

export default function CalculatorDetailPage({ onOpenUploadModal }) {
  const { slug } = useParams();
  const calculator = getCalculatorBySlug(slug) || CALCULATORS[0];

  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    if (calculator && calculator.inputs) {
      const initial = {};
      calculator.inputs.forEach(input => {
        initial[input.id] = input.default;
      });
      setFormValues(initial);
    }
  }, [calculator]);

  const IconComp = iconMap[calculator.iconName] || Scale;

  const handleInputChange = (id, val) => {
    setFormValues(prev => ({ ...prev, [id]: val }));
  };

  const result = calculator.calculate ? calculator.calculate(formValues) : null;

  const handleWhatsAppCTA = () => {
    if (result && result.cta) {
      openWhatsApp(result.cta.message);
    } else {
      openWhatsApp(`Hello Health Express! I checked my results on the ${calculator.title} and would like to speak with a Health Manager.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-purple-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/health-calculators" className="hover:text-purple-700 transition-colors">Health Calculators</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-900 font-bold truncate max-w-[200px]">{calculator.title}</span>
        </nav>

        {/* HERO TITLE BLOCK */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl shadow-purple-900/5 space-y-4">
          <DiscountHeroBanner />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-700/20">
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                {calculator.categoryName}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight mt-1">
                {calculator.title}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {calculator.shortDesc}
          </p>
        </div>

        {/* INTERACTIVE CALCULATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Input Form Panel */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>Input Parameters</span>
            </h2>

            <div className="space-y-5">
              {calculator.inputs.map((input) => (
                <div key={input.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <label htmlFor={`input-${input.id}`}>{input.label}</label>
                    {input.type === 'number' && (
                      <span className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 font-extrabold text-purple-950">
                        {formValues[input.id] || input.default}
                      </span>
                    )}
                  </div>

                  {input.type === 'select' ? (
                    <select
                      id={`input-${input.id}`}
                      value={formValues[input.id] || input.default}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {input.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : input.type === 'date' ? (
                    <input
                      type="date"
                      id={`input-${input.id}`}
                      value={formValues[input.id] || input.default}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step || 1}
                        value={formValues[input.id] || input.default}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        className="w-full accent-purple-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                        <span>{input.min}</span>
                        <span>{input.max}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Results Display Card */}
          <div className="lg:col-span-6 space-y-6">
            {result ? (
              <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-purple-800/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {result.category}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Clinical Formula
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-6xl font-black text-white">{result.mainValue}</span>
                  <span className="text-sm sm:text-base font-extrabold text-purple-200">{result.unit}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed bg-purple-950/70 p-4 rounded-2xl border border-purple-800/40">
                  {result.summary}
                </p>

                {/* Details Breakdown */}
                {result.details && result.details.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-purple-900/60 text-xs sm:text-sm">
                    {result.details.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300 font-medium">
                        <span>{item.label}:</span>
                        <strong className="text-white">{item.value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Health Manager CTA */}
                {result.cta && (
                  <div className="pt-4 border-t border-purple-800/60 space-y-3">
                    <div className="text-xs sm:text-sm font-extrabold text-purple-200">
                      {result.cta.title}
                    </div>
                    <button
                      onClick={handleWhatsAppCTA}
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-4.5 h-4.5 fill-current" />
                      <span>{result.cta.btnText}</span>
                    </button>

                    {result.cta.serviceLink && (
                      <Link
                        to={result.cta.serviceLink}
                        className="w-full py-3 rounded-xl bg-purple-800/60 hover:bg-purple-800 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-purple-700/50"
                      >
                        <span>{result.cta.serviceName}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-medium">Adjust inputs above to view your calculation.</p>
              </div>
            )}
          </div>

        </div>

        {/* Safety Disclaimer & Clinical Sources Block */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <span>Clinical References & Safety Notes</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {calculator.disclaimer}
          </p>

          {calculator.sources && calculator.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-slate-500">Primary Clinical Sources:</span>
              {calculator.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold hover:underline"
                >
                  <span>{src.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
