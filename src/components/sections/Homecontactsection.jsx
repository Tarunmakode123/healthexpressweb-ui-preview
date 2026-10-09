import React, { useState } from 'react';
import { MessageSquare, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';

export default function Homecontactsection() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: 'Diagnostics', message: '' });

  const openWhatsApp = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "919876543210"; 
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Hello Health Express, my name is ${formData.name} (Email: ${formData.email || 'N/A'}, Phone: ${formData.phone}). Requirement: ${formData.service}. Details: ${formData.message}`;
    openWhatsApp(msg);
  };

  return (
    <div className="py-6 md:py-10 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden" id="contact-section">
      
      <style>{`
        /* Strongly Highlighted Sharp Edge Contact Boxes */
        .contact-card-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(97, 44, 156, 0.06) 100%);
          border: 1.5px solid rgba(97, 44, 156, 0.28);
          border-left: 5px solid #612c9c;
          border-top: 3px solid rgba(97, 44, 156, 0.4);
          box-shadow: 0 10px 30px -4px rgba(97, 44, 156, 0.18);
          transition: all 0.35s ease;
        }
        .contact-card-box:hover {
          box-shadow: 0 16px 38px -4px rgba(97, 44, 156, 0.3);
          border-color: rgba(97, 44, 156, 0.6);
        }
      `}</style>

      {/* Decorative background glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Contact Details (Left Side) */}
          <div className="lg:col-span-5 bg-white p-7 sm:p-8 contact-card-box relative overflow-hidden text-left flex flex-col justify-between">
            <div 
              className="absolute top-0 right-0 w-32 h-32 rounded-none opacity-10 pointer-events-none"
              style={{ backgroundColor: '#612c9c' }}
            />

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-800 bg-purple-50 px-2.5 py-1 rounded-none border border-purple-100 inline-block">
                  Get In Touch
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Direct Patient Support</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Our dedicated health coordination desk in Bangalore is available 24/7 to assist you with quick sample pickups, lab tests, and expert consultations.
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3.5 p-3.5 rounded-none bg-slate-50/80 border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="w-10 h-10 rounded-none bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">Instant WhatsApp Booking</div>
                    <div className="text-[11px] text-slate-600 font-medium">Direct chat with our care managers</div>
                    <button 
                      onClick={() => openWhatsApp("Hello Health Express, I would like to inquire about your healthcare services.")}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chat on WhatsApp</span> →
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-none bg-slate-50/80 border border-slate-100">
                  <div 
                    className="w-10 h-10 rounded-none text-white flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: '#612c9c' }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">Email Assistance</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">support@healthexpress.in</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-none bg-slate-50/80 border border-slate-100">
                  <div 
                    className="w-10 h-10 rounded-none text-white flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: '#612c9c' }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">Bangalore Operations Hub</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">Serving all major localities across the city</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Secure & HIPAA-Compliant Patient Records</span>
            </div>
          </div>

          {/* Message Form (Right Side) */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-8 contact-card-box text-left flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Send Us a Message</h3>
              <p className="text-xs text-slate-500 font-medium">Fill out your details below and our health advisor will connect with you instantly.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3.5 my-auto py-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-none border border-slate-200 text-xs focus:outline-none focus:border-[#612c9c] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 rounded-none border border-slate-200 text-xs focus:outline-none focus:border-[#612c9c] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter 10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-none border border-slate-200 text-xs focus:outline-none focus:border-[#612c9c] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Required</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-none border border-slate-200 text-xs focus:outline-none focus:border-[#612c9c] bg-white font-medium"
                >
                  <option value="Diagnostics">Diagnostics & Blood Lab Tests</option>
                  <option value="Home Care">Home Healthcare & Nursing</option>
                  <option value="Imaging">Radiology Imaging (MRI, CT, X-Ray)</option>
                  <option value="Surgery">Surgical Care Procedures</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message / Medical Requirement</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe what tests or care you need..."
                  className="w-full px-3.5 py-2.5 rounded-none border border-slate-200 text-xs focus:outline-none focus:border-[#612c9c] font-medium resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-none text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95 cursor-pointer mt-1"
                style={{ backgroundColor: '#612c9c' }}
              >
                <Send className="w-4 h-4" />
                <span>Submit & Continue to WhatsApp</span>
              </button>
            </form>

            <div className="text-[11px] text-slate-400 font-medium text-center pt-2">
              By submitting, you agree to our terms of service & data privacy policy.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}