import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null); // No FAQ active/open by default

  const faqs = [
    {
      question: "What is Health Express?",
      answer: "Health Express is a healthcare platform that helps people discover, compare and arrange healthcare services through participating providers. Services include diagnostics, imaging, home healthcare nursing, genetic testing, and preventive healthcare, depending on location and availability."
    },
    {
      question: "How does Health Express work?",
      answer: "Start by uploading your prescription or medical order, or tell us what healthcare service you need. Health Express helps identify relevant services and participating providers, after which you can review the available option and proceed with booking."
    },
    {
      question: "Can I upload a prescription or medical order?",
      answer: "Yes. You can upload a prescription or medical order through Health Express where the service is supported. Our team or platform can use the information provided to help identify relevant healthcare services."
    },
    {
      question: "Can I book healthcare services at home?",
      answer: "Depending on your location and service availability, Health Express may provide access to home sample collection, nursing and other home healthcare services through participating providers."
    },
    {
      question: "Does Health Express provide medical advice?",
      answer: "Health Express is primarily a healthcare marketplace and coordination platform. Medical diagnosis and treatment decisions should be made with an appropriately qualified healthcare professional. Information provided through the Health Library is intended for education and should not replace professional medical advice."
    },
    {
      question: "Where is Health Express available?",
      answer: "Availability depends on the healthcare service and location. Explore your city or start by telling us what you need, and we can help identify available options."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-5 lg:py-10 bg-white relative overflow-hidden" id="faq-section">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span 
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-extrabold text-xs uppercase tracking-wider border"
            style={{ backgroundColor: 'rgba(97, 44, 156, 0.05)', borderColor: 'rgba(97, 44, 156, 0.2)', color: '#612c9c' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#612c9c' }} />
            GOT QUESTIONS?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Frequently Asked <span style={{ color: '#612c9c' }}>Questions</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Find answers to common questions about our services, bookings, and home healthcare options.
          </p>
        </div>

        {/* 2-Column Layout: One Side Big Image, One Side FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT SIDE: Bigger Image Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-lg bg-white p-4 rounded-3xl border-2 border-purple-100 shadow-2xl overflow-hidden group">
              <div className="absolute top-6 left-6 z-10 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4" style={{ color: '#612c9c' }} />
                <span>Health Express Assistance</span>
              </div>
              <div className="h-[420px] sm:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-100">
                <img 
                  src="/images/services/testimggnew.webp" 
                  alt="Health Express Support" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Floating Trust Indicator Card */}
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-purple-100 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                  style={{ backgroundColor: '#612c9c' }}
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Need More Clarity?</h4>
                  <p className="text-[11px] text-slate-600 font-medium">Our health experts are available 24/7.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Open/Close Accordion FAQs (All Closed Initially) */}
          <div className="lg:col-span-7 space-y-3.5 text-left">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-2xs ${
                    isOpen ? 'border-purple-300 shadow-md' : 'border-slate-200/80 hover:border-purple-200'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-extrabold text-slate-900 text-sm sm:text-base cursor-pointer focus:outline-none"
                  >
                    <span className={isOpen ? "text-[#612c9c]" : "text-slate-900"}>
                      {faq.question}
                    </span>
                    <div 
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-[#612c9c] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}