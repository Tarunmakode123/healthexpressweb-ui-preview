import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection({ onOpenUploadModal }) {
  const videoRef = useRef(null);

  // Fallback handler to ensure video never disappears when it ends
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section className="relative w-full min-h-[85vh] sm:h-[90vh] flex items-center overflow-hidden bg-slate-50 py-12 lg:py-0">
      
      {/* Absolute Background Video Layer optimized for both Desktop and Mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-end">
        <div className="w-full lg:w-[70%] h-full relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            loop
            onEnded={handleVideoEnded}
            preload="auto" 
            style={{ objectPosition: 'left' }}
            className="w-full h-full object-cover opacity-60 lg:opacity-100"
          >
            <source src="/videos/newbnnerhome.mp4" type="video/mp4" />
            Your browser does not support video playback.
          </video>
          {/* Smooth gradient blend width adjusted to a balanced size */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-slate-50/40 lg:bg-gradient-to-r lg:from-slate-50 lg:via-slate-50/90 lg:to-transparent lg:w-[55%] lg:left-0 lg:right-auto" />
        </div>
      </div>

      {/* Main Content Container in 2 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT SIDE: Content */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left p-2 sm:p-0">
            
            {/* Tagline with Brand Color */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#612c9c]/10 border border-[#612c9c]/30 text-[#612c9c] font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-2xs">
                Your Trusted Healthcare
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[70px] leading-[48px] sm:leading-[70px] lg:leading-[85px] font-black tracking-tight text-slate-900">
             Your personal <br />
              <span style={{ color: '#612c9c' }}>health  </span>
              <span className="text-slate-900">manager.</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-700 font-medium leading-relaxed max-w-md pt-1">
              From diagnostics and home healthcare to specialist services and preventive care, Health Express helps you discover, coordinate and manage healthcare for you.
            </p>

            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onOpenUploadModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center sm:justify-start gap-2.5 active:scale-95 cursor-pointer"
                style={{ backgroundColor: '#612c9c', boxShadow: '0 10px 25px -5px rgba(97, 44, 156, 0.3)' }}
              >
                <span>Book Your Test</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </button>

              <Link
                to="/services"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-purple-50/50 border text-slate-900 font-bold text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center"
                style={{ borderColor: 'rgba(97, 44, 156, 0.2)' }}
              >
                <span>Explore Services</span>
              </Link>
            </div>

          </div>

          {/* RIGHT SIDE: Empty space for right-aligned background video */}
          <div className="lg:col-span-5 hidden lg:block"></div>

        </div>
      </div>
    </section>
  );
}