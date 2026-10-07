import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SURGERY_SPECIALITIES, POPULAR_SURGERIES_CATEGORIES, SURGERIES_FAQ 
} from '../data/surgeries';
import { 
  Stethoscope, Upload, MessageSquare, ArrowRight, ShieldCheck, ChevronRight, 
  ChevronDown, HelpCircle, CheckCircle2, UserCheck, Activity, Heart, Brain, 
  Eye, Bone, Dna, Sparkles, ShieldAlert, Shield, Clock, Building2, X, Phone
} from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';
import { HEALTH_MANAGER_PHONE } from '../config/constants';
import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

const iconMap = {
  Bone, Activity, Heart, Brain, Stethoscope, Shield, ShieldAlert, 
  HeartPulse: Heart, UserCheck, Eye, Sparkles, CheckCircle2, Dna
};

export default function SurgeriesPage({ onOpenUploadModal }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);

  // Set document title & meta tags for SEO
  useEffect(() => {
    document.title = "Surgery & Treatment Options in India | Doctors, Hospitals & Costs | Health Express";
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleWhatsAppConsultation = (serviceName = '') => {
    const message = serviceName
      ? `Hello Health Express!\n\nI am inquiring about surgical options for: ${serviceName}.\nPlease help me connect with specialists, compare hospitals, and get estimated treatment costs.`
      : `Hello Health Express!\n\nI am planning a surgery/treatment and would like assistance with finding specialists, hospitals, and estimated costs.`;
    openWhatsApp(message);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 text-left relative">
      
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-b from-purple-50/80 via-white to-slate-50/50 py-12 md:py-16 border-b border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          
          <DiscountHeroBanner />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-extrabold text-purple-900 shadow-2xs">
            ⚡ SURGICAL & SPECIALIST CARE DIRECTORY
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Surgery & Treatment Options,<br />
            <span className="gradient-text-purple">All in One Place.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Explore surgical options, find relevant specialists and hospitals, understand estimated treatment costs, and get help coordinating your surgery journey with Health Express.
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#popular-surgeries"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-700/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Surgery Options</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-700" />
              <span>Upload Medical Reports</span>
            </button>
          </div>

          {/* Small Trust Line */}
          <div className="pt-2 flex items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-500">
            <span>Specialists</span>
            <span>•</span>
            <span>Hospitals</span>
            <span>•</span>
            <span>Treatment Options</span>
            <span>•</span>
            <span>Cost Estimates</span>
            <span>•</span>
            <span>Care Coordination</span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        
        {/* 2. SPECIALITIES SECTION */}
        <section className="space-y-8" id="specialities">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-xs font-extrabold text-purple-900 uppercase">
              SPECIALITIES
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Explore Surgery by Speciality
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Click any speciality to view procedure details, clinical overviews, and recovery guidance.
            </p>
          </div>

          {/* 16 Clean Interactive Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {SURGERY_SPECIALITIES.map((spec) => {
              const IconComp = iconMap[spec.iconName] || Stethoscope;
              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpeciality(spec)}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-start justify-between group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  
                  <div className="w-full space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors leading-tight">
                      {spec.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 group-hover:text-purple-900">
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <a
              href="#popular-surgeries"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs transition-colors border border-purple-200"
            >
              <span>View All Specialities</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* 3. THE PROBLEM SECTION */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl shadow-purple-900/5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-xs font-extrabold text-purple-900 uppercase">
            SECOND OPINION & COST TRANSPARENCY
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Considering Surgery? Explore a Second Opinion
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            <p>
              Choosing surgery often means navigating multiple decisions at once — which procedure, which specialist, which hospital, and how much it may cost.
            </p>
            <p>
              Costs can also vary based on the procedure, hospital, location, surgeon, implants, room category and individual clinical requirements.
            </p>
            <p className="text-purple-900 font-bold">
              Health Express brings these considerations together so you can explore your options in one place.
            </p>
          </div>
        </section>

        {/* 4. HOW HEALTH EXPRESS HELPS */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              How Health Express Helps You Plan Your Surgery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Find the Right Specialist</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Explore specialists based on your condition, procedure and speciality.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Explore Hospital Options</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Compare relevant hospitals based on location, speciality, facilities and treatment availability.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Understand Treatment Costs</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Get estimated treatment costs and understand the factors that can affect your overall expense.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Coordinate Your Care</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                From consultation scheduling to hospital coordination, our team can help simplify the administrative side of your treatment journey.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => handleWhatsAppConsultation()}
              className="px-8 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Get Surgery Assistance</span>
            </button>
          </div>
        </section>

        {/* 5. POPULAR SURGERIES SECTION */}
        <section className="space-y-8" id="popular-surgeries">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Explore Popular Surgery & Treatment Options
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Explore commonly searched surgical procedures across major specialities.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200/80 text-xs font-semibold shadow-2xs">
              <span>💡 Surgery costs vary by hospital tier & insurance. Connect with our Care Desk for customized package estimates.</span>
            </div>
          </div>

          {/* Clean Categorized Grid - Zero Word Repetition */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_SURGERIES_CATEGORIES.map((catGroup, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between text-left hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-extrabold text-purple-900">{catGroup.category}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {catGroup.items.length} Procedures
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {catGroup.items.map((item) => (
                      <Link 
                        key={item.slug}
                        to={`/surgeries/${item.slug}`} 
                        className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-purple-50/80 text-slate-800 hover:text-purple-950 font-medium text-xs transition-all group"
                      >
                        <span className="group-hover:font-bold transition-all">{item.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => handleWhatsAppConsultation(catGroup.category)}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-purple-100"
                  >
                    <span>Get Cost Estimate for {catGroup.category}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => handleWhatsAppConsultation()}
              className="px-8 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs transition-colors border border-purple-200 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Surgeries</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 6. FINAL CTA SECTION */}
        <section className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl border border-purple-800/40">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Planning a Surgery?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Don't navigate doctors, hospitals and treatment options alone. Share your prescription, diagnosis or medical reports and let Health Express help you explore your options.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Medical Reports</span>
            </button>

            <button
              onClick={() => handleWhatsAppConsultation()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Talk to a Health Manager</span>
            </button>
          </div>
        </section>

        {/* 7. FAQ ACCORDION */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Answers to common questions about planning surgery with Health Express.
            </p>
          </div>

          <div className="space-y-3">
            {SURGERIES_FAQ.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:text-purple-900"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-purple-700 shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>

                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* SPECIALITY DETAIL POPUP MODAL */}
      {selectedSpeciality && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100 p-6 sm:p-8 space-y-6 relative text-left my-auto">
            
            {/* Close (X) Button */}
            <button 
              onClick={() => setSelectedSpeciality(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-500 hover:text-purple-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 pr-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-700/20">
                {React.createElement(iconMap[selectedSpeciality.iconName] || Stethoscope, { className: 'w-7 h-7' })}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  Surgical Speciality Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedSpeciality.name}
                </h2>
              </div>
            </div>

            {/* Clinical Overview */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-extrabold text-purple-900 tracking-wider">Clinical Scope & Overview</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {selectedSpeciality.description || 'Comprehensive surgical consultation, hospital options, and treatment coordination.'}
              </p>
            </div>

            {/* Key Procedures Included */}
            {selectedSpeciality.procedures && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h3 className="text-xs uppercase font-extrabold text-purple-900 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-700" />
                  <span>Common Procedures Covered</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSpeciality.procedures.map((proc, i) => (
                    <span key={i} className="text-xs font-semibold px-3 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{proc}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Care Specs Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              {selectedSpeciality.hospitalStay && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Typical Hospital Stay</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{selectedSpeciality.hospitalStay}</div>
                </div>
              )}
              {selectedSpeciality.recoveryTime && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Recovery & Rehab</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{selectedSpeciality.recoveryTime}</div>
                </div>
              )}
            </div>

            {/* Health Express Care Commitment */}
            {selectedSpeciality.benefits && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs uppercase font-extrabold text-purple-900 tracking-wider">Health Express Care Commitment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                  {selectedSpeciality.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  handleWhatsAppConsultation(selectedSpeciality.name);
                  setSelectedSpeciality(null);
                }}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Get Surgery Assistance & Estimate</span>
              </button>

              <button
                onClick={() => {
                  setSelectedSpeciality(null);
                  onOpenUploadModal();
                }}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Upload className="w-4 h-4 text-purple-700" />
                <span>Upload Reports</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
