import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FlaskConical, Scan, Dna, Home, Stethoscope, ShieldCheck, 
  Clock, Calendar, FileText, CheckCircle2, AlertCircle, MessageSquare, 
  Phone, ArrowRight, ChevronRight, HelpCircle, UserCheck, ShieldAlert, ShoppingBag
} from 'lucide-react';
import { ALL_SERVICES, CATEGORIES } from '../data/services';
import { CATEGORY_GUIDANCE_BLOCKS, HEALTH_MANAGER_PHONE } from '../config/constants';
import { openWhatsApp } from '../utils/whatsapp';
import { useCart } from '../context/CartContext';

import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

export default function ServiceDetailPage({ onOpenUploadModal }) {
  const { slug } = useParams();
  const { addToCart } = useCart();

  // Find service by slug or fallback to first
  const service = ALL_SERVICES.find(s => s.slug === slug) || ALL_SERVICES[0];
  const category = CATEGORIES.find(c => c.id === service.category_id) || CATEGORIES[0];
  const whatsappMsg = `Namaste Health Express! I am interested in inquiring / booking "${service.name}". Please share test details, pricing, turnaround time, and home sample collection availability.`;

  // Track SERVICE_VIEW analytics event
  React.useEffect(() => {
    if (slug) {
      import('../utils/analytics.js').then(({ logAnalyticsEvent }) => {
        logAnalyticsEvent('SERVICE_VIEW', { metadata: { service_id: slug }, deduplicate: true });
      }).catch(() => {});
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-purple-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/services" className="hover:text-purple-700 transition-colors">Services</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-900 font-bold truncate max-w-[200px]">{service.name}</span>
        </nav>

        {/* HERO BANNER SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl shadow-purple-900/5 relative overflow-hidden">
          
          {/* Background Gradient Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-5 text-left">
              
              <DiscountHeroBanner />

              {/* Promotional Discount Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-700 text-white text-xs font-extrabold shadow-sm">
                  ⚡ Get up to 70% discount
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  service.centre_visit_required 
                    ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}>
                  {service.centre_visit_required ? '📍 Centre Visit Required' : '🏠 Home Sample Collection Available'}
                </span>
              </div>

              {/* Title & Short Description */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {service.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {service.shortDesc || service.description}
              </p>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-700" />
                    Turnaround Time
                  </div>
                  <div className="font-extrabold text-purple-950 mt-1">{service.turnaround_time}</div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    Sample / Procedure
                  </div>
                  <div className="font-extrabold text-purple-950 mt-1 truncate">{service.sample_type}</div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100/80 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-purple-700" />
                    Fasting Prep
                  </div>
                  <div className="font-extrabold text-purple-950 mt-1 truncate">
                    {service.fasting_required ? 'Fasting Required' : 'No Fasting Needed'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <button
                  onClick={() => addToCart(service)}
                  className="px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Book Now • Add to Basket</span>
                </button>

                <button
                  onClick={onOpenUploadModal}
                  className="px-6 py-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-sm shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Upload Prescription</span>
                </button>

                <button
                  onClick={() => openWhatsApp(whatsappMsg)}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Talk to Health Manager</span>
                </button>
              </div>

            </div>

            {/* Right Pricing & Demonstration Image Column */}
            <div className="lg:col-span-4 space-y-4">
              {/* Demonstration Test Image */}
              <div className="h-48 sm:h-52 w-full rounded-3xl overflow-hidden relative shadow-md border border-purple-100 bg-slate-100">
                <img
                  src={service.image || {
                    'lab-tests': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
                    'imaging': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
                    'genetics': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
                    'home-care': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
                    'surgery': 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
                    'health-packages': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80'
                  }[service.category_id] || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                    NABL Verified Diagnostic Procedure
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-purple-800/40 text-left">
                <div className="text-xs uppercase font-extrabold text-purple-300 tracking-wider">
                  Health Express Transparent Pricing
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-white">₹{service.discount_price}</span>
                  {service.price && (
                    <span className="text-sm text-slate-400 line-through">₹{service.price}</span>
                  )}
                  {service.discount_percentage && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Save {service.discount_percentage}
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-2 text-xs border-t border-slate-800 text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>NABL Accredited Lab / Radiology Partners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Free Health Manager Consultation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Digital Verified PDF Report</span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(service)}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Book Service (₹{service.discount_price})</span>
                </button>

                <a
                  href={`tel:${HEALTH_MANAGER_PHONE}`}
                  className="w-full py-3 rounded-xl bg-white text-purple-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:bg-purple-50"
                >
                  <Phone className="w-3.5 h-3.5 text-purple-700" />
                  <span>Call Health Manager Direct</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* DETAILED CONTENT SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Overview Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-700" />
                What is this Service?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {service.overview || service.description}
              </p>
            </div>

            {/* Why it is Done */}
            {service.why_it_is_done && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-700" />
                  Why is it Done?
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.why_it_is_done}
                </p>
              </div>
            )}

            {/* Parameters Included / Measured */}
            {service.parameters && service.parameters.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-purple-700" />
                    What it Measures ({service.parameters.length} Parameters)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {service.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs font-semibold text-slate-800">
                      <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                      <span>{param}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Details */}
            {service.preparation && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-700" />
                  Test Preparation & Instructions
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed bg-purple-50/60 border border-purple-100 p-4 rounded-2xl">
                  {service.preparation}
                </p>
              </div>
            )}

            {/* CATEGORY SPECIFIC INFORMATIONAL / GUIDANCE BLOCKS (Requirement 20) */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider text-xs">
                Service Guidance & Information
              </h3>
              
              {/* BLOCK 1 */}
              <div className="p-5 rounded-3xl bg-purple-50/80 border border-purple-200 text-left space-y-2">
                <div className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>{CATEGORY_GUIDANCE_BLOCKS.block1.title}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {CATEGORY_GUIDANCE_BLOCKS.block1.body}
                </p>
              </div>

              {/* BLOCK 2 */}
              <div className="p-5 rounded-3xl bg-slate-100/80 border border-slate-200 text-left space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>{CATEGORY_GUIDANCE_BLOCKS.block2.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {CATEGORY_GUIDANCE_BLOCKS.block2.body}
                </p>
              </div>
            </div>

            {/* FAQs */}
            {service.faq && service.faq.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-700" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {service.faq.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="text-xs font-bold text-slate-900">Q: {item.q}</div>
                      <div className="text-xs text-slate-600 leading-relaxed">A: {item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Action & Help */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Health Manager Direct Box */}
            <div className="bg-purple-700 text-white rounded-3xl p-6 space-y-4 shadow-lg text-left">
              <h3 className="text-lg font-bold leading-snug">Need help deciding?</h3>
              <p className="text-xs text-purple-100 leading-relaxed">
                Your Health Manager can review your symptoms or doctor prescription to suggest the exact required test or scan.
              </p>
              <button
                onClick={() => openWhatsApp(whatsappMsg)}
                className="w-full py-3 rounded-2xl bg-white text-purple-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            {/* Quick Summary Badges */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 space-y-3 text-left">
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Service Guarantees
              </div>
              <div className="space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NABL Accredited Partner Facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Private Data Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Medical Phlebotomists</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
