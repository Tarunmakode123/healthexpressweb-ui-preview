import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MessageSquare, FileText, CheckCircle2, ShieldCheck, Upload, 
  AlertCircle, ArrowRight, Loader2, Copy, Check, FileCheck, RefreshCw, User, Phone, MapPin, Mail, Trash2, Plus
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { validatePrescriptionFile, submitGuestPrescription } from '../../services/prescriptionService';
import { validateAndNormalizeInternationalPhone, POPULAR_COUNTRY_CODES } from '../../utils/phone';

export default function PrescriptionModal({ isOpen, onClose }) {
  // Screen Mode: 1 = Single-Screen Form (Upload + Details), 2 = Confirmation
  const [step, setStep] = useState(1);

  // Files State (Multi-file support)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Patient Form State
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Form Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Success Result
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset modal state on close
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedFiles([]);
      setFullName('');
      setPhone('');
      setCity('Bengaluru');
      setEmail('');
      setNotes('');
      setErrorMessage('');
      setPhoneError('');
      setIsSubmitting(false);
      setSubmissionResult(null);
    }, 300);
  };

  if (!isOpen) return null;

  // File Selector & Multi-file Add Handler
  const handleFilesAdd = (newFiles) => {
    setErrorMessage('');
    if (!newFiles || newFiles.length === 0) return;

    const validFiles = [];
    for (const file of newFiles) {
      const validation = validatePrescriptionFile(file);
      if (!validation.isValid) {
        setErrorMessage(`${file.name}: ${validation.error}`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles(prev => {
      const existingSignatures = new Set(prev.map(f => `${f.name}_${f.size}`));
      const uniqueNew = validFiles.filter(f => !existingSignatures.has(`${f.name}_${f.size}`));
      return [...prev, ...uniqueNew];
    });
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdd(Array.from(e.dataTransfer.files));
    }
  };

  // Real-time Phone Formatting
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (val.trim()) {
      const check = validateAndNormalizeInternationalPhone(val, countryCode);
      if (!check.isValid && val.replace(/\D/g, '').length >= 10) {
        setPhoneError(check.error);
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  // Final Form Submission
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedFiles.length === 0) {
      setErrorMessage('Please upload or drag at least one prescription file.');
      return;
    }

    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage('Please enter patient full name (at least 2 characters).');
      return;
    }

    const phoneCheck = validateAndNormalizeInternationalPhone(phone, countryCode);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error);
      setErrorMessage(phoneCheck.error);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitGuestPrescription({
        files: selectedFiles,
        file: selectedFiles[0],
        fullName,
        phone,
        countryCode,
        city,
        email,
        notes
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to submit prescription. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSubmissionResult(result);
      setStep(2); // Show confirmation
    } catch (err) {
      console.error('Modal Submit Error:', err);
      setErrorMessage('We couldn\'t submit your prescription right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Redirect Action
  const handleContinueWhatsApp = () => {
    if (!submissionResult) return;
    const enquiryCode = submissionResult.enquiry_code;
    const message = `Hello Health Express!\n\nI uploaded my prescription through the website.\n\nEnquiry ID: ${enquiryCode}\nName: ${submissionResult.patient_name}\n\nPlease review and assist me with the next steps.`;
    openWhatsApp(message);
  };

  // Copy Enquiry Code Helper
  const handleCopyCode = () => {
    if (!submissionResult?.enquiry_code) return;
    navigator.clipboard.writeText(submissionResult.enquiry_code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 p-5 sm:p-7 max-h-[92vh] overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors touch-target"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md">
              {step === 2 ? <FileCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {step === 1 ? 'Upload Prescription' : 'Prescription Received'}
              </h3>
              <p className="text-xs text-purple-700 font-semibold">
                {step === 1 ? 'Fast, Private & Secure Health Express Booking' : 'Registered in System of Record'}
              </p>
            </div>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* =========================================
              SINGLE-SCREEN FORM: UPLOAD + DETAILS
             ========================================= */}
          {step === 1 && (
            <form onSubmit={handleSubmitPrescription} className="space-y-5">
              
              {/* SECTION 1: FILE UPLOAD ZONE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    1. Upload Prescription / Recommendation <span className="text-rose-500">*</span>
                  </label>
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-xs text-purple-700 font-bold hover:text-purple-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More</span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => e.target.files && handleFilesAdd(Array.from(e.target.files))}
                  className="hidden"
                />

                {selectedFiles.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div 
                        key={`${file.name}_${idx}`} 
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200/80"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-slate-900 truncate max-w-[220px] sm:max-w-[280px]">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {formatFileSize(file.size)} • {file.name.split('.').pop()?.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragOver 
                        ? 'border-purple-600 bg-purple-50/80 scale-[0.99]' 
                        : 'border-purple-200 hover:border-purple-400 bg-purple-50/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-purple-900">Click to select prescription file</span>
                        <span className="text-xs text-slate-500"> or drag & drop</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Supported: PDF, JPG, PNG, WEBP, DOC, DOCX (Max 10 MB per file)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: PATIENT DETAILS */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  2. Patient Contact Details
                </label>

                {/* Full Name & Phone Number Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Patient's full name"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value);
                          if (phone) {
                            const check = validateAndNormalizeInternationalPhone(phone, e.target.value);
                            setPhoneError(check.isValid ? '' : check.error);
                          }
                        }}
                        className="px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-900 bg-purple-50/80 focus:ring-2 focus:ring-purple-600 outline-none shrink-0 cursor-pointer"
                      >
                        {POPULAR_COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="Mobile number"
                          className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none ${
                            phoneError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          }`}
                        />
                      </div>
                    </div>
                    {phoneError && <p className="text-[10px] text-rose-600 mt-0.5">{phoneError}</p>}
                  </div>
                </div>

                {/* City & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / Locality
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru, Koramangala"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Health Note / Special Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specific test requirements or nursing instructions"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || selectedFiles.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-700/20 transition-all touch-target"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Prescription...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Prescription ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =========================================
              SUCCESS CONFIRMATION SCREEN
             ========================================= */}
          {step === 2 && submissionResult && (
            <div className="space-y-5 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-50 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">Prescription Received!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your prescription has been received. Our Health Manager will review it and contact you shortly.
                </p>
              </div>

              {/* Enquiry ID Box */}
              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 max-w-xs mx-auto space-y-1.5 shadow-xs">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                  ENQUIRY ID
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-black text-purple-950 font-mono tracking-wide">
                    {submissionResult.enquiry_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                    title="Copy Enquiry ID"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleContinueWhatsApp}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all touch-target"
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>Continue on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedFiles([]);
                    setErrorMessage('');
                  }}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold hover:underline block mx-auto"
                >
                  Submit Another Prescription
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-4">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Private & Secure • No Account Required</span>
        </div>
      </div>
    </div>
  );
}

