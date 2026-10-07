import React from 'react';
import { FolderHeart, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function HealthRecordsSection() {
  return (
    <section className="py-5 md:py-10 bg-white">
      
      <style>{`
        /* Strongly Highlighted Sharp Edge Health Records Box */
        .records-card-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(97, 44, 156, 0.06) 100%);
          border: 1.5px solid rgba(97, 44, 156, 0.28);
          border-left: 5px solid #612c9c;
          border-top: 3px solid rgba(97, 44, 156, 0.4);
          box-shadow: 0 10px 30px -4px rgba(97, 44, 156, 0.18);
          transition: all 0.35s ease;
        }
        .records-card-box:hover {
          box-shadow: 0 16px 38px -4px rgba(97, 44, 156, 0.3);
          border-color: rgba(97, 44, 156, 0.6);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="records-card-box rounded-none p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-purple-700" />
              <span>DIGITAL RECORD STORAGE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Health Records and Reports
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              Keep family reports, prescriptions, and healthcare history securely organized in one place.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 pt-1">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Private & secure digital report storage for your family</span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={() => openWhatsApp("Hello Health Express, I would like to manage health records or inquire about family profiles.")}
              className="w-full sm:w-auto px-7 py-4 rounded-none bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all hover:scale-105 touch-target cursor-pointer"
            >
              <span>View Health Records</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}