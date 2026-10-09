import React, { useRef } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function WhyHealthExpressSection() {
  const videoRef = useRef(null);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const advantages = [
    {
      num: '01',
      title: 'Free Home Collection',
      desc: 'Doorstep sample pickup by certified phlebotomists.'
    },
    {
      num: '02',
      title: 'Express 6-Hr Reports',
      desc: 'NABL accredited, digitally verified PDF reports.'
    },
    {
      num: '03',
      title: 'Dedicated Health Manager',
      desc: '1-on-1 assistance on WhatsApp & phone.'
    },
    {
      num: '04',
      title: 'NABL & ICMR Labs',
      desc: 'Partnered with top accredited diagnostic centers.'
    },
    {
      num: '05',
      title: 'Transparent Pricing',
      desc: 'Save up to 70% off MRP with zero hidden fees.'
    },
    {
      num: '06',
      title: '100% Data Privacy',
      desc: 'Encrypted, HIPAA-compliant patient record.'
    }
  ];

  return (
    <section className="py-16 lg:py-6 bg-slate-50 border-t border-purple-100/60 relative overflow-hidden font-serif" id="why-choose-us" style={{ fontFamily: 'serif' }}>
      
      <style>{`
        /* Strongly Highlighted Sharp Edge Advantage Box Style */
        .advantage-card-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(97, 44, 156, 0.06) 100%);
          border: 1.5px solid rgba(97, 44, 156, 0.28);
          border-left: 5px solid #612c9c;
          border-top: 3px solid rgba(97, 44, 156, 0.4);
          box-shadow: 0 10px 30px -4px rgba(97, 44, 156, 0.18);
          transition: all 0.35s ease;
        }
        .advantage-card-box:hover {
          box-shadow: 0 16px 38px -4px rgba(97, 44, 156, 0.3);
          border-color: rgba(97, 44, 156, 0.6);
          transform: translateY(-3px);
        }
      `}</style>

      {/* Absolute Full Section Background Video Layer with Left Fade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-end">
        <div className="w-full lg:w-[65%] h-full relative">
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
            <source src="/videos/fineltest.mp4" type="video/mp4" />
            Your browser does not support video playback.
          </video>
          {/* Smooth gradient blend on the left so cards text remains completely readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent lg:w-[75%] lg:left-0 lg:right-auto" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT SIDE: Title & 6 Content Cards (3x2 Grid) */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Section Header */}
            <div className="space-y-3">
              <span 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none font-extrabold text-xs uppercase tracking-wider border shadow-2xs font-serif"
                style={{ backgroundColor: 'rgba(97, 44, 156, 0.08)', borderColor: 'rgba(97, 44, 156, 0.25)', color: '#612c9c', fontFamily: 'serif' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#612c9c' }} />
                THE HEALTH EXPRESS ADVANTAGE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] font-serif" style={{ fontFamily: 'serif' }}>
                Why Choose <span style={{ color: '#612c9c', fontFamily: 'serif' }}>Health Express?</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl leading-relaxed font-serif" style={{ fontFamily: 'serif' }}>
                Experience seamless diagnostics and professional care built around your health, convenience, and absolute trust.
              </p>
            </div>

            {/* 6 Boxes in 3x2 Grid with Sharp Edges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {advantages.map((item, idx) => (
                <div 
                  key={idx}
                  className="advantage-card-box rounded-none p-4 sm:p-4.5 flex flex-col justify-between group font-serif"
                  style={{ fontFamily: 'serif' }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-none border shadow-2xs bg-white font-serif"
                        style={{ borderColor: 'rgba(97, 44, 156, 0.25)', color: '#612c9c', fontFamily: 'serif' }}
                      >
                        {item.num}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors line-clamp-1 font-serif" style={{ fontFamily: 'serif' }}>
                      {item.title}
                    </h3>
                    
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 font-serif" style={{ fontFamily: 'serif' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT SIDE: Empty space for background video banner overlay */}
          <div className="lg:col-span-5 hidden lg:block"></div>

        </div>

      </div>
    </section>
  );
}