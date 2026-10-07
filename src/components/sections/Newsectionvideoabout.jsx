import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Zap, Lock, Timer, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HealthcareChallengeSection({ onOpenUploadModal }) {
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  // Safe handler that triggers parent modal or falls back to local modal
  const handleOpenModal = () => {
    if (typeof onOpenUploadModal === 'function') {
      onOpenUploadModal();
    } else {
      setIsLocalModalOpen(true);
    }
  };

  const trustPoints = [
    {
      title: "Fastest Service & 100% Results",
      desc: "Get instant report generation and accurate diagnostics delivered faster than ever with a single click.",
      icon: Timer
    },
    {
      title: "Trusted NABL & ICMR Labs",
      desc: "Uncompromised testing precision backed by India's top accredited diagnostic networks.",
      icon: ShieldCheck
    },
    {
      title: "Secure & Encrypted Reports",
      desc: "HIPAA-compliant digital record storage so your health data remains private and accessible 24/7.",
      icon: Lock
    }
  ];

  return (
    <section className="py-14 lg:py-15 bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-slate-100 relative overflow-hidden" id="healthcare-challenge">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT SIDE: Larger Big & Small Overlapping Image Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative flex items-center justify-center p-4">
              
              {/* Decorative background shape */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none -z-10"
                style={{ backgroundColor: '#612c9c' }}
              />

              {/* Main Big Image (smileimg.jpg) - Increased height & width */}
              <div className="relative w-full max-w-[730px] h-[420px] sm:h-[630px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group z-10">
                <img 
                  src="/images/services/smileimg.jpg" 
                  alt="Healthcare Patient Care" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Top Corner Trust Badge */}
                <div className="absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#612c9c' }} />
                  <span>NABL Accredited Partners</span>
                </div>
              </div>

              {/* Small Overlapping Image (smileimagetewo.jpg) - Made larger & balanced */}
              <div className="absolute bottom-6 right-2 sm:-right-4 w-[210px] sm:w-[260px] h-[160px] sm:h-[200px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group z-20">
                <img 
                  src="/images/services/smileimagetewo.jpg" 
                  alt="Doctor Consultation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Interactive Badge (Placed at bottom left) */}
              <div className="absolute -bottom-4 left-2 sm:left-4 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-purple-100 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg shadow-purple-900/20"
                  style={{ backgroundColor: '#612c9c' }}
                >
                  <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-black text-slate-900">One-Click Booking</h4>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Express</span>
                  </div>
                  <p className="text-[9px] text-slate-600 font-medium">Lightning-fast verified results.</p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: User Trust & Fastest Service Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Header Heading */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Get <span style={{ color: '#612c9c' }}>instant, accurate service</span> in just <span className="underline decoration-purple-300 underline-offset-4">one click</span>.
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Experience healthcare built around absolute speed and precision. Book your diagnostic tests instantly, enjoy seamless doorstep sample collection, and trust verified reports every single time.
              </p>
            </div>

            {/* Trust Points List */}
            <div className="space-y-3.5 pt-1">
              {trustPoints.map((point, idx) => {
                const IconComponent = point.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-purple-300 transition-all group">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm mt-0.5 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: '#612c9c' }}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {point.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenModal}
                className="px-6 py-3 rounded-xl text-white font-extrabold text-xs shadow-lg shadow-purple-900/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                style={{ backgroundColor: '#612c9c' }}
              >
                <span>Book Diagnostic Test</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </button>

              <Link
                to="/services"
                className="px-6 py-3 rounded-xl bg-white hover:bg-purple-50/50 border border-purple-200 text-slate-900 font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center shadow-2xs"
              >
                <span>Explore All Services</span>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Fallback Local Enquiry Modal if parent prop is missing */}
      {isLocalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsLocalModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1 text-left">
              <h3 className="text-xl font-black text-slate-900">Book Your Test / Inquiry</h3>
              <p className="text-xs text-slate-500 font-medium">Fill out your details below and our health expert will connect with you instantly.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Enquiry submitted successfully!'); setIsLocalModalOpen(false); }} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input type="text" required placeholder="Enter your name" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input type="tel" required placeholder="Enter 10-digit mobile number" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Test / Service</label>
                <input type="text" placeholder="e.g. CBC Test, Diabetes Checkup" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600" />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 rounded-xl text-white font-extrabold text-xs shadow-md transition-all mt-2 cursor-pointer"
                style={{ backgroundColor: '#612c9c' }}
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}