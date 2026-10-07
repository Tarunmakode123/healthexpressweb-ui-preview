import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What is Health Express?',
      a: 'Health Express is a healthcare platform that helps people discover, compare and arrange healthcare services through participating providers. Services include diagnostics, imaging, home healthcare nursing, genetic testing, and preventive healthcare, depending on location and availability.'
    },
    {
      q: 'How does Health Express work?',
      a: 'Start by uploading your prescription or medical order, or tell us what healthcare service you need. Health Express helps identify relevant services and participating providers, after which you can review the available option and proceed with booking.'
    },
    {
      q: 'Can I upload a prescription or medical order?',
      a: 'Yes. You can upload a prescription or medical order through Health Express where the service is supported. Our team or platform can use the information provided to help identify relevant healthcare services.'
    },
    {
      q: 'Can I book healthcare services at home?',
      a: 'Depending on your location and service availability, Health Express may provide access to home sample collection, nursing and other home healthcare services through participating providers.'
    },
    {
      q: 'Does Health Express provide medical advice?',
      a: 'Health Express is primarily a healthcare marketplace and coordination platform. Medical diagnosis and treatment decisions should be made with an appropriately qualified healthcare professional. Information provided through the Health Library is intended for education and should not replace professional medical advice.'
    },
    {
      q: 'Where is Health Express available?',
      a: 'Availability depends on the healthcare service and location. Explore your city or start by telling us what you need, and we can help identify available options.'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-purple-50/20 border-t border-purple-100/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-purple-700">
            GOT QUESTIONS?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-purple-100/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-slate-900 hover:text-purple-700 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
