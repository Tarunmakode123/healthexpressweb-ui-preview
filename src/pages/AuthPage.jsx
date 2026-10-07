import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Phone, User, ArrowRight, CheckCircle2, ShieldCheck, 
  Sparkles, AlertCircle, RefreshCw, ChevronLeft, Gift, Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';
import { POPULAR_COUNTRY_CODES, validateAndNormalizeInternationalPhone } from '../utils/phone';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, isLoggedIn, user, session } = useAuth();
  const { walletSettings } = useCart();

  // Form Fields for Mobile OTP
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // OTP Step State (6-Digit SMS OTP)
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Status & Validation
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in, redirect directly to /dashboard
  useEffect(() => {
    if (session?.user || (isLoggedIn && user)) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isLoggedIn, user, navigate]);

  // OTP Timer countdown (60s)
  useEffect(() => {
    let timer;
    if (otpStep && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [otpStep, otpTimer]);

  // Handle Phone Submit (Step 1: Request OTP via Supabase Auth)
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const phoneCheck = validateAndNormalizeInternationalPhone(phone, countryCode);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error);
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Record OTP_REQUESTED analytics event
      try {
        const { logAnalyticsEvent } = await import('../utils/analytics.js');
        await logAnalyticsEvent('OTP_REQUESTED', { metadata: { auth_method: 'phone_otp', phone: phoneCheck.phone_e164 } });
      } catch (e) {
        // Non-blocking
      }

      // 2. Trigger Supabase Auth signInWithOtp (fires Supabase Send SMS Hook to Fast2SMS)
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase.js');
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase environment is not configured.');
        setIsSubmitting(false);
        return;
      }

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        phone: phoneCheck.phone_e164
      });

      if (otpErr) {
        console.warn('Supabase signInWithOtp notice:', otpErr.message);
        if (otpErr.message?.toLowerCase().includes('unsupported phone provider') || otpErr.message?.toLowerCase().includes('provider')) {
          setError('Phone Provider is currently disabled in Supabase. Please enable "Phone Provider" under Supabase Dashboard -> Auth -> Providers.');
        } else {
          setError(otpErr.message || 'Unable to send OTP right now. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setOtpStep(true);
      setOtpTimer(60);
      setCanResendOtp(false);
      setSuccessMessage(`A 6-digit OTP code has been sent to ${phoneCheck.phone_e164}`);
    } catch (err) {
      console.error('Send OTP exception:', err);
      setIsSubmitting(false);
      setError(err.message || 'Error requesting OTP. Please try again.');
    }
  };

  // Handle OTP Input Change for 6 Digits
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle OTP Verify (Step 2: Authenticate via Supabase Auth)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpCode = otp.join('').trim();
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    const phoneCheck = validateAndNormalizeInternationalPhone(phone, countryCode);
    const phone_e164 = phoneCheck.phone_e164;

    setIsSubmitting(true);

    try {
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase.js');
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase connection is not configured.');
        setIsSubmitting(false);
        return;
      }

      // Verify OTP natively through Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.verifyOtp({
        phone: phone_e164,
        token: otpCode,
        type: 'sms'
      });

      if (authErr || !authData?.session) {
        console.warn('Supabase verifyOtp error:', authErr?.message);
        try {
          const { logAnalyticsEvent } = await import('../utils/analytics.js');
          await logAnalyticsEvent('LOGIN_FAILED', { metadata: { phone: phone_e164, reason: authErr?.message || 'Invalid OTP' } });
        } catch (e) {}
        
        setError(authErr?.message || 'Invalid or expired OTP code. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Log canonical login success event
      try {
        const { logAnalyticsEvent } = await import('../utils/analytics.js');
        await logAnalyticsEvent('LOGIN_SUCCESS', { userId: authData.session.user.id, metadata: { auth_method: 'phone_otp', phone: phone_e164 }, deduplicate: true });
      } catch (e) {}

      setIsSubmitting(false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('OTP verification exception:', err);
      setError(err.message || 'Authentication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setOtpTimer(60);
    setCanResendOtp(false);
    setError('');

    const phoneCheck = validateAndNormalizeInternationalPhone(phone, countryCode);
    if (phoneCheck.isValid) {
      try {
        const { logAnalyticsEvent } = await import('../utils/analytics.js');
        await logAnalyticsEvent('OTP_REQUESTED', { metadata: { auth_method: 'phone_otp', resend: true, phone: phoneCheck.phone_e164 } });
      } catch (e) {}

      try {
        const { supabase, isSupabaseConfigured } = await import('../lib/supabase.js');
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.signInWithOtp({
            phone: phoneCheck.phone_e164
          });
        }
      } catch (e) {
        console.warn('Resend OTP warning:', e);
      }
    }

    setSuccessMessage(`A new 6-digit OTP code has been sent to ${phoneCheck.phone_e164 || phone}.`);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-purple-50/70 via-slate-50/30 to-white py-12 md:py-16 pb-28 md:pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-purple-100 shadow-2xl overflow-hidden">
        
        {/* Left Side: Visual Brand Feature Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-block group bg-white px-3.5 py-2 rounded-2xl border border-purple-100 shadow-md transition-transform hover:scale-105">
              <img 
                src="/logo.png" 
                alt="Health Express - Everything Health Fast Tracked" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <div className="space-y-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-700/80 border border-purple-500/40 text-[11px] font-bold uppercase tracking-wider text-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                Personal Health Manager
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                One place to manage healthcare for your whole family.
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                Access diagnostic lab reports, coordinate home nursing care, and connect directly with personal care managers.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 pt-8 border-t border-purple-700/60">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Fast Mobile OTP Access</h4>
                <p className="text-[11px] text-purple-200">Instant passwordless verification with your mobile number</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Family Profiles</h4>
                <p className="text-[11px] text-purple-200">Coordinate care for parents, spouse, and children</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">100% Confidential & Secure</h4>
                <p className="text-[11px] text-purple-200">Your health data stays private and encrypted</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-purple-300/80 pt-6">
            Starting with Bengaluru launch. Need instant help?{' '}
            <button 
              onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)} 
              className="text-white underline font-semibold hover:text-purple-200 cursor-pointer"
            >
              WhatsApp Support
            </button>
          </div>
        </div>

        {/* Right Side: Dedicated Mobile OTP Auth Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 text-left">
          
          {/* Dynamic Welcome Reward Banner */}
          {walletSettings?.signup_reward_enabled !== false && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3.5 rounded-2xl text-slate-950 font-black text-xs flex items-center justify-between shadow-xs border border-amber-400 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-slate-950 shrink-0" />
                <span>Get {walletSettings?.signup_reward_coins || 1000} Health Coins when you join Health Express!</span>
              </div>
              <span className="bg-slate-950 text-amber-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0">
                Instant
              </span>
            </div>
          )}

          {/* Single Unified Login Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-lg font-extrabold pb-1 text-purple-800 border-b-2 border-purple-700">
              Login
            </h1>

            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Mobile OTP Login
            </span>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && !error && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dedicated Mobile OTP Authentication Flow */}
          <div>
            {!otpStep ? (
              /* Step 1: Mobile Number Input Form */
              <form onSubmit={handlePhoneSubmit} className="space-y-4">

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Mobile Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[95px] sm:w-[115px] shrink-0 px-2 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white cursor-pointer"
                    >
                      {POPULAR_COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1 min-w-0">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={countryCode === '+91' ? 'Enter 10-digit mobile' : 'Enter mobile number'}
                        className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-phone"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-purple-700 focus:ring-purple-600 cursor-pointer"
                  />
                  <label htmlFor="terms-phone" className="text-[11px] text-slate-500 leading-tight">
                    I agree to the Health Express{' '}
                    <Link to="/legal/terms" className="text-purple-700 underline font-semibold">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="/legal/privacy" className="text-purple-700 underline font-semibold">Privacy Policy</Link>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </span>
                  ) : (
                    <>
                      <span>Get OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter 6-Digit OTP Code */
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setSuccessMessage('');
                    }}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Change Mobile Number ({countryCode} {phone})</span>
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">Enter Verification Code</h3>
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit OTP code sent to <strong className="text-slate-800">{countryCode} {phone}</strong>
                  </p>
                </div>

                {/* 6 OTP Digit Boxes */}
                <div className="flex items-center justify-center gap-2.5 py-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 sm:w-12 h-14 text-center text-xl font-extrabold text-slate-900 bg-purple-50/60 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-700 focus:bg-white shadow-xs"
                    />
                  ))}
                </div>

                {/* Resend Timer (60s) */}
                <div className="text-center text-xs text-slate-500">
                  {!canResendOtp ? (
                    <span>Resend OTP code in <strong className="text-purple-700 font-bold">{otpTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Mobile OTP Access Note */}
          <div className="text-center pt-2 text-xs text-slate-500">
            <span>Instant, passwordless mobile access for all Health Express members.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
