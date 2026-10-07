import React, { useState, useEffect } from 'react';
import { 
  X, Phone, CheckCircle2, ShieldCheck, 
  Sparkles, AlertCircle, RefreshCw, ChevronLeft, Gift, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { POPULAR_COUNTRY_CODES, validateAndNormalizeInternationalPhone } from '../../utils/phone';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Login to Continue",
  subtitle = "Please login to continue with your healthcare booking."
}) {
  const { isLoggedIn, user, session } = useAuth();
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

  // Automatically trigger onSuccess if session becomes active while modal is open
  useEffect(() => {
    if (isOpen && (session?.user || (isLoggedIn && user))) {
      onSuccess();
    }
  }, [isOpen, session, isLoggedIn, user]);

  // Reset modal internal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setOtpStep(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // OTP Timer countdown (60s)
  useEffect(() => {
    let timer;
    if (isOpen && otpStep && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [isOpen, otpStep, otpTimer]);

  if (!isOpen) return null;

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
      try {
        const { logAnalyticsEvent } = await import('../../utils/analytics.js');
        await logAnalyticsEvent('OTP_REQUESTED', { metadata: { auth_method: 'phone_otp', phone: phoneCheck.phone_e164 } });
      } catch (e) {}

      const { supabase, isSupabaseConfigured } = await import('../../lib/supabase.js');
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`modal-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`modal-otp-input-${index - 1}`);
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
      const { supabase, isSupabaseConfigured } = await import('../../lib/supabase.js');
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase connection is not configured.');
        setIsSubmitting(false);
        return;
      }

      const { data: authData, error: authErr } = await supabase.auth.verifyOtp({
        phone: phone_e164,
        token: otpCode,
        type: 'sms'
      });

      if (authErr || !authData?.session) {
        console.warn('Supabase verifyOtp error:', authErr?.message);
        try {
          const { logAnalyticsEvent } = await import('../../utils/analytics.js');
          await logAnalyticsEvent('LOGIN_FAILED', { metadata: { phone: phone_e164, reason: authErr?.message || 'Invalid OTP' } });
        } catch (e) {}
        
        setError(authErr?.message || 'Invalid or expired OTP code. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      try {
        const { logAnalyticsEvent } = await import('../../utils/analytics.js');
        await logAnalyticsEvent('LOGIN_SUCCESS', { userId: authData.session.user.id, metadata: { auth_method: 'phone_otp', phone: phone_e164 }, deduplicate: true });
      } catch (e) {}

      setIsSubmitting(false);
      onSuccess();
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
        const { supabase, isSupabaseConfigured } = await import('../../lib/supabase.js');
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
    <div className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={onClose}
        className="fixed inset-0"
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden z-10 text-left my-auto">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Health Express" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">{title}</h3>
              <p className="text-[11px] text-purple-200 font-medium">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Health Coins Reward Callout */}
          {walletSettings?.signup_reward_enabled !== false && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-950 font-bold text-xs flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Get {walletSettings?.signup_reward_coins || 1000} Health Coins upon joining!</span>
            </div>
          )}

          {/* Error & Success Messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && !error && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {!otpStep ? (
            /* Step 1: Phone Input */
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Mobile Phone Number *</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-[95px] shrink-0 px-2 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
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
                      className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="modal-terms-phone"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-purple-700 focus:ring-purple-600 cursor-pointer"
                />
                <label htmlFor="modal-terms-phone" className="text-[11px] text-slate-500 leading-tight">
                  I agree to Health Express Terms of Service and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all disabled:opacity-50 cursor-pointer"
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
            /* Step 2: 6-Digit OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
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
                  <span>Change Number ({countryCode} {phone})</span>
                </button>
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">Enter Verification Code</h4>
                <p className="text-xs text-slate-500">
                  Enter 6-digit OTP sent to <strong className="text-slate-800">{countryCode} {phone}</strong>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 py-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`modal-otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-9 sm:w-11 h-12 text-center text-lg font-extrabold text-slate-900 bg-purple-50/60 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-700 focus:bg-white shadow-xs"
                  />
                ))}
              </div>

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
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-700/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify & Continue to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span>Instant, passwordless mobile access for Health Express members</span>
          </div>

        </div>

      </div>
    </div>
  );
}
