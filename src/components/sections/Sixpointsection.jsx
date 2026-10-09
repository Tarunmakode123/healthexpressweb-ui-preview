import React from 'react';
import { Microscope, ShieldCheck, Cpu, FlaskConical, Stethoscope, Award, Sparkles, CheckCircle, FileText } from 'lucide-react';

export default function ExpertiseSection() {
  // Left 3 Expertise Points
  const leftPoints = [
    {
      title: "Safe Home Sample Collection",
      desc: "Our certified phlebotomists collect your blood and diagnostic samples safely right from your doorstep following strict medical protocols.",
      icon: ShieldCheck
    },
    {
      title: "Smart Sample Tracking",
      desc: "Every sample is barcoded digitally immediately to prevent any mix-up and maintain complete chain of custody and data security.",
      icon: Award
    },
    {
      title: "Automated High-Tech Testing",
      desc: "Samples are processed using advanced automated laboratory equipment for fast, precise, and error-free screening.",
      icon: Cpu
    }
  ];

  // Right 3 Expertise Points
  const rightPoints = [
    {
      title: "Multi-Tier Quality Control",
      desc: "Every test result goes through strict internal quality checks and system calibrations to ensure complete accuracy.",
      icon: FlaskConical
    },
    {
      title: "Expert Pathologist Verification",
      desc: "Senior doctors and expert medical specialists carefully review, analyze, and sign off every single health report.",
      icon: Stethoscope
    },
    {
      title: "Fast Verified Report Delivery",
      desc: "Get your 100% clear and verified digital PDF report directly on your WhatsApp and phone within hours.",
      icon: FileText
    }
  ];

  return (
    <section className="py-16 lg:py-15 bg-gradient-to-b from-white via-slate-50/60 to-white relative overflow-hidden font-serif" id="expertise-section" style={{ fontFamily: 'serif' }}>
      
      {/* Custom Animations & Highly Prominent Sharp Edge Purple Highlight Box Style */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
        /* Strongly Highlighted Sharp Edge Expertise Card Box */
        .expertise-card-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(97, 44, 156, 0.06) 100%);
          border: 1.5px solid rgba(97, 44, 156, 0.28);
          border-left: 5px solid #612c9c;
          border-top: 3px solid rgba(97, 44, 156, 0.4);
          box-shadow: 0 10px 30px -4px rgba(97, 44, 156, 0.18);
          transition: all 0.35s ease;
        }
        .expertise-card-box:hover {
          box-shadow: 0 16px 38px -4px rgba(97, 44, 156, 0.3);
          border-color: rgba(97, 44, 156, 0.6);
          transform: translateY(-3px);
        }
      `}</style>

      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-purple-100/35 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 animate-fade-in-up">
          <span 
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none font-extrabold text-xs uppercase tracking-widest border shadow-2xs font-serif"
            style={{ backgroundColor: 'rgba(97, 44, 156, 0.06)', borderColor: 'rgba(97, 44, 156, 0.25)', color: '#612c9c', fontFamily: 'serif' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#612c9c' }} />
            Our Best Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] font-serif" style={{ fontFamily: 'serif' }}>
            Our Best Expertise To Get <br />
            <span style={{ color: '#612c9c', fontFamily: 'serif' }}>100% Clear & Accurate Results</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed font-serif" style={{ fontFamily: 'serif' }}>
            From safe doorstep sample collection to final expert review, our specialized workflow ensures absolute clarity and trust.
          </p>
        </div>

        {/* 3-Column Layout: Left Cards (3), Middle Floating Image, Right Cards (3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: 3 Cards */}
          <div className="lg:col-span-4 space-y-5 text-left">
            {leftPoints.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  className="expertise-card-box rounded-none p-5 sm:p-6 space-y-2.5 animate-fade-in-up group font-serif"
                  style={{ animationDelay: `${idx * 0.15}s`, fontFamily: 'serif' }}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-10 h-10 rounded-none flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: '#612c9c' }}
                    >
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors font-serif" style={{ fontFamily: 'serif' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed font-serif" style={{ fontFamily: 'serif' }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* MIDDLE: Floating Microscope Image (Design Unchanged) */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-6 lg:py-0">
            <div className="absolute inset-0 bg-purple-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="w-full max-w-xs sm:max-w-sm flex items-center justify-center p-4">
              <img 
                src="/images/services/microscope-img.png" 
                alt="Microscope Expertise" 
                className="w-full h-auto object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </div>

          {/* RIGHT SIDE: 3 Cards */}
          <div className="lg:col-span-4 space-y-5 text-left">
            {rightPoints.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  className="expertise-card-box rounded-none p-5 sm:p-6 space-y-2.5 animate-fade-in-up group font-serif"
                  style={{ animationDelay: `${(idx + 3) * 0.15}s`, fontFamily: 'serif' }}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-10 h-10 rounded-none flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: '#612c9c' }}
                    >
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors font-serif" style={{ fontFamily: 'serif' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed font-serif" style={{ fontFamily: 'serif' }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}