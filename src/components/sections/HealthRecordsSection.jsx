import React from 'react';
import { FolderHeart, FileText, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function HealthRecordsSection() {
  return (
    // Main section with correct public folder path for recordimg.png
    <section 
      className="py-16 md:py-14 bg-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/services/recordimg.png')" }}
    >
      {/* Dark overlay to ensure background image balances with the text box */}
      <div className="absolute inset-0 bg-black/35"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex justify-end">
        {/* Content Box: White shadow overlay positioned on the right corner */}
        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-10 max-w-xl w-full shadow-2xl shadow-black/25 rounded-none border border-white/20 space-y-5 text-left">
          
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold uppercase tracking-wide">
            <FolderHeart className="w-4 h-4 text-purple-700" />
            <span>Smart Digital Vault</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
            All Your Health Records in One Secure Locker
          </h2>

          {/* Description Text */}
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
            Keep family reports, prescriptions, and medical history organized. Access your records from anywhere in the world—just a quick signup away!
          </p>

          {/* Key Benefit Points */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
              <Globe className="w-5 h-5 text-purple-700 shrink-0" />
              <span>Access from anywhere, anytime instantly</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <span>100% Secure & Private digital storage</span>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="pt-4">
            <button
              onClick={() => openWhatsApp("Hello Health Express, I'd like to sign up and secure my health records in the digital locker.")}
              className="w-full sm:w-auto px-8 py-4 rounded-none bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <span>Get Started with Signup</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}