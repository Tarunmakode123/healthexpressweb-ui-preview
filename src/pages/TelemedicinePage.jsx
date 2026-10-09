import React, { useState } from 'react';
import { Stethoscope, Video, MessageSquare, Clock, ShieldCheck, Sparkles, Send, CheckCircle2, ArrowRight, AlertCircle, Phone, MapPin, Award, Star } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';

export default function TelemedicinePage() {
  const [formData, setFormData] = useState({ name: '', phone: '', specialty: 'General Physician', details: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Hello Health Express, I would like to inquire about Telemedicine / Doctor Consultation. Name: ${formData.name} (${formData.phone}). Specialty: ${formData.specialty}. Notes: ${formData.details}`;
    openWhatsApp(msg);
    setSubmitted(true);
  };

  const doctors = [
    { name: "Dr. Ananya Sharma", designation: "Senior General Physician", degree: "MBBS, MD - General Medicine", image: "/images/services/drprofile.png" },
    { name: "Dr. Priya Deshmukh", designation: "Consultant Gynecologist", degree: "MBBS, MS - Gynaecology", image: "/images/services/drprofile.png" },
    { name: "Dr. Neha Verma", designation: "Pediatrician & Child Care", degree: "MBBS, MD - Pediatrics", image: "/images/services/drprofile.png" },
    { name: "Dr. Pooja Iyer", designation: "Chief Dermatologist", degree: "MBBS, MD - Dermatology", image: "/images/services/drprofile.png" },
    { name: "Dr. Ritu Saxena", designation: "Senior Cardiologist", degree: "MBBS, DM - Cardiology", image: "/images/services/drprofile.png" },
    { name: "Dr. Sneha Pillai", designation: "Clinical Endocrinologist", degree: "MBBS, DNB - Endocrinology", image: "/images/services/drprofile.png" },
    { name: "Dr. Kavita Menon", designation: "Neurology Specialist", degree: "MBBS, DM - Neurology", image: "/images/services/drprofile.png" },
    { name: "Dr. Meenakshi Roy", designation: "Senior Ophthalmologist", degree: "MBBS, MS - Ophthalmology", image: "/images/services/drprofile.png" }
  ];

  return (
    <div className="py-10 md:py-16 bg-white min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider border border-purple-200">
            <Video className="w-3.5 h-3.5 text-purple-700" />
            <span>Digital Doctor Consultations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Telemedicine Care
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-600 max-w-2xl mx-auto">
            Connect with accredited specialists, get verified digital e-prescriptions, and coordinate home diagnostics across Bengaluru.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDE: Overview, Specialties & Direct Contact */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-purple-50/60 p-6 sm:p-8 rounded-3xl border border-purple-100 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Doctor Care Coordination</h3>
                  <p className="text-xs font-semibold text-purple-900">Instant Health Manager Assistance</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Need urgent medical guidance or doctor second opinion? Our Health Express patient care team coordinates directly with verified Bengaluru doctors for prescription reviews and care planning.
              </p>

              <div className="space-y-3 pt-1 border-t border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block">WhatsApp Care Desk</span>
                    <button
                      onClick={() => openWhatsApp('Hello Health Express, I need help with doctor consultation and prescription review.')}
                      className="text-xs font-black text-emerald-700 hover:text-emerald-900 underline inline-flex items-center gap-1"
                    >
                      Chat with Care Manager (+91 76765 58809) →
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block">Support Hours</span>
                    <span className="text-xs font-bold text-slate-800">Monday – Sunday (8:00 AM – 9:00 PM IST)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Specialties Covered */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Specialties Handled
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-slate-700">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>General Medicine</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Diabetology & Lipid</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Cardiology Second Opinion</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Dermatology & Skin</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: PROMINENT "COMING SOON" HERO CARD */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-850 to-indigo-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-purple-700/50 space-y-6">
              
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-950" />
                <span>Coming Soon</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Instant Video Consultations & Live Doctor Booking
                </h2>
                <p className="text-xs sm:text-sm font-medium text-purple-200 leading-relaxed">
                  Our direct 1-on-1 HD video consultation platform with top Bengaluru specialists, instant digital prescriptions, and automated follow-up scheduling is launching soon!
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-purple-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-100">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1-on-1 HD Video & Audio Consultations</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-100">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>NABL Lab Test Order Direct Integration</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-100">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Verified E-Prescriptions Saved to Health Vault</span>
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-3">
                <div className="text-xs font-black text-white flex items-center justify-between">
                  <span>Pre-Register for Telemedicine Access</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-700 text-purple-100 font-bold">Priority List</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-Digit Mobile Number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <span>Inquire / Get Notified on WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>

        {/* DOCTORS PROFILE SECTION */}
        <div className="pt-12 border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-purple-700" />
              <span>Expert Medical Team</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Meet Our Experienced Specialists
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Consult with top-rated medical professionals dedicated to providing compassionate and expert healthcare for you and your family.
            </p>
          </div>

          {/* Profiles Grid: 4 per row (Total 8 profiles across 2 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <div className="relative w-full h-56 bg-purple-50 overflow-hidden">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-purple-900 flex items-center gap-1 shadow-sm rounded-lg">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>4.9</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow text-left space-y-2">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                    {doc.designation}
                  </span>

                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {doc.name}
                  </h3>

                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{doc.degree}</span>
                  </p>

                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => openWhatsApp(`Hello Health Express, I would like to book a consultation with ${doc.name} (${doc.designation}).`)}
                      className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-xl"
                    >
                      <span>Book Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}