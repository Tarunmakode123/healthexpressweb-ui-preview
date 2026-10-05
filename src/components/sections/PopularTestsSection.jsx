import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Sparkles, ArrowRight, ShieldCheck, Droplet, Activity, Sun, Target, 
  Heart, UserCheck, Shield, ShoppingBag, ChevronLeft, ChevronRight, CheckCircle2, ShoppingCart 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function PopularTestsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [addedToast, setAddedToast] = useState(null);
  const { addToCart } = useCart();
  const scrollContainerRef = useRef(null);

  const popularServices = [
    {
      id: 'cbc-test',
      title: 'CBC Test (Complete Blood Count)',
      category: 'Blood Test',
      desc: 'Evaluates overall health, infection markers, hemoglobin, and blood cell counts.',
      keywords: ['cbc', 'blood', 'hemoglobin', 'count', 'infection'],
      icon: Droplet
    },
    {
      id: 'thyroid-tests',
      title: 'Thyroid Profile (T3, T4, TSH)',
      category: 'Hormone Screening',
      desc: 'Assesses thyroid gland function, metabolism, and endocrine balance.',
      keywords: ['thyroid', 'tsh', 't3', 't4', 'hormone', 'metabolism'],
      icon: Activity
    },
    {
      id: 'vitamin-d-test',
      title: 'Vitamin D (25-OH)',
      category: 'Vitamin & Mineral',
      desc: 'Measures Vitamin D levels essential for bone health and immune function.',
      keywords: ['vitamin', 'd', 'vitamin d', 'bones', 'deficiency'],
      icon: Sun
    },
    {
      id: 'hba1c-test',
      title: 'HbA1c Glycated Hemoglobin',
      category: 'Diabetes Care',
      desc: 'Evaluates average blood sugar levels over the past 2 to 3 months.',
      keywords: ['hba1c', 'diabetes', 'sugar', 'glucose'],
      icon: Target
    },
    {
      id: 'lipid-profile',
      title: 'Lipid Profile (Cholesterol)',
      category: 'Cardiac & Lipid',
      desc: 'Measures HDL, LDL, triglycerides, and overall cardiovascular risk markers.',
      keywords: ['lipid', 'cholesterol', 'cardiac', 'hdl', 'ldl', 'triglycerides'],
      icon: Heart
    },
    {
      id: 'full-body-checkup',
      title: 'Full Body Health Package',
      category: 'Comprehensive',
      desc: 'Comprehensive multi-parameter health screening including liver, kidney, and blood profiles.',
      keywords: ['full body', 'checkup', 'package', 'screening', 'annual'],
      icon: UserCheck
    },
    {
      id: 'liver-function',
      title: 'Liver Function Test (LFT)',
      category: 'Organ Function',
      desc: 'Assesses bilirubin, enzymes, and proteins to evaluate liver health.',
      keywords: ['liver', 'lft', 'sgot', 'sgpt', 'bilirubin'],
      icon: Shield
    },
    {
      id: 'kidney-function',
      title: 'Kidney Function Test (KFT)',
      category: 'Organ Function',
      desc: 'Measures creatinine, urea, and electrolytes for renal health assessment.',
      keywords: ['kidney', 'kft', 'creatinine', 'urea', 'renal'],
      icon: ShieldCheck
    }
  ];

  const filteredTests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return popularServices;
    return popularServices.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q))
    );
  }, [searchQuery]);

  // Auto-play interval loop with hover pause
  useEffect(() => {
    if (isHovered || searchQuery.trim().length > 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 25) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, searchQuery]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (service, e) => {
    if (e) e.stopPropagation();
    const testPrice = service.id === 'full-body-checkup' ? 999 : 299;
    addToCart({
      id: service.id,
      name: service.title,
      category: service.category,
      price: testPrice,
      originalPrice: service.id === 'full-body-checkup' ? 2499 : 599,
      turnaround: '6-12 Hours'
    });

    setAddedToast({
      title: service.title,
      price: testPrice
    });

    setTimeout(() => {
      setAddedToast(null);
    }, 3500);
  };

  return (
    <section className="py-5 md:py-12 bg-white border-t border-slate-100 relative" id="tests">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-extrabold uppercase tracking-widest text-purple-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>POPULAR DIAGNOSTIC TESTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Looking for a specific test?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Search diagnostic tests and checkup packages available across verified partner labs in Bengaluru.
            </p>
          </div>

          {/* Slider Navigation Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Previous test"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Next test"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Suggestion Chips */}
        <div className="max-w-xl space-y-3 text-left">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CBC, thyroid, vitamin D, lipid, full body..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none shadow-xs"
            />
          </div>

          {/* Suggestion Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-bold text-[11px]">Quick suggestions:</span>
            {['CBC', 'HbA1c', 'Vitamin D', 'Thyroid', 'Lipid Profile', 'Full Body'].map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 font-bold text-[11px] transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Slider Track with Auto-Play & Hover Pause */}
        <div 
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="flex items-stretch gap-5 overflow-x-auto snap-x snap-mandatory py-2 px-1 scrollbar-none text-left"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredTests.map((service) => {
            const IconComp = service.icon;
            return (
              <div
                key={service.id}
                onClick={(e) => handleAddToCart(service, e)}
                className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between text-left transform hover:-translate-y-1 relative overflow-hidden min-h-[260px]"
              >
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors shadow-2xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {service.category}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-1 min-h-[1.75rem] flex items-center">
                      {service.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {service.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-purple-700 group-hover:text-purple-900 mt-auto">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Book & Add to Basket</span>
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-purple-600" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Toast Notification Alert for Added to Basket */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-bounce shadow-purple-950/50 text-left">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Added to Basket</span>
              <span className="text-emerald-400 font-extrabold">₹{addedToast.price}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium truncate max-w-[220px]">
              {addedToast.title}
            </div>
          </div>
          <Link
            to="/cart"
            className="ml-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold transition-colors flex items-center gap-1 shrink-0"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>View Cart</span>
          </Link>
        </div>
      )}
    </section>
  );
}
