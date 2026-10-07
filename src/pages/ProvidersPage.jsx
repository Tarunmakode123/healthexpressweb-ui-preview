import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, TrendingUp, Handshake, Send, Mail, CheckCircle2, 
  MessageSquare, Sparkles, Zap, FlaskConical, Camera, Home, Dna, ArrowRight, Activity, Clock, Pill, HeartPulse
} from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';
import CitySearchSelect from '../components/common/CitySearchSelect';

export default function ProvidersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeProviderType, setActiveProviderType] = useState('Diagnostic Lab');
  const [dailyCapacity, setDailyCapacity] = useState('50-200');
  
  const [formData, setFormData] = useState({
    providerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    providerType: 'Diagnostic Lab',
    city: 'Bengaluru',
    accreditation: 'NABL Accredited',
    message: ''
  });

  const providerTypesData = [
    {
      id: 'Diagnostic Lab',
      icon: FlaskConical,
      title: 'Diagnostic Laboratories & Pathology',
      highlight: 'Home Sample Collection Logistics & Automated Digital Reporting',
      benefits: [
        'Zero phlebotomist overhead — Health Express dispatches certified sample collectors.',
        'Barcoded cold-chain sample transport with live temperature tracking.',
        'Direct PDF/JSON digital report sync into patient backend account.'
      ]
    },
    {
      id: 'Imaging Center',
      icon: Camera,
      title: 'Imaging & Radiology Centers',
      highlight: 'Prioritized Appointment Scheduling & Fast DICOM Delivery',
      benefits: [
        'Connect directly with patients seeking MRI, CT, Ultrasound, and X-Ray scans.',
        'Automated appointment slot locking with pre-procedure prep instructions.',
        'Digital radiology link delivery directly to patient mobile portal.'
      ]
    },
    {
      id: 'Home Nursing Agency',
      icon: Home,
      title: 'Home Healthcare & Nursing Agencies',
      highlight: 'Continuous Care Deployment & Verified Nurse Matching',
      benefits: [
        'Receive qualified patient requests for post-op care, IV therapy, and elderly support.',
        'Dedicated care coordinator manages patient communication & billing.',
        'Standardized vital log reporting & daily progress notes.'
      ]
    },
    {
      id: 'Pharmacy Partner',
      icon: Pill,
      title: 'Medicines & Pharmacy Partners',
      highlight: 'Prescription Order Fulfillment & Express Local Delivery',
      benefits: [
        'Fulfill verified prescription medicine orders for home care patients across Bengaluru.',
        'Seamless integration with Health Express care managers for dosage confirmation.',
        'Fast-track doorstep delivery dispatch with digital payment receipting.'
      ]
    },
    {
      id: 'Preventive Health',
      icon: HeartPulse,
      title: 'Preventive Health & Wellness Centers',
      highlight: 'Comprehensive Health Screening & Executive Packages',
      benefits: [
        'Partner on multi-parameter executive checkups, cardiac risk screens, and diabetes management.',
        'Automated patient reminder loops for annual and semi-annual health checkups.',
        'Digital wellness summary distribution directly to patient vaults.'
      ]
    },
    {
      id: 'Genomics Lab',
      icon: Dna,
      title: 'Genomics & Precision Medicine Labs',
      highlight: 'Saliva & Blood Specimen Logistics & Genetic Counselor Review',
      benefits: [
        'Expand hereditary risk panels & pharmacogenomics reach across Bengaluru.',
        'Secure specimen handling & fast-track digital reporting.',
        'Coordinated post-report genetic counselor consultation scheduling.'
      ]
    },
    {
      id: 'Specialist Clinic',
      icon: Activity,
      title: 'Specialist & Surgical Guidance Centers',
      highlight: 'Coordinated Surgical Guidance & Patient Referral Routing',
      benefits: [
        'Connect with patients needing specialist opinions, surgical guidance, and post-op care.',
        'Dedicated care coordinator manages referral records and follow-up slots.',
        'Direct care manager communication loop for pre-op & post-op coordination.'
      ]
    }
  ];

  const currentProviderInfo = providerTypesData.find(p => p.id === activeProviderType) || providerTypesData[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoSubject = encodeURIComponent(`Provider Partnership Application: ${formData.providerName}`);
    const mailtoBody = encodeURIComponent(
      `Provider Name: ${formData.providerName}\n` +
      `Contact Person: ${formData.contactPerson}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Type: ${formData.providerType}\n` +
      `City: ${formData.city}\n` +
      `Accreditation: ${formData.accreditation}\n\n` +
      `Message / Details:\n${formData.message}`
    );
    
    window.location.href = `mailto:hello@healthexpress.care?subject=${mailtoSubject}&body=${mailtoBody}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden text-left">
      
      {/* Background ECG Heartbeat Accent */}
      <div className="absolute top-20 left-0 right-0 h-48 opacity-10 pointer-events-none -z-10 flex items-center justify-center">
        <svg viewBox="0 0 1200 120" className="w-full h-full text-purple-600 fill-none stroke-current stroke-[2] stroke-linecap-round">
          <path d="M0,60 L250,60 L280,30 L300,90 L320,10 L340,110 L360,60 L390,60 L420,60 L1200,60" className="animate-ecg" />
        </svg>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12 relative z-10">
        
        {/* Animated Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-slate-800 shadow-2xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-purple-900 uppercase tracking-wider text-[11px] font-extrabold">B2B HEALTHCARE NETWORK</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">Partner Onboarding Active</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Scale Your Healthcare Reach,<br />
            <span className="gradient-text-purple">Powered by Health Express.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Join Bengaluru’s fastest-growing connected healthcare network. We connect verified diagnostic labs, imaging centers, home nursing agencies, pharmacies, and specialty clinics with patients seamlessly.
          </p>
        </div>

        {/* Live Partner Telemetry Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="glass-card p-5 rounded-3xl border border-purple-200/80 shadow-sm space-y-1 text-center">
            <div className="text-2xl font-black text-purple-900">30 Mins</div>
            <div className="text-[11px] font-extrabold text-slate-500 uppercase">Avg Phlebotomist Dispatch</div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-purple-200/80 shadow-sm space-y-1 text-center">
            <div className="text-2xl font-black text-emerald-700">100%</div>
            <div className="text-[11px] font-extrabold text-slate-500 uppercase">Cold-Chain Temperature Log</div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-purple-200/80 shadow-sm space-y-1 text-center">
            <div className="text-2xl font-black text-purple-900">0%</div>
            <div className="text-[11px] font-extrabold text-slate-500 uppercase">Partner Setup Fee</div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-purple-200/80 shadow-sm space-y-1 text-center">
            <div className="text-2xl font-black text-emerald-700">24/7</div>
            <div className="text-[11px] font-extrabold text-slate-500 uppercase">Dedicated Care Desk</div>
          </div>
        </div>

        {/* Interactive Provider Type Switcher */}
        <div className="max-w-5xl mx-auto glass-card p-6 md:p-8 rounded-3xl border border-purple-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-700" />
                <span>Tailored Partner Integration</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select your facility category to preview specific logistics & digital benefits
              </p>
            </div>
            
            <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-black uppercase">
              Select Facility Category Below
            </span>
          </div>

          {/* Selector Tabs for All Service Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {providerTypesData.map((pt) => {
              const IconComp = pt.icon;
              const isSelected = activeProviderType === pt.id;
              return (
                <button
                  key={pt.id}
                  onClick={() => {
                    setActiveProviderType(pt.id);
                    setFormData(prev => ({ ...prev, providerType: pt.id }));
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-800 shadow-md scale-105'
                      : 'bg-white hover:bg-purple-50 text-slate-900 border-purple-100'
                  }`}
                >
                  <IconComp className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-purple-700'}`} />
                  <div className="text-[11px] font-extrabold leading-tight">{pt.id}</div>
                </button>
              );
            })}
          </div>

          {/* Active Provider Benefit Box */}
          <div className="p-6 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h4 className="text-lg font-extrabold text-slate-900">{currentProviderInfo.title}</h4>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {currentProviderInfo.highlight}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 font-semibold">
              {currentProviderInfo.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Partner Capacity Calculator */}
        <div className="max-w-4xl mx-auto glass-card p-6 md:p-8 rounded-3xl border border-purple-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Partner Capacity Estimator</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">Select Daily Processing Volume:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['15-50', '50-200', '200-500', '500+ Enterprise'].map((cap) => (
              <button
                key={cap}
                onClick={() => setDailyCapacity(cap)}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  dailyCapacity === cap
                    ? 'bg-purple-700 text-white shadow-md scale-105'
                    : 'bg-white hover:bg-purple-50 text-slate-700 border border-purple-100'
                }`}
              >
                {cap} Samples/Day
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-700 fill-purple-700" />
              <span>Estimated Logistics SLA: <strong className="text-purple-900 font-extrabold">30-Min Pickup Guarantee with Dedicated Phlebotomy Team</strong></span>
            </div>
            <button
              onClick={() => openWhatsApp(`Hello Health Express, I am interested in partnering as a ${activeProviderType} with daily processing capacity of ${dailyCapacity} samples/scans.`)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shrink-0 transition-all cursor-pointer"
            >
              Request Custom Partner SLA
            </button>
          </div>
        </div>

        {/* Benefits Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          <div className="bento-card p-8 rounded-3xl border border-purple-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Zero Customer Acquisition Cost</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Health Express drives patient volume directly to your lab, nursing unit, or pharmacy without expensive marketing expenditure.
            </p>
          </div>

          <div className="bento-card p-8 rounded-3xl border border-purple-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Seamless Care Manager Desk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our care coordinators validate prescriptions, handle patient queries, and ensure smooth post-report delivery.
            </p>
          </div>

          <div className="bento-card p-8 rounded-3xl border border-purple-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Verified Partner Trust Badge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Showcase your NABL, ISO, or ICMR accreditation to build trust among patients across Bengaluru.
            </p>
          </div>

        </div>

        {/* Provider Contact Form Section */}
        <div className="max-w-4xl mx-auto glass-card p-8 sm:p-10 rounded-3xl border border-purple-200 shadow-2xl space-y-6">
          
          <div className="flex items-center gap-4 border-b border-purple-100 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">Provider Partnership Application</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Direct submission to <strong className="text-purple-900 font-bold">hello@healthexpress.care</strong> & Provider Relations Desk
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-xl font-extrabold text-slate-900">Partner Application Submitted!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for your interest in joining the Health Express partner network. Our Provider Relations manager will review your details and contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Provider / Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    placeholder="e.g., Apex Diagnostics Center"
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g., Dr. Rajesh Kumar (Lab Director)"
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hello@facility.com"
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Facility Category *</label>
                  <select
                    value={formData.providerType}
                    onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs cursor-pointer"
                  >
                    <option value="Diagnostic Lab">Diagnostic Laboratory</option>
                    <option value="Imaging Center">Imaging & Radiology Center</option>
                    <option value="Home Nursing Agency">Home Healthcare & Nursing Agency</option>
                    <option value="Pharmacy Partner">Medicines & Pharmacy Partner</option>
                    <option value="Preventive Health">Preventive Health & Wellness Center</option>
                    <option value="Genomics Lab">Genomics & Precision Medicine Lab</option>
                    <option value="Specialist Clinic">Hospital & Specialty Clinic</option>
                    <option value="OTHERS">OTHERS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Facility Accreditation</label>
                  <select
                    value={formData.accreditation}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs cursor-pointer"
                  >
                    <option value="NABL Accredited">NABL Accredited</option>
                    <option value="ISO Certified">ISO 15189 Certified</option>
                    <option value="ICMR Approved">ICMR Approved</option>
                    <option value="NABH Hospital">NABH Accredited</option>
                    <option value="In Progress">Accreditation In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Operational City *</label>
                  <CitySearchSelect
                    value={formData.city}
                    onChange={(selectedCity) => setFormData({ ...formData, city: selectedCity })}
                    placeholder="Search city (e.g. Indore, Bengaluru)..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Message / Facility Overview</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your diagnostic equipment, daily sample capacity, and partnership goals..."
                  className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-2xs"
                ></textarea>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
                
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-700/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-purple-200" />
                  <span>Submit Partner Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWhatsApp(DEFAULT_MESSAGES.provider)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                  <span>Connect with Provider Desk on WhatsApp</span>
                </button>

              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
