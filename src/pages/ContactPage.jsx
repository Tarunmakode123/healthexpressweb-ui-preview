import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, MapPin, CheckCircle, Send } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', service: 'Diagnostics', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open WhatsApp with prefilled message containing input details
    const msg = `Hello Health Express, my name is ${formData.name} (${formData.phone}). Requirement: ${formData.service}. Details: ${formData.message}`;
    openWhatsApp(msg);
    setSubmitted(true);
  };

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
            Contact & Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            We're here to help you.
          </h1>
          <p className="text-base text-slate-600">
            Have a question, prescription, or medical requirement? Reach Health Express staff directly via WhatsApp or message form.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6 bg-purple-50/50 p-8 rounded-3xl border border-purple-100">
            <h3 className="text-2xl font-bold text-slate-900">Direct Contact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our patient coordination team is available Monday through Sunday to assist with sample collection, test options, and consultations.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">WhatsApp Support</div>
                  <div className="text-xs text-slate-600 mt-0.5">Instant prescription & booking assistance</div>
                  <button 
                    onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-1 inline-block"
                  >
                    Chat on WhatsApp →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Email Inquiry</div>
                  <div className="text-xs text-slate-600 mt-0.5">support@healthexpress.in</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Coverage Cities</div>
                  <div className="text-xs text-slate-600 mt-0.5">Bangalore, Hyderabad, Mumbai, Delhi NCR, Pune</div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter 10-digit phone number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Required</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 bg-white"
                >
                  <option value="Diagnostics">Diagnostics & Blood Tests</option>
                  <option value="Imaging">Imaging (MRI, CT, X-Ray)</option>
                  <option value="Home Care">Home Healthcare & Nursing</option>
                  <option value="Preventive">Preventive Health Checkup</option>
                  <option value="Genomics">Genetic Testing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message / Medical Requirement</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe what you need or mention your tests..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Continue to WhatsApp</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
