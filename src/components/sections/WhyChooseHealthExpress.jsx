import React from 'react';
import { Sparkles } from 'lucide-react';

// Custom Healthcare SVG Mini-Illustrations
const HomeCollectionIllustration = () => (
  <svg className="w-12 h-12 text-purple-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="url(#grad-home-bg)" opacity="0.2" />
    <path d="M12 30L32 14L52 30V48C52 50.2091 50.2091 52 48 52H16C13.7909 52 12 50.2091 12 48V30Z" fill="url(#grad-home-wall)" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M26 52V36C26 34.3431 27.3431 33 29 33H35C36.6569 33 38 34.3431 38 36V52" stroke="#6D28D9" strokeWidth="2.5" />
    {/* Phlebotomy Sample Vial */}
    <rect x="39" y="24" width="12" height="22" rx="6" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
    <rect x="41" y="32" width="8" height="10" rx="3" fill="#10B981" opacity="0.85" />
    <path d="M42 24H48" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    {/* Medical Cross Badge on House */}
    <circle cx="32" cy="25" r="5" fill="#7C3AED" />
    <path d="M32 22V28M29 25H35" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="grad-home-bg" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="grad-home-wall" x1="12" y1="14" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F3FF" />
        <stop offset="1" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
  </svg>
);

const ExpressReportIllustration = () => (
  <svg className="w-12 h-12 text-purple-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Document */}
    <rect x="12" y="10" width="32" height="44" rx="4" fill="url(#grad-doc)" stroke="#6D28D9" strokeWidth="2.5" />
    <line x1="18" y1="20" x2="34" y2="20" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="26" x2="30" y2="26" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="32" x2="26" y2="32" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
    {/* 6-Hr Express Clock */}
    <circle cx="42" cy="40" r="16" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2.5" />
    <circle cx="42" cy="40" r="13" fill="#F5F3FF" />
    <path d="M42 30V40L48 43" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Speed Rays */}
    <path d="M42 20L42 17M49 23L51 21M35 23L33 21" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    {/* 6h Badge */}
    <rect x="36" y="47" width="12" height="7" rx="3.5" fill="#10B981" />
    <text x="42" y="52.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">6h</text>
    <defs>
      <linearGradient id="grad-doc" x1="12" y1="10" x2="44" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F3E8FF" />
      </linearGradient>
    </defs>
  </svg>
);

const HealthManagerIllustration = () => (
  <svg className="w-12 h-12 text-purple-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Manager Avatar Base */}
    <circle cx="30" cy="30" r="22" fill="url(#grad-mgr-bg)" stroke="#6D28D9" strokeWidth="2.5" />
    <circle cx="30" cy="24" r="7" fill="#6D28D9" />
    <path d="M18 44C18 37.3726 23.3726 32 30 32C36.6274 32 42 37.3726 42 44V48H18V44Z" fill="#7C3AED" />
    {/* Headset */}
    <path d="M21 24C21 19.0294 25.0294 15 30 15C34.9706 15 39 19.0294 39 24" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="19" y="21" width="4" height="7" rx="2" fill="#059669" />
    <rect x="37" y="21" width="4" height="7" rx="2" fill="#059669" />
    <path d="M39 26L35 29" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    {/* Chat Check Bubble */}
    <circle cx="48" cy="42" r="11" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M44 42L47 45L53 39" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="grad-mgr-bg" x1="8" y1="8" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F3FF" />
        <stop offset="1" stopColor="#DDD6FE" />
      </linearGradient>
    </defs>
  </svg>
);

const NablLabsIllustration = () => (
  <svg className="w-12 h-12 text-purple-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Lab Flask */}
    <path d="M24 12H34M29 12V22L39.5 39.5C41.3856 42.6427 39.1172 46.5 35.4542 46.5H22.5458C18.8828 46.5 16.6144 42.6427 18.5 39.5L29 22" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 35H37L35.5 40C34.5 42.5 32.5 44 29 44C25.5 44 23.5 42.5 22.5 40L21 35Z" fill="url(#grad-flask-liquid)" opacity="0.85" />
    <circle cx="29" cy="30" r="2" fill="#7C3AED" />
    <circle cx="32" cy="25" r="1.5" fill="#10B981" />
    <circle cx="26" cy="27" r="1" fill="#7C3AED" />
    {/* NABL Quality Shield */}
    <path d="M42 16L54 20V32C54 40.5 48 47.5 42 51C36 47.5 30 40.5 30 32V20L42 16Z" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M37 32L40.5 35.5L47 28.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="grad-flask-liquid" x1="21" y1="35" x2="37" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
);

const TransparentPricingIllustration = () => (
  <svg className="w-12 h-12 text-purple-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Price Tag Base */}
    <path d="M14 26L28 12H48C50.2091 12 52 13.7909 52 16V36C52 38.2091 50.2091 40 48 40H28L14 26Z" fill="url(#grad-tag-bg)" stroke="#6D28D9" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="44" cy="20" r="3" fill="#6D28D9" />
    {/* Indian Rupee ₹ Glyph */}
    <path d="M26 20H36M26 24H34M26 20V32M26 24L33 32" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Verified Discount % Seal */}
    <circle cx="24" cy="42" r="13" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    <text x="24" y="46.5" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">%</text>
    <defs>
      <linearGradient id="grad-tag-bg" x1="14" y1="12" x2="52" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F3FF" />
        <stop offset="1" stopColor="#DDD6FE" />
      </linearGradient>
    </defs>
  </svg>
);

const DataPrivacyIllustration = () => (
  <svg className="w-12 h-12 text-purple-700" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Patient File Folder */}
    <rect x="12" y="18" width="34" height="38" rx="4" fill="url(#grad-priv-file)" stroke="#6D28D9" strokeWidth="2.5" />
    <line x1="18" y1="26" x2="34" y2="26" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="32" x2="30" y2="32" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="38" x2="26" y2="38" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
    {/* Padlock */}
    <rect x="34" y="30" width="18" height="18" rx="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M38 30V24C38 21.2386 40.2386 19 43 19C45.7614 19 48 21.2386 48 24V30" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="43" cy="38" r="2" fill="#FFFFFF" />
    <line x1="43" y1="40" x2="43" y2="43" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Shield Check Badge */}
    <circle cx="16" cy="18" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M13.5 18L15.5 20L18.5 16.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="grad-priv-file" x1="12" y1="18" x2="46" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F3FF" />
        <stop offset="1" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
  </svg>
);

export default function WhyChooseHealthExpress() {
  const highlights = [
    {
      num: '01',
      title: 'Free Home Collection',
      desc: 'Doorstep sample pickup by certified phlebotomists.',
      Illustration: HomeCollectionIllustration
    },
    {
      num: '02',
      title: 'Express 6-Hr Reports',
      desc: 'NABL accredited, digitally verified PDF reports.',
      Illustration: ExpressReportIllustration
    },
    {
      num: '03',
      title: 'Dedicated Health Manager',
      desc: '1-on-1 assistance on WhatsApp & phone.',
      Illustration: HealthManagerIllustration
    },
    {
      num: '04',
      title: 'NABL & ICMR Labs',
      desc: 'Partnered with top accredited diagnostic centers.',
      Illustration: NablLabsIllustration
    },
    {
      num: '05',
      title: 'Transparent Pricing',
      desc: 'Save up to 70% off MRP with zero hidden fees.',
      Illustration: TransparentPricingIllustration
    },
    {
      num: '06',
      title: '100% Data Privacy',
      desc: 'Encrypted, HIPAA-compliant patient record safety.',
      Illustration: DataPrivacyIllustration
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50/40 via-white to-white border-b border-purple-100/60" aria-label="Why Choose Health Express Benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-[11px] font-extrabold uppercase tracking-widest text-purple-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>THE HEALTH EXPRESS ADVANTAGE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose <span className="gradient-text-purple">Health Express?</span>
          </h2>
        </div>

        {/* 6 Numbered Feature Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 items-stretch">
          {highlights.map((item) => {
            const Illustration = item.Illustration;
            return (
              <div 
                key={item.num}
                className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs hover:shadow-xl hover:border-purple-300 hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center justify-between space-y-4 group min-h-[250px] h-full relative overflow-hidden"
              >
                {/* Numbered Pill Badge */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 shadow-2xs">
                    {item.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                </div>

                {/* Custom Healthcare Vector Illustration Container */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100/40 to-indigo-50 border border-purple-100/80 flex items-center justify-center relative shadow-xs group-hover:scale-110 group-hover:shadow-md group-hover:border-purple-300 transition-all duration-300 mx-auto">
                  <Illustration />
                </div>

                {/* Card Title & Description */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors leading-snug min-h-[2.5rem] flex items-center justify-center">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium min-h-[2.5rem] flex items-center justify-center">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
