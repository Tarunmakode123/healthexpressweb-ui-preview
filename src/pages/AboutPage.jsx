import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, Sparkles, Users, ArrowRight, CheckCircle2, MessageSquare, 
  Upload, Activity, Zap, Compass, Award, ShieldCheck, Clock, Layers, Mail
} from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';

import DiscountHeroBanner from '../components/common/DiscountHeroBanner';

export default function AboutPage({ onOpenUploadModal }) {
  const [activeTab, setActiveTab] = useState('health-express');
  const [activeMilestone, setActiveMilestone] = useState(1);

  const milestones = [
    {
      id: 0,
      year: '2025 • Genesis',
      title: 'The Soft Launch in Bengaluru',
      desc: 'Launched with a core mission: simplify diagnostic blood testing & home nursing through NABL-accredited labs and certified care managers.'
    },
    {
      id: 1,
      year: '2026 • Scale & Quality',
      title: 'Smart Cold Chain & 30-Min Logistics',
      desc: 'Expanded to 100+ partner labs, barcoded specimen tracking, and automated digital health record storage.'
    },
    {
      id: 2,
      year: 'Future • Vision',
      title: 'Unified Family Health Manager',
      desc: 'Building a single connected platform for multi-generational healthcare management across diagnostics, nursing, and specialty care.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden text-left">
      
      {/* Background ECG Heartbeat Accent */}
      <div className="absolute top-20 left-0 right-0 h-48 opacity-10 pointer-events-none -z-10 flex items-center justify-center">
        <svg viewBox="0 0 1200 120" className="w-full h-full text-purple-600 fill-none stroke-current stroke-[2] stroke-linecap-round">
          <path d="M0,60 L250,60 L280,30 L300,90 L320,10 L340,110 L360,60 L390,60 L420,60 L1200,60" className="animate-ecg" />
        </svg>
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <DiscountHeroBanner />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-slate-800 shadow-2xs backdrop-blur-md">
            <Heart className="w-4 h-4 text-purple-600 fill-purple-600/20" />
            <span className="text-purple-900 uppercase tracking-wider text-[11px] font-extrabold">OUR MISSION & STORY</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">Healthcare Made Personal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Healthcare is personal.<br />
            <span className="gradient-text-purple">So are we.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Behind every diagnostic test, prescription, or home nursing visit is a person — and a family that cares deeply about them. We are building a simpler way to manage healthcare with total peace of mind.
          </p>
        </div>

        {/* Founder's Editorial Spotlight Card */}
        <div className="max-w-5xl mx-auto glass-card rounded-3xl p-8 sm:p-12 border border-purple-200 shadow-2xl relative overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Founder Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-700">
                <img
                  src="/founder_neha.jpg"
                  alt="Neha Bhansali, Founder of Health Express"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-3 py-1 rounded-full bg-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    FOUNDER & CEO
                  </span>
                  <div className="text-lg font-black text-white mt-1">Neha Bhansali</div>
                  <div className="text-xs text-purple-200 font-medium">Health Express Leadership</div>
                  <a 
                    href="mailto:neha@healthexpress.care" 
                    className="inline-flex items-center gap-1.5 text-xs text-purple-200 hover:text-white transition-colors mt-1 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-300" />
                    <span>neha@healthexpress.care</span>
                  </a>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="hidden sm:flex absolute -top-4 -right-4 glass-card px-4 py-2 rounded-2xl shadow-lg border border-purple-200 items-center gap-2 animate-float">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900">Patient First</div>
                  <div className="text-[9px] text-purple-700 font-bold">Care Guarantee</div>
                </div>
              </div>
            </div>

            {/* Founder Statement Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="text-xs font-extrabold uppercase tracking-widest text-purple-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>FOUNDER'S NOTE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                “Getting the right healthcare for your family should feel simple, transparent, and respectful.”
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  "I started Health Express because I saw firsthand how overwhelming healthcare logistics can be. Managing blood tests for aging parents, waiting in diagnostic centers, and tracking paper reports shouldn’t take away from family time."
                </p>
                <p>
                  "We built Health Express to combine high-precision clinical logistics — certified home sample collection, barcoded cold-chain transport, and NABL partner labs — with a human care coordination manager who is always one WhatsApp message away."
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-purple-100/80">
                  <p className="font-extrabold text-purple-950">
                    — Neha Bhansali, Founder
                  </p>
                  <a 
                    href="mailto:neha@healthexpress.care" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-700" />
                    <span>neha@healthexpress.care</span>
                  </a>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenUploadModal}
                  className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all hover:scale-102"
                >
                  Upload Prescription
                </button>

                <button
                  onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 font-extrabold text-xs flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                  <span>Talk with Care Manager</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Experience Simulator: Before vs After */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold uppercase">
              <Compass className="w-3.5 h-3.5 text-purple-700" />
              <span>EXPERIENCE THE DIFFERENCE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Why We Redefined Healthcare Delivery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Compare the friction of traditional healthcare navigation against the connected Health Express experience.
            </p>
          </div>

          {/* Interactive Switcher */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('traditional')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'traditional'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              ❌ Traditional Fragmented Healthcare
            </button>
            <button
              onClick={() => setActiveTab('health-express')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'health-express'
                  ? 'bg-purple-700 text-white shadow-md scale-105'
                  : 'bg-white hover:bg-purple-50 text-purple-900 border border-purple-200'
              }`}
            >
              ⚡ Health Express Connected Care
            </button>
          </div>

          {/* Tab Display Card */}
          <div className="glass-card p-8 rounded-3xl border border-purple-200 shadow-xl">
            {activeTab === 'traditional' ? (
              <div className="space-y-4 text-left animate-fadeIn">
                <div className="text-xs font-extrabold uppercase text-amber-700 tracking-wider flex items-center gap-2">
                  <span>The Old Way: High Stress & Endless Coordination</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 font-medium">
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                    <div className="font-extrabold text-slate-900">1. Crowded Waiting Rooms</div>
                    <p>Traveling in traffic, early fasting queues, and manual paperwork registration.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                    <div className="font-extrabold text-slate-900">2. Fragmented Records</div>
                    <p>Scattered PDF files on WhatsApp, lost paper receipts, and duplicate blood tests.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                    <div className="font-extrabold text-slate-900">3. Uncertain Follow-Ups</div>
                    <p>Chasing diagnostic labs for report delays without a dedicated point of contact.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left animate-fadeIn">
                <div className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>The Health Express Way: Total Peace of Mind</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 font-semibold">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <div className="font-extrabold text-purple-950">1. 30-Min Home Sample Pickup</div>
                    <p>Certified phlebotomists arrive at your doorstep with temperature-controlled cold chain kits.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <div className="font-extrabold text-purple-950">2. Auto-Synced Digital EHR</div>
                    <p>All family medical records auto-saved in your secure account with post-report guidance.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <div className="font-extrabold text-purple-950">3. 24/7 Care Manager Desk</div>
                    <p>A dedicated healthcare coordinator handles your appointments, orders, and questions.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Roadmap Stepper */}
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold uppercase">
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <span>OUR JOURNEY & VISION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Building the Future of Family Healthcare
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMilestone(m.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer text-left space-y-3 ${
                  activeMilestone === m.id
                    ? 'bg-purple-900 text-white border-purple-800 shadow-xl scale-102'
                    : 'bg-white hover:bg-purple-50 text-slate-900 border-purple-100 shadow-xs'
                }`}
              >
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                  activeMilestone === m.id ? 'bg-emerald-400 text-slate-950' : 'bg-purple-100 text-purple-800'
                }`}>
                  {m.year}
                </span>

                <h3 className={`text-base font-extrabold ${activeMilestone === m.id ? 'text-white' : 'text-slate-900'}`}>
                  {m.title}
                </h3>

                <p className={`text-xs leading-relaxed ${activeMilestone === m.id ? 'text-purple-200' : 'text-slate-600'}`}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Principles Bento Grid */}
        <div className="space-y-6 border-t border-purple-100 pt-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-700">
              WHAT MATTERS TO US
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Our Guiding Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bento-card p-6 rounded-3xl space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">People First</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every healthcare journey starts with a person, not a transaction. We prioritize empathy and clarity.
              </p>
            </div>

            <div className="bento-card p-6 rounded-3xl space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">Uncompromising Trust</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                100% NABL accredited labs, cold-chain monitoring, and encrypted patient health records.
              </p>
            </div>

            <div className="bento-card p-6 rounded-3xl space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">Zero Friction</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Removing complexity with 3-step prescription uploads, fast WhatsApp coordination, and zero waiting time.
              </p>
            </div>

            <div className="bento-card p-6 rounded-3xl space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">Family Care</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Managing care for parents, children, and spouses in one unified account experience.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Callout Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500 text-slate-950">
              Experience Modern Healthcare
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to simplify your family's healthcare?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Upload your prescription file or chat directly with our care coordinators to schedule home sample collection in Bengaluru.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>Upload Prescription Now</span>
            </button>

            <button
              onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
