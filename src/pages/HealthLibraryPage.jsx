import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HEALTH_ARTICLES } from '../data/articles';
import { 
  Search, Clock, ArrowRight, BookOpen, ShieldCheck, Sparkles, 
  CheckCircle2, ChevronDown, ChevronUp, MessageSquare, Upload, Zap, Activity
} from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';

import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

export default function HealthLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedTakeawayId, setExpandedTakeawayId] = useState(null);
  const [activeConcernPill, setActiveConcernPill] = useState(null);

  const categories = ['All', 'Diagnostics', 'Preventive Health', 'Wellness & Screening', 'Patient Guide'];

  const concerns = [
    { label: '🩸 Blood Test Basics', term: 'cbc' },
    { label: '🍬 Diabetes & HbA1c', term: 'hba1c' },
    { label: '❤️ Heart & Cholesterol', term: 'lipid' },
    { label: '⚡ Fatigue & Full Body Checkup', term: 'full-body' },
    { label: '📋 Preparing for Test', term: 'prepare' }
  ];

  const handleConcernClick = (term) => {
    if (activeConcernPill === term) {
      setActiveConcernPill(null);
      setSearchTerm('');
    } else {
      setActiveConcernPill(term);
      setSearchTerm(term);
    }
  };

  const toggleTakeaways = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedTakeawayId(prev => (prev === id ? null : id));
  };

  const featuredArticle = HEALTH_ARTICLES.find(a => a.isFeatured) || HEALTH_ARTICLES[0];

  const filteredArticles = HEALTH_ARTICLES.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.keyTakeaways && article.keyTakeaways.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden text-left">
      
      {/* Background ECG Heartbeat Accent */}
      <div className="absolute top-20 left-0 right-0 h-48 opacity-10 pointer-events-none -z-10 flex items-center justify-center">
        <svg viewBox="0 0 1200 120" className="w-full h-full text-purple-600 fill-none stroke-current stroke-[2] stroke-linecap-round">
          <path d="M0,60 L250,60 L280,30 L300,90 L320,10 L340,110 L360,60 L390,60 L420,60 L1200,60" className="animate-ecg" />
        </svg>
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12 relative z-10">
        
        {/* Animated Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <DiscountHeroBanner />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-slate-800 shadow-2xs backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-purple-900 uppercase tracking-wider text-[11px] font-extrabold">EVIDENCE-INFORMED HEALTH LIBRARY</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">Doctor Reviewed</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Clear Healthcare Knowledge,<br />
            <span className="gradient-text-purple">Verified by Medical Board.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Understand lab parameters, preparation requirements, and preventive health screenings with doctor-approved medical guides.
          </p>
        </div>

        {/* Interactive Symptom & Topic Finder Widget */}
        <div className="max-w-4xl mx-auto glass-card p-6 rounded-3xl border border-purple-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Interactive Topic Finder: Select a health concern</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">Instant Filter</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {concerns.map((c) => (
              <button
                key={c.term}
                onClick={() => handleConcernClick(c.term)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeConcernPill === c.term
                    ? 'bg-purple-700 text-white shadow-md scale-105'
                    : 'bg-white hover:bg-purple-50 text-slate-700 border border-purple-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-purple-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveConcernPill(null);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20 scale-105'
                    : 'bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, blood tests, HbA1c..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50"
            />
          </div>

        </div>

        {/* Featured Article Spotlight (Only show when not filtered by search) */}
        {!searchTerm && selectedCategory === 'All' && featuredArticle && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-xl relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-6 relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-700 text-white text-[10px] font-black uppercase tracking-wider">
                  ⭐ FEATURED GUIDE
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-3 text-xs font-extrabold text-purple-700">
                  <span className="px-3 py-1 rounded-full bg-purple-100 border border-purple-200">{featuredArticle.category}</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredArticle.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {featuredArticle.summary}
                </p>

                {/* Key Takeaways Box */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                  <div className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-purple-700 text-purple-700" />
                    <span>Quick Takeaways:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 font-medium">
                    {featuredArticle.keyTakeaways?.map((kt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{kt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/health-library/${featuredArticle.slug}`}
                    className="px-6 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => openWhatsApp(DEFAULT_MESSAGES.service(featuredArticle.title))}
                    className="px-5 py-3.5 rounded-2xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Inquire About {featuredArticle.relatedTest}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Articles Grid Header */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-purple-100 pb-3">
          <span>Found <strong className="text-purple-900">{filteredArticles.length}</strong> Evidence-Informed Guides</span>
          <span className="text-emerald-700 font-extrabold">✓ 100% Doctor Approved</span>
        </div>

        {/* Articles Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => {
            const isTakeawayExpanded = expandedTakeawayId === article.id;
            return (
              <div
                key={article.id}
                className="bento-card rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer transition-all duration-300"
              >
                <div>
                  
                  {/* Image Container with Zoom */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-purple-900 shadow-2xs">
                        {article.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-300" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6 space-y-3">
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{article.author || 'Medical Care Board'}</span>
                    </div>

                    <Link to={`/health-library/${article.slug}`} className="block">
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors leading-snug">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>

                    {/* Quick Takeaways Accordion */}
                    {article.keyTakeaways && (
                      <div className="pt-2">
                        <button
                          onClick={(e) => toggleTakeaways(e, article.id)}
                          className="w-full py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-900 text-[11px] font-extrabold flex items-center justify-between transition-colors"
                        >
                          <span>⚡ Quick Takeaways</span>
                          {isTakeawayExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isTakeawayExpanded && (
                          <div className="mt-2 p-3 rounded-xl bg-white border border-purple-200 space-y-1.5 text-left text-xs animate-fadeIn">
                            {article.keyTakeaways.map((kt, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                                <span>{kt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-slate-100/60 mt-3 flex items-center justify-between">
                  <Link
                    to={`/health-library/${article.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-700 group-hover:text-purple-900 group-hover:translate-x-1 transition-all"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => openWhatsApp(DEFAULT_MESSAGES.service(article.title))}
                    className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Inquire</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Healthcare Assistance Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left mt-16">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500 text-slate-950">
              Personalized Medical Guidance
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Have questions about your diagnostic report?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Upload your lab report or prescription to have our certified care managers assist you with next steps and doctor consultation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => openWhatsApp("Hello Health Express, I have questions regarding a lab test report / prescription.")}
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>Ask Care Manager on WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
