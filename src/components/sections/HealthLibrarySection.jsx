import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { HEALTH_ARTICLES } from '../../data/articles';

export default function HealthLibrarySection() {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef(null);

  const topicClusters = [
    'Diagnostics',
    'Health Tests',
    'Family Health',
    'Preventive Health',
    'Home Care'
  ];

  // Auto-play interval loop with hover pause
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 25) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-purple-50/20 border-t border-purple-100/40" id="health-library">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl text-left">
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-700">
              HEALTH LIBRARY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Understand your health better.
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Practical, evidence-informed guides to help you understand tests, reports, conditions and everyday healthcare decisions.
            </p>

            {/* Topic Clusters */}
            <div className="flex flex-wrap items-center gap-2 pt-3">
              {topicClusters.map((cluster) => (
                <span
                  key={cluster}
                  className="px-3 py-1 rounded-full bg-white border border-purple-200 text-xs font-semibold text-purple-900 shadow-xs"
                >
                  {cluster}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Link
              to="/health-library"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 group"
            >
              <span>Explore Health Library</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleScroll('left')}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Previous article"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleScroll('right')}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Next article"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Slider Track with Auto-Play & Hover Pause */}
        <div 
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory py-2 px-1 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {HEALTH_ARTICLES.map((article) => (
            <Link
              key={article.id}
              to={`/health-library/${article.slug}`}
              className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left min-h-[340px] transform hover:-translate-y-1"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-purple-800 border border-white/50">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 space-y-2 text-left flex-1 flex flex-col justify-start">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors leading-snug line-clamp-2 min-h-[3rem] flex items-center">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-900 mt-auto">
                <span>Read Article Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
