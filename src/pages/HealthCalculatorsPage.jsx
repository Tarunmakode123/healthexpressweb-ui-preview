import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ALL_SERVICES 
} from '../data/services';
import { 
  CALCULATORS, CALCULATOR_CATEGORIES 
} from '../data/calculators';
import { 
  Search, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Calculator,
  Scale, Flame, Zap, Target, Activity, Droplet, HeartPulse, Calendar, Heart
} from 'lucide-react';
import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

const iconMap = {
  Scale, Flame, Zap, Target, Activity, Droplet, HeartPulse, Calendar, Heart, Sparkles
};

export default function HealthCalculatorsPage({ onOpenCalculatorModal }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCalculators = CALCULATORS.filter(calc => {
    const matchesCat = activeCategory === 'all' || calc.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesSearch = 
      calc.title.toLowerCase().includes(q) ||
      calc.shortDesc.toLowerCase().includes(q) ||
      calc.categoryName.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handleLaunchModal = (slug) => {
    if (onOpenCalculatorModal) {
      onOpenCalculatorModal(slug);
    } else {
      window.dispatchEvent(new CustomEvent('open-calculator-modal', { detail: { slug } }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative text-left">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-purple-50/80 via-white to-slate-50/50 py-12 md:py-16 border-b border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          
          <DiscountHeroBanner />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-extrabold text-purple-900 shadow-2xs">
            ⚡ FREE HEALTH CALCULATORS LIBRARY
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Free Health Calculators &<br />
            <span className="gradient-text-purple">Clinical Assessment Tools.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Use our clinical reference calculators to understand your BMI, daily calorie needs, BMR, pregnancy due dates, blood pressure categories, and hydration targets.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative pt-2">
            <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-purple-200 bg-white">
              <Search className="w-5 h-5 text-purple-600 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. BMI, Calorie, Due Date, BMR, Water Intake, Blood Pressure)..."
                className="w-full pl-12 pr-10 py-4 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-purple-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Category Pill Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-700 text-white shadow-md scale-105'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
            }`}
          >
            All Tools ({CALCULATORS.length})
          </button>

          {CALCULATOR_CATEGORIES.map((cat) => {
            const count = CALCULATORS.filter(c => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-purple-700 text-white shadow-md scale-105'
                    : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Results Count Strip */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-3">
          <span>Showing <strong className="text-purple-900">{filteredCalculators.length}</strong> Clinical Calculators</span>
          <span className="text-purple-700 flex items-center gap-1 font-extrabold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Validated Formulas & CDC/WHO References</span>
          </span>
        </div>

        {/* TOOL CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalculators.map((calc) => {
            const IconComp = iconMap[calc.iconName] || Calculator;

            return (
              <div 
                key={calc.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left group"
              >
                <div className="space-y-4">
                  
                  {/* Badge & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                      <IconComp className="w-3 h-3" />
                      {calc.categoryName}
                    </span>

                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Free Tool
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <Link 
                      to={`/health-calculators/${calc.slug}`}
                      className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-1"
                    >
                      {calc.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {calc.shortDesc}
                    </p>
                  </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="pt-5 border-t border-slate-100 mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLaunchModal(calc.slug)}
                    className="py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Quick Calculate</span>
                  </button>

                  <Link
                    to={`/health-calculators/${calc.slug}`}
                    className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Full Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
