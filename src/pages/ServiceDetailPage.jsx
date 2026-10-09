import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FlaskConical, Scan, Dna, Home, Stethoscope, ShieldCheck, 
  Clock, Calendar, FileText, CheckCircle2, AlertCircle, MessageSquare, 
  Phone, ArrowRight, ChevronRight, HelpCircle, UserCheck, ShieldAlert, 
  ShoppingBag, Upload, TestTube2, MapPin, ChevronDown, ChevronUp, Sparkles, Building2
} from 'lucide-react';
import { ALL_SERVICES, CATEGORIES } from '../data/services';
import { CATEGORY_GUIDANCE_BLOCKS, HEALTH_MANAGER_PHONE } from '../config/constants';
import { openWhatsApp } from '../utils/whatsapp';
import { useCart } from '../context/CartContext';
import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

// Helper to get category icon component
function getCategoryIcon(categoryId) {
  switch (categoryId) {
    case 'lab-tests': return FlaskConical;
    case 'imaging': return Scan;
    case 'genetics': return Dna;
    case 'home-care': return Home;
    case 'surgery': return Stethoscope;
    case 'health-packages': return ShieldCheck;
    default: return TestTube2;
  }
}

import { fetchServiceBySlug } from '../services/catalogService';

export default function ServiceDetailPage({ onOpenUploadModal }) {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Sync initial state + async fetch
  const initialService = ALL_SERVICES.find(s => s.slug === slug) || ALL_SERVICES[0];
  const [service, setService] = useState(initialService);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      fetchServiceBySlug(slug).then(res => {
        if (isMounted && res) {
          setService(res);
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [slug]);

  const category = CATEGORIES.find(c => c.id === service.category_id) || CATEGORIES[0];
  const IconComponent = getCategoryIcon(service.category_id);

  const isHomeNursing = service?.service_type === 'home_nursing' || service?.category_id === 'home-nursing' || service?.category_name === 'Home Nursing' || service?.subcategory === 'Home Nursing';

  const whatsappMsg = isHomeNursing 
    ? `Hi Health Express, I am interested in ${service.name}. Please share more details.`
    : `Namaste Health Express! I am interested in inquiring / booking "${service.name}". Please share test details, pricing, turnaround time, and home sample collection availability.`;

  // Related services (4 items max for 4-column desktop grid)
  const relatedServices = ALL_SERVICES
    .filter(s => s.category_id === service.category_id && s.slug !== service.slug)
    .slice(0, 4);

  // Track SERVICE_VIEW analytics event
  React.useEffect(() => {
    if (slug) {
      import('../utils/analytics.js').then(({ logAnalyticsEvent }) => {
        logAnalyticsEvent('SERVICE_VIEW', { metadata: { service_id: slug }, deduplicate: true });
      }).catch(() => {});
    }
  }, [slug]);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 py-1 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-purple-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to="/services" className="hover:text-purple-700 transition-colors">Services</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to={`/services?category=${service.category_id}`} className="hover:text-purple-700 transition-colors">
            {category?.name || 'Category'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-purple-900 font-bold truncate max-w-[240px]">{service.name}</span>
        </nav>

        {/* TOP SERVICE SUMMARY & PURCHASE HEADER (2 COLUMNS DESKTOP, NO IMAGES) */}
        <div className="bg-white rounded-2xl border border-purple-100/80 shadow-md p-5 sm:p-7 relative overflow-hidden text-left">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50/70 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-start">
            
            {/* LEFT COLUMN: Service Info & Highlights */}
            <div className="lg:col-span-8 space-y-4">
              
              <DiscountHeroBanner />

              {/* Category Badge & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
                  <IconComponent className="w-3.5 h-3.5 text-purple-700" />
                  <span>{category?.name}</span>
                </span>

                {service.discount_percentage && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-700 text-white text-xs font-extrabold shadow-2xs">
                    ⚡ {service.discount_percentage} OFF
                  </span>
                )}

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  service.centre_visit_required 
                    ? 'bg-amber-50 text-amber-900 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}>
                  {service.centre_visit_required ? '📍 Centre Visit Required' : '🏠 Home Sample Collection Available'}
                </span>
              </div>

              {/* Service Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {service.name}
              </h1>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {service.shortDesc || service.description || service.overview}
              </p>

              {/* Compact Specs Grid (No-Image Visual Pill Bar) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-700" />
                    <span>Report Time</span>
                  </div>
                  <div className="font-extrabold text-slate-900 mt-0.5 truncate">{service.turnaround_time}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <TestTube2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Sample Type</span>
                  </div>
                  <div className="font-extrabold text-slate-900 mt-0.5 truncate">{service.sample_type || 'Standard Procedure'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-purple-700" />
                    <span>Fasting</span>
                  </div>
                  <div className="font-extrabold text-slate-900 mt-0.5 truncate">
                    {service.fasting_required ? 'Fasting Required' : 'No Fasting'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>Parameters</span>
                  </div>
                  <div className="font-extrabold text-slate-900 mt-0.5 truncate">
                    {service.parameters_count ? `${service.parameters_count} Included` : 'Detailed Report'}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {isHomeNursing ? (
                  <button
                    onClick={() => openWhatsApp(whatsappMsg)}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Contact Us on WhatsApp →</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => addToCart(service)}
                      className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md shadow-purple-700/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Book Service • ₹{service.discount_price}</span>
                    </button>

                    <button
                      onClick={onOpenUploadModal}
                      className="px-5 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-700" />
                      <span>Upload Prescription</span>
                    </button>

                    <button
                      onClick={() => openWhatsApp(whatsappMsg)}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>Talk to Health Manager</span>
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Sticky Purchase Card (Amazon-style Compact Price Box) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-3">
              <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white rounded-2xl p-5 shadow-xl border border-purple-800/40 text-left space-y-4">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[11px] uppercase font-extrabold text-purple-300 tracking-wider">
                    {isHomeNursing ? 'Home Nursing Care' : 'Transparent Healthcare Price'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    NABL Partnered
                  </span>
                </div>

                {/* Price Display */}
                {!isHomeNursing && (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-white">₹{service.discount_price}</span>
                      {service.price && (
                        <span className="text-sm text-slate-400 line-through">₹{service.price}</span>
                      )}
                    </div>
                    {service.discount_percentage && (
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>You save {service.discount_percentage} with Health Express</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Feature Checklist */}
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>NABL Accredited Diagnostic Network</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Free Health Manager Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Smart Digital PDF Report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sample Picked Up from Doorstep</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-2">
                  {isHomeNursing ? (
                    <button
                      onClick={() => openWhatsApp(whatsappMsg)}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact Us on WhatsApp →</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => addToCart(service)}
                        className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Book Service (₹{service.discount_price})</span>
                      </button>

                      <a
                        href={`tel:${HEALTH_MANAGER_PHONE}`}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/15"
                      >
                        <Phone className="w-3.5 h-3.5 text-purple-300" />
                        <span>Call Health Manager Direct</span>
                      </a>
                    </>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* MAIN DETAILED SECTIONS & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* LEFT MAIN CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* OVERVIEW / ABOUT THIS TEST */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-purple-700" />
                About {service.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {service.overview || service.description}
              </p>
            </div>

            {/* WHY IT IS DONE */}
            {service.why_it_is_done && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UserCheck className="w-4 h-4 text-purple-700" />
                  Why is this Test Recommended?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.why_it_is_done}
                </p>
              </div>
            )}

            {/* PARAMETERS INCLUDED */}
            {service.parameters && service.parameters.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-700" />
                    What's Included ({service.parameters.length} Parameters)
                  </h2>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                    Comprehensive Panel
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {service.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100/80 text-xs font-semibold text-slate-800">
                      <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                      <span>{param}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PREPARATION INSTRUCTIONS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertCircle className="w-4 h-4 text-purple-700" />
                Before Your Test (Preparation Guidelines)
              </h2>
              {service.preparation ? (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 leading-relaxed font-medium">
                  {service.preparation}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                  No specialized preparation is required for this service. Stay hydrated and carry any existing prescription if applicable.
                </div>
              )}
            </div>

            {/* HOW IT WORKS (4-STEP PROCESS) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-4 h-4 text-purple-700" />
                How It Works
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-left space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-black flex items-center justify-center">1</div>
                  <div className="text-xs font-extrabold text-slate-900">Book Service</div>
                  <p className="text-[11px] text-slate-600">Book online or upload prescription for instant confirmation.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-left space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-black flex items-center justify-center">2</div>
                  <div className="text-xs font-extrabold text-slate-900">Sample Collection</div>
                  <p className="text-[11px] text-slate-600">Certified phlebotomist collects sample at home or visit partner lab.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-left space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-black flex items-center justify-center">3</div>
                  <div className="text-xs font-extrabold text-slate-900">NABL Processing</div>
                  <p className="text-[11px] text-slate-600">Sample analyzed in high-end accredited NABL diagnostics facility.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-left space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-black flex items-center justify-center">4</div>
                  <div className="text-xs font-extrabold text-slate-900">Digital Report</div>
                  <p className="text-[11px] text-slate-600">Receive verified PDF report + free doctor/health manager guidance.</p>
                </div>
              </div>
            </div>

            {/* IMPORTANT SERVICE GUIDANCE BLOCKS */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Service Guidance & Information
              </h3>
              
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-left space-y-1.5">
                <div className="text-xs font-bold text-purple-950 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>{CATEGORY_GUIDANCE_BLOCKS.block1.title}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {CATEGORY_GUIDANCE_BLOCKS.block1.body}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-left space-y-1.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>{CATEGORY_GUIDANCE_BLOCKS.block2.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {CATEGORY_GUIDANCE_BLOCKS.block2.body}
                </p>
              </div>
            </div>

            {/* FREQUENTLY ASKED QUESTIONS */}
            {service.faq && service.faq.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HelpCircle className="w-4 h-4 text-purple-700" />
                  Frequently Asked Questions
                </h2>

                <div className="space-y-2.5">
                  {service.faq.map((item, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50 transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full px-4 py-3 text-left font-bold text-xs text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-100/70 cursor-pointer"
                        >
                          <span>{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-purple-700 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-3 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR (TRUST & DIRECT CONTACT) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* WHATSAPP CONSULTATION CARD */}
            <div className="bg-gradient-to-br from-purple-800 to-purple-950 text-white rounded-2xl p-5 space-y-3 shadow-md text-left">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-200 fill-current" />
              </div>
              <h3 className="text-base font-extrabold leading-snug">Need Help Deciding?</h3>
              <p className="text-xs text-purple-100 leading-relaxed">
                Connect with our Health Manager to clarify requirements, test parameters, fasting guidelines, or home collection scheduling.
              </p>
              <button
                onClick={() => openWhatsApp(whatsappMsg)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            {/* TRUST & GUARANTEES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3 text-left">
              <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                Health Express Assurance
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-900 font-extrabold">NABL Accredited Labs</div>
                    <div className="text-[11px] text-slate-500 font-normal">Only verified top-tier diagnostic partners</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-900 font-extrabold">100% Privacy Preserved</div>
                    <div className="text-[11px] text-slate-500 font-normal">Encrypted digital reports directly to you</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-900 font-extrabold">Expert Phlebotomists</div>
                    <div className="text-[11px] text-slate-500 font-normal">Hygienic, certified & painless sample pickup</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RELATED SERVICES SECTION (4 CARDS IN A ROW ON DESKTOP, NO IMAGES) */}
        {relatedServices.length > 0 && (
          <div className="pt-6 border-t border-slate-200/80 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                Related {category?.name || 'Services'}
              </h2>
              <Link 
                to={`/services?category=${service.category_id}`}
                className="text-xs font-extrabold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Grid of at least 3-4 cards visible per row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedServices.map((relItem) => {
                const RelIcon = getCategoryIcon(relItem.category_id);
                return (
                  <div 
                    key={relItem.id}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 p-4 flex flex-col justify-between transition-all hover:shadow-md space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                          <RelIcon className="w-4 h-4" />
                        </span>
                        {relItem.discount_percentage && (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            {relItem.discount_percentage} OFF
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-purple-800 transition-colors line-clamp-2 min-h-[32px]">
                        {relItem.name}
                      </h3>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-700" />
                          {relItem.turnaround_time}
                        </span>
                        {relItem.parameters_count && (
                          <span>{relItem.parameters_count} Tests</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-slate-900">₹{relItem.discount_price}</div>
                        {relItem.price && (
                          <div className="text-[10px] text-slate-400 line-through">₹{relItem.price}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/services/${relItem.slug}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => addToCart(relItem)}
                          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
