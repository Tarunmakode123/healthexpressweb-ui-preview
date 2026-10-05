import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../../utils/whatsapp';

export default function Footer({ onOpenUploadModal }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info (Spans 2 columns on lg screens) */}
          <div className="col-span-2 space-y-4 pr-4">
            <Link to="/" className="inline-block bg-white p-2.5 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
              <img 
                src="/logo.png" 
                alt="Health Express - Everything Health Fast Tracked" 
                className="h-12 sm:h-14 md:h-16 w-auto object-contain"
              />
            </Link>
            
            <p className="text-xs font-semibold text-purple-400 tracking-wider uppercase">
              Your personal health manager, for you and your family.
            </p>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Health Express helps you find, coordinate and manage healthcare for yourself and your family — starting with diagnostics and home nursing.
            </p>

            {/* Official Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://www.instagram.com/healthexpress_india" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-900/80 hover:text-purple-300 flex items-center justify-center text-slate-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/HealthExpressIndia/" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-900/80 hover:text-purple-300 flex items-center justify-center text-slate-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/healthexpressindia" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-900/80 hover:text-purple-300 flex items-center justify-center text-slate-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"/>
                </svg>
              </a>
              <a 
                href="https://x.com/HealthExpressIN" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-purple-900/80 hover:text-purple-300 flex items-center justify-center text-slate-400 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/surgeries" className="hover:text-purple-400 transition-colors font-bold text-purple-300">Surgeries & Treatment Options</Link></li>
              <li><Link to="/services" className="hover:text-purple-400 transition-colors">Lab Tests</Link></li>
              <li><Link to="/services" className="hover:text-purple-400 transition-colors">Preventive Health Packages</Link></li>
              <li><Link to="/services" className="hover:text-purple-400 transition-colors">Imaging Scans</Link></li>
              <li><Link to="/services" className="hover:text-purple-400 transition-colors">Home Nursing</Link></li>
            </ul>
          </div>

          {/* Column 2: Popular Tests */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => openWhatsApp(DEFAULT_MESSAGES.test('CBC Test'))} className="hover:text-purple-400 transition-colors text-left">CBC Test</button></li>
              <li><button onClick={() => openWhatsApp(DEFAULT_MESSAGES.test('Thyroid Test'))} className="hover:text-purple-400 transition-colors text-left">Thyroid Test</button></li>
              <li><button onClick={() => openWhatsApp(DEFAULT_MESSAGES.test('Vitamin D Test'))} className="hover:text-purple-400 transition-colors text-left">Vitamin D Test</button></li>
              <li><button onClick={() => openWhatsApp(DEFAULT_MESSAGES.test('HbA1c Test'))} className="hover:text-purple-400 transition-colors text-left">HbA1c Test</button></li>
              <li><button onClick={() => openWhatsApp(DEFAULT_MESSAGES.test('Full Body Checkup'))} className="hover:text-purple-400 transition-colors text-left">Full Body Checkup</button></li>
            </ul>
          </div>

          {/* Column 3: Health Library & Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Library & Calculators
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/health-calculators" className="hover:text-purple-400 transition-colors font-bold text-purple-300">Free Health Calculators</Link></li>
              <li><Link to="/health-calculators/bmi-calculator" className="hover:text-purple-400 transition-colors">BMI Calculator</Link></li>
              <li><Link to="/health-calculators/calorie-calculator" className="hover:text-purple-400 transition-colors">Daily Calorie Calculator</Link></li>
              <li><Link to="/health-calculators/due-date-calculator" className="hover:text-purple-400 transition-colors">Pregnancy Due Date</Link></li>
              <li><Link to="/health-calculators/blood-pressure-checker" className="hover:text-purple-400 transition-colors">Blood Pressure Checker</Link></li>
              <li><Link to="/health-library" className="hover:text-purple-400 transition-colors">Evidence Articles</Link></li>
            </ul>
          </div>

          {/* Column 4: Locations & Company */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Locations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => openWhatsApp(DEFAULT_MESSAGES.city('Bengaluru'))} className="hover:text-purple-400 transition-colors text-left flex items-center gap-1.5 font-bold text-purple-300">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>Bengaluru</span>
                  </button>
                </li>
                <li className="text-[11px] text-slate-500 pt-1">
                  Expanding to more cities soon
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Company
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
                <li><Link to="/about" className="hover:text-purple-400 transition-colors">How It Works</Link></li>
                <li><Link to="/about" className="hover:text-purple-400 transition-colors">Trust & Quality</Link></li>
                <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
                <li><Link to="/providers" className="hover:text-purple-400 transition-colors">For Providers</Link></li>
                <li><Link to="/admin" className="hover:text-purple-400 transition-colors font-bold text-purple-400">Team Admin Portal 🔒</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Legal Links Bar */}
        <div className="pt-8 pb-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap gap-5">
            <Link to="/legal/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
            <Link to="/legal/refund" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
            <Link to="/legal/cancellation" className="hover:text-slate-300 transition-colors">Cancellation Policy</Link>
            <Link to="/legal/shipping" className="hover:text-slate-300 transition-colors">Shipping Policy</Link>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <span>A healthier tomorrow, together.</span>
            <Heart className="w-3.5 h-3.5 text-purple-500 fill-current ml-1" />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-slate-600 pt-4 border-t border-slate-800/40 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} Health Express. All rights reserved.
          </div>
          <div>
            Your personal health manager, for you and your family.
          </div>
        </div>

      </div>
    </footer>
  );
}
