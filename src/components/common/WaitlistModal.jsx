import React, { useState, useEffect } from 'react';
import { MapPin, X, Bell, CheckCircle2, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { openWhatsApp } from '../../utils/whatsapp';
import { INDIAN_CITIES } from '../../data/indianCities';
import { POPULAR_COUNTRY_CODES, validateAndNormalizeInternationalPhone } from '../../utils/phone';

export default function WaitlistModal({ isOpen, onClose, defaultCity = 'Delhi NCR' }) {
  const [city, setCity] = useState(defaultCity);
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (defaultCity) {
      setCity(defaultCity);
    }
    setIsSuccess(false);
    setErrorMsg('');
  }, [defaultCity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    
    const phoneCheck = validateAndNormalizeInternationalPhone(phone, countryCode);
    if (!phoneCheck.isValid) {
      setErrorMsg(phoneCheck.error);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const waitlistRecord = {
        name: fullName.trim(),
        phone: phoneCheck.phone_e164,
        email: email.trim(),
        city: city.trim(),
        type: 'waitlist',
        created_at: new Date().toISOString()
      };

      // 1. Save to Supabase enquiries if available
      if (isSupabaseConfigured && supabase) {
        await supabase.from('enquiries').insert([
          {
            full_name: fullName.trim(),
            phone_e164: phoneCheck.phone_e164,
            city: city.trim(),
            notes: `Waitlist entry for city expansion: ${city.trim()}`,
            status: 'waitlist_pending'
          }
        ]);
      }

      // 2. Persist to local storage waitlist
      const existingWaitlist = JSON.parse(localStorage.getItem('he_waitlist_records') || '[]');
      localStorage.setItem('he_waitlist_records', JSON.stringify([...existingWaitlist, waitlistRecord]));

      setIsSuccess(true);
    } catch (err) {
      console.warn('Waitlist submission fallback:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppWaitlist = () => {
    const msg = `Hello Health Express! I would like to join the priority launch waitlist for ${city}. Name: ${fullName || 'Interested Patient'}.`;
    openWhatsApp(msg);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-purple-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 p-6 text-white text-left relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
            <Bell className="w-40 h-40" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Coming Soon Expansion</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Expanding to <span className="text-purple-300">{city}</span> Soon!
          </h3>
          
          <p className="text-xs text-purple-100/90 mt-1 leading-relaxed">
            Health Express is currently live in <strong className="text-white font-bold">Bengaluru</strong>. Join our priority waitlist to get early launch access & exclusive healthcare benefits in {city}.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-left space-y-4">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">You're on the Waitlist!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Thank you, <strong className="text-purple-900">{fullName}</strong>! We’ve added you to the priority launch queue for <strong className="text-purple-900">{city}</strong>.
                </p>
              </div>

              <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100 text-[11px] text-purple-900 font-medium">
                🎁 Priority waitlist members receive a <strong className="font-extrabold text-purple-950">₹500 Health Credit</strong> on city launch day!
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleWhatsAppWaitlist}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Connect with Health Manager on WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-snug">
                  {errorMsg}
                </div>
              )}

              {/* Selected City Display / Selector */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Target City (Coming Soon)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-900 bg-purple-50/50 outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    <option value="Delhi NCR">Delhi NCR (Coming Soon)</option>
                    <option value="Mumbai">Mumbai (Coming Soon)</option>
                    <option value="Hyderabad">Hyderabad (Coming Soon)</option>
                    <option value="Chennai">Chennai (Coming Soon)</option>
                    <option value="Kolkata">Kolkata (Coming Soon)</option>
                    <option value="Pune">Pune (Coming Soon)</option>
                    <option value="Indore">Indore (Coming Soon)</option>
                    <option value="Ahmedabad">Ahmedabad (Coming Soon)</option>
                    <option value="Jaipur">Jaipur (Coming Soon)</option>
                    <option value="Lucknow">Lucknow (Coming Soon)</option>
                    <option value="Chandigarh">Chandigarh (Coming Soon)</option>
                    <option value="Kochi (Cochin)">Kochi (Coming Soon)</option>
                  </select>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer shrink-0"
                  >
                    {POPULAR_COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    maxLength={countryCode === '+91' ? 10 : 15}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={countryCode === '+91' ? '10-digit mobile number' : 'Mobile phone number'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Bell className="w-4 h-4 text-purple-200" />
                  <span>{isSubmitting ? 'Adding to Waitlist...' : `Join ${city} Waitlist`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppWaitlist}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Join Waitlist via WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam guarantee. Priority launch notification only.</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
