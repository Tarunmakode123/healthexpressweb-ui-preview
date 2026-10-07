import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Stethoscope, Upload, MessageSquare, ArrowRight, ShieldCheck, ChevronRight, 
  CheckCircle2, Building2, UserCheck, Clock, FileText, AlertCircle, Phone
} from 'lucide-react';
import { getSurgeryBySlug } from '../data/surgeries';
import { openWhatsApp } from '../utils/whatsapp';
import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

export default function SurgeryDetailPage({ onOpenUploadModal }) {
  const { slug } = useParams();
  const surgery = getSurgeryBySlug(slug);

  const handleWhatsAppInquiry = () => {
    openWhatsApp(`Hello Health Express!\n\nI am seeking information & specialist consultation for:\nProcedure: ${surgery.name}\nCategory: ${surgery.category}\n\nPlease help me connect with top surgeons and get an estimated cost for this procedure.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-purple-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/surgeries" className="hover:text-purple-700 transition-colors">Surgeries</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-purple-900 font-bold truncate max-w-[200px]">{surgery.name}</span>
        </nav>

        {/* HERO BANNER SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl shadow-purple-900/5 space-y-6">
          <DiscountHeroBanner />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                {surgery.category}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                🏥 Custom Estimate & Insurance Assistance
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {surgery.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {surgery.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleWhatsAppInquiry}
              className="px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Get Surgery & Specialist Assistance</span>
            </button>

            <button
              onClick={onOpenUploadModal}
              className="px-6 py-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-sm shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Medical Reports</span>
            </button>
          </div>
        </div>

        {/* PRICING & SECOND OPINION CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 border border-purple-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/80 pb-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-purple-300 tracking-wider">Estimated Treatment Cost</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">Price Available On Request</div>
            </div>
            <button
              onClick={handleWhatsAppInquiry}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>Request Custom Cost Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hospital & Surgeon Comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Specialist Second Opinion</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Administrative Coordination</span>
            </div>
          </div>
        </div>

        {/* PROCEDURE DETAILS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-700" />
              <span>Why is this Procedure Done?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {surgery.whyDone}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-700" />
              <span>Pre-Operative Assessment & Preparation</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {surgery.preparation}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
