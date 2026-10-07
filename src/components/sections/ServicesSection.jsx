import React, { useState } from 'react';
import { FlaskConical, HeartPulse, Camera, Home, Dna, Activity, Pill, ArrowRight, Sparkles, Upload, MessageSquare } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../../utils/whatsapp';

export default function ServicesSection({ onOpenUploadModal }) {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'diagnostics', label: 'Diagnostics & Labs' },
    { id: 'home-care', label: 'Care at Home' },
    { id: 'specialty', label: 'Specialized Care' }
  ];

  const services = [
    {
      id: 'home-nursing',
      category: 'home-care',
      title: 'Home Healthcare & Nursing',
      desc: 'Professional care, delivered where you need it.',
      fullDesc: 'Professional nursing care, eldercare, and post-op recovery coordinated around your family by verified medical professionals in Bengaluru.',
      cta: 'Explore Home Care',
      icon: Home,
      highlight: 'Home Care',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/60',
      isFeatured: true,
      image: '/hero_home_care.jpg'
    },
    {
      id: 'diagnostics',
      category: 'diagnostics',
      title: 'Diagnostics & Blood Tests',
      desc: 'Book diagnostics with convenient sample collection.',
      fullDesc: 'Book diagnostic tests and packages with home sample collection and digital report delivery.',
      cta: 'Explore Diagnostics',
      icon: FlaskConical,
      highlight: 'Home Collection',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200'
    },
    {
      id: 'preventive-health',
      category: 'diagnostics',
      title: 'Preventive Health Packages',
      desc: 'Stay ahead with comprehensive health checkups.',
      fullDesc: 'Stay ahead with comprehensive checkups for every age and family member.',
      cta: 'Explore Health Packages',
      icon: HeartPulse,
      highlight: 'Full Body Checkups',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200'
    },
    {
      id: 'medicines',
      category: 'home-care',
      title: 'Medicines & Health Products',
      desc: 'Prescribed medicines and health essentials delivered.',
      fullDesc: 'Order prescribed medicines and health essentials delivered directly to your doorstep.',
      cta: 'Order Medicines',
      icon: Pill,
      highlight: 'Doorstep Delivery',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200'
    },
    {
      id: 'imaging',
      category: 'diagnostics',
      title: 'Imaging & Scans',
      desc: 'Access and coordinate X-Ray, MRI and CT scans.',
      fullDesc: 'Convenient access and coordination for X-Ray, Ultrasound, MRI, and CT scans.',
      cta: 'Explore Imaging',
      icon: Camera,
      highlight: 'Partner Centres',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-200'
    },
    {
      id: 'genetic-testing',
      category: 'specialty',
      title: 'Genetic Testing',
      desc: 'Personalized screening and hereditary health insights.',
      fullDesc: 'Personalized DNA and hereditary screening insights for better-informed care decisions.',
      cta: 'Explore Genomics',
      icon: Dna,
      highlight: 'Hereditary Screening',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200'
    },
    {
      id: 'surgical-care',
      category: 'specialty',
      title: 'Specialist & Surgical Guidance',
      desc: 'Navigate specialist care with coordinated support.',
      fullDesc: 'Navigate procedures with trusted specialists and care coordination support.',
      cta: 'Explore Guidance',
      icon: Activity,
      highlight: 'Specialist Support',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-200'
    }
  ];

  const featuredService = services[0];
  const rightColumnServices = [services[1], services[2]];
  const bottomRowServices = [services[3], services[4], services[5], services[6]];

  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(s => s.category === activeTab);

  const handleServiceClick = (service) => {
    openWhatsApp(DEFAULT_MESSAGES.service(service.title));
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 relative overflow-hidden" id="services">
      
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>ONE CONNECTED HEALTHCARE PLATFORM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            One Platform. <span className="text-purple-700">Every Healthcare Need.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            From diagnostics and home healthcare to medicines, preventive care and specialist support — Health Express brings your connected healthcare journey together in one single platform.
          </p>

          {/* Quick Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenUploadModal && onOpenUploadModal()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-700/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Prescription</span>
            </button>
            <button
              onClick={() => openWhatsApp("Hello Health Express, I would like to talk to a Personal Care Manager.")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Talk to Health Manager</span>
            </button>
          </div>
        </div>

        {/* Category Segmented Control Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer touch-target ${
                activeTab === cat.id
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25 scale-[1.02]'
                  : 'bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-800 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* BENTO COMPOSITION */}
        {activeTab === 'all' ? (
          <div className="space-y-6">
            
            {/* Top Bento Layout: 55% / 45% Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LARGE FEATURED CARD (55% width on desktop) */}
              <div
                onClick={() => handleServiceClick(featuredService)}
                className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-400/80 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[420px] p-7 sm:p-10 transform hover:-translate-y-1"
              >
                {/* Visual Background Image with Smooth Gradient Overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={featuredService.image}
                    alt={featuredService.title}
                    className="w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
                </div>

                {/* Card Header Content */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                      <Home className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                      {featuredService.highlight}
                    </span>
                  </div>

                  <div className="pt-4 max-w-xl">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                      {featuredService.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                      "{featuredService.desc}"
                    </p>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Nursing, Eldercare & Post-Op Support
                  </span>
                  <div className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-300 group-hover:text-white transition-colors">
                    <span>{featuredService.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN STACK (45% width on desktop) */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                {rightColumnServices.map((service) => {
                  const IconComp = service.icon;
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${service.badgeColor}`}>
                            {service.highlight}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors">
                            {service.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                            {service.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-2">
                        <div className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-700 group-hover:text-purple-900 transition-colors">
                          <span>{service.cta}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Row: 4 Supporting Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bottomRowServices.map((service) => {
                const IconComp = service.icon;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${service.badgeColor}`}>
                          {service.highlight}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-2">
                      <div className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-700 group-hover:text-purple-900 transition-colors">
                        <span>{service.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Filtered Category Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComp = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-700/20 group-hover:scale-105 transition-transform">
                        <IconComp className="w-5.5 h-5.5" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${service.badgeColor}`}>
                        {service.highlight}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {service.fullDesc || service.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-700 group-hover:text-purple-900 transition-colors">
                      <span>{service.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expansion notice */}
        <div className="text-center pt-2 text-xs font-bold text-purple-900 bg-purple-100/60 py-2.5 px-6 rounded-full max-w-md mx-auto border border-purple-200">
          ⚡ More healthcare verticals & partner labs being onboarded continuously across Bengaluru.
        </div>

      </div>
    </section>
  );
}
