import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  const { type } = useParams();

  const titleMap = {
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    refund: 'Refund Policy',
    cancellation: 'Cancellation Policy',
    shipping: 'Shipping & Delivery Policy'
  };

  const pageTitle = titleMap[type] || 'Legal Policy';

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3 border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Health Express Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500">Last updated: September 2025</p>
        </div>

        <div className="prose prose-purple max-w-none text-slate-700 space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to Health Express. This {pageTitle} outlines our guidelines and operational standards for customer convenience and service transparency during our website soft launch phase.
          </p>

          <h3 className="text-base font-bold text-slate-900">1. Service Scope & Coordination</h3>
          <p>
            Health Express operates as a healthcare discovery and coordination platform connecting patients with accredited diagnostic laboratories, healthcare professionals, and pharmacy partners.
          </p>

          <h3 className="text-base font-bold text-slate-900">2. Privacy & Data Handling</h3>
          <p>
            We adhere to strict confidentiality regarding patient prescriptions, diagnostic reports, and personal information shared with Health Express staff.
          </p>

          <h3 className="text-base font-bold text-slate-900">3. Cancellation & Refund Guidelines</h3>
          <p>
            Services or home sample collection appointments coordinated through Health Express staff can be cancelled or rescheduled prior to sample collection or provider dispatch.
          </p>
        </div>

      </div>
    </div>
  );
}
