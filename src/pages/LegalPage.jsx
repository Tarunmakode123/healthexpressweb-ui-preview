import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Calendar, FileText, Lock, Cookie, MessageSquare, RefreshCw, Scale } from 'lucide-react';
import { LEGAL_POLICIES } from '../data/legalPolicies';

export default function LegalPage() {
  const { type = 'cookies' } = useParams();
  const navigate = useNavigate();

  const activePolicyKey = LEGAL_POLICIES[type] ? type : 'cookies';
  const policy = LEGAL_POLICIES[activePolicyKey];

  const policyTabs = [
    { key: 'cookies', label: 'Cookie Policy', icon: Cookie, href: '/legal/cookies' },
    { key: 'consent', label: 'Consent & Communications', icon: MessageSquare, href: '/legal/consent' },
    { key: 'privacy', label: 'Privacy Policy', icon: Lock, href: '/legal/privacy' },
    { key: 'refund', label: 'Refund, Shipping & Fees', icon: RefreshCw, href: '/legal/refund' },
    { key: 'terms', label: 'Terms & Conditions', icon: Scale, href: '/legal/terms' }
  ];

  return (
    <div className="py-10 md:py-16 bg-slate-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-700 hover:text-purple-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Health Express Home</span>
        </Link>

        {/* Policy Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Health Express Legal & Governance</span>
            </div>
            
            {policy?.effectiveDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>Effective Date: {policy.effectiveDate}</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {policy?.title || 'HEALTH EXPRESS LEGAL POLICY'}
          </h1>
          
          <p className="text-xs text-slate-600 leading-relaxed">
            Registered Office: Health Express, No 9 VMS Tower, Thambu Chetty Palya Main Rd, Opposite Amma’s Pastry, Bengaluru, Karnataka – 560016, India.
          </p>

          {/* Policy Selection Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 no-scrollbar">
            {policyTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activePolicyKey === tab.key;
              const hasData = Boolean(LEGAL_POLICIES[tab.key]);

              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.href)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-purple-800 text-white shadow-md shadow-purple-900/20'
                      : hasData
                      ? 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200/80'
                      : 'bg-slate-50 text-slate-400 border border-slate-200/50 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {!hasData && (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded">Pending</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Policy Document Content Area */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8 text-left">
          {policy ? (
            policy.sections.map((sec, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight text-purple-950">
                  {sec.heading}
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {sec.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-purple-300 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-900">Policy Document Pending Upload</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This legal policy document is scheduled for immediate publication. Please check back shortly or contact our legal desk at <strong className="text-purple-900">hello@healthexpress.care</strong>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
