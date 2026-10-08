import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, Sparkles, Users, ArrowRight, CheckCircle2, MessageSquare, 
  Upload, Activity, Zap, Compass, Award, ShieldCheck, Clock, Layers, Mail,
  Calendar, MapPin, HeartPulse
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
        <section 
          className="py-10 md:py-16 bg-white relative bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{ backgroundImage: "url('/images/services/aboutbanner.png')" }}
        >
          {/* Balanced dark overlay so banner remains visible yet balanced */}
          <div className="absolute inset-0 bg-black/25"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex justify-center">
            
            {/* Centered Box with highly transparent blurry whiteness so the banner shows through */}
            <div className="bg-white/40 backdrop-blur-md p-6 sm:p-10 w-full shadow-xl shadow-black/15 rounded-none border border-white/30 flex flex-col items-center text-center space-y-4">
              
              <div className="w-full flex justify-center">
                <DiscountHeroBanner />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 border border-purple-200/60 text-xs font-extrabold text-slate-800 shadow-2xs backdrop-blur-sm">
                <Heart className="w-3.5 h-3.5 text-purple-600 fill-purple-600/20" />
                <span className="text-purple-900 uppercase tracking-wider text-[10px] font-extrabold">OUR MISSION & STORY</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-bold">Healthcare Made Personal</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight max-w-2xl">
                Healthcare is personal.<br />
                <span className="text-purple-700">So are we.</span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-800 leading-relaxed font-semibold max-w-xl">
                Behind every diagnostic test, prescription, or home nursing visit is a person — and a family that cares deeply about them. We are building a simpler way to manage healthcare with total peace of mind.
              </p>

            </div>

          </div>
        </section>

        {/* Founder's Editorial Spotlight Card */}
        <div className="max-w-8xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-purple-100 shadow-2xl shadow-purple-950/15 relative overflow-hidden group transition-all duration-700 hover:shadow-3xl hover:border-purple-200 animate-fade-in">
          
          {/* Decorative background blur glow with subtle pulse animation */}
          <div className="absolute -right-20 -top-20 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Founder Photo - Enlarged for better visual impact */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-700">
                <img
                  src="/founder_neha.jpg"
                  alt="Neha Bhansali, Founder of Health Express"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-purple-950/30 to-transparent"></div>
                
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                  <span className="px-3 py-1 rounded-full bg-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    FOUNDER & CEO
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">Neha Bhansali</div>
                  <div className="text-xs text-purple-200 font-medium">Health Express Leadership</div>
                  <a 
                    href="mailto:neha@healthexpress.care" 
                    className="inline-flex items-center gap-1.5 text-xs text-purple-200 hover:text-white transition-colors pt-1 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-300" />
                    <span>neha@healthexpress.care</span>
                  </a>
                </div>
              </div>

              {/* Floating Badge with smooth bounce animation */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-purple-100 items-center gap-2.5 animate-bounce">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 leading-tight">Patient First</div>
                  <div className="text-[9px] text-purple-700 font-bold uppercase tracking-wider leading-tight">Care Guarantee</div>
                </div>
              </div>
            </div>

            {/* Founder Statement Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black uppercase tracking-widest text-purple-700 animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>FOUNDER'S NOTE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                “Getting the right healthcare for your family should feel simple, transparent, and respectful.”
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                <p className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/80 transition-all duration-300 hover:bg-purple-50 hover:shadow-sm">
                  "I started Health Express because I saw firsthand how overwhelming healthcare logistics can be. Managing blood tests for aging parents, waiting in diagnostic centers, and tracking paper reports shouldn’t take away from family time."
                </p>
                <p className="px-1">
                  "We built Health Express to combine high-precision clinical logistics — certified home sample collection, barcoded cold-chain transport, and NABL partner labs — with a human care coordination manager who is always one WhatsApp message away."
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-purple-100">
                <div>
                  <p className="font-black text-slate-900 text-sm">
                    — Neha Bhansali
                  </p>
                  <p className="text-xs font-bold text-purple-700">Founder & CEO, Health Express</p>
                </div>

                {/* Action Buttons with active scale animation */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onOpenUploadModal}
                    className="px-4.5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Upload Prescription
                  </button>

                  <button
                    onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                    className="px-4.5 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 font-extrabold text-xs flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    <span>Chat with Manager</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Interactive Experience Simulator: Side-by-Side Comparison */}
        <div className="max-w-8xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-purple-700" />
              <span>EXPERIENCE THE DIFFERENCE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why We Redefined Healthcare Delivery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
              Compare the friction of traditional healthcare navigation against the connected Health Express experience.
            </p>
          </div>

          {/* Side-by-Side Modern Grid Presentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Traditional Fragmented Card */}
            <div className="bg-slate-50/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wide">
                  ❌ Traditional Fragmented Healthcare
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  The Old Way: High Stress & Endless Coordination
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-2xs">
                  <div className="text-xs font-extrabold text-slate-900">1. Crowded Waiting Rooms</div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Traveling in traffic, early fasting queues, and manual paperwork registration.</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-2xs">
                  <div className="text-xs font-extrabold text-slate-900">2. Fragmented Records</div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Scattered PDF files on WhatsApp, lost paper receipts, and duplicate blood tests.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-2xs">
                  <div className="text-xs font-extrabold text-slate-900">3. Uncertain Follow-Ups</div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Chasing diagnostic labs for report delays without a dedicated point of contact.</p>
                </div>
              </div>
            </div>

            {/* Health Express Connected Care Card */}
            <div className="bg-gradient-to-br from-purple-900 via-purple-850 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-700/50 flex flex-col justify-between space-y-6 relative overflow-hidden">
              {/* Background Glow Effect */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-wide shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-purple-950 fill-purple-950" />
                  <span>Health Express Connected Care</span>
                </span>
                <h3 className="text-base font-black text-white">
                  The Health Express Way: Total Peace of Mind
                </h3>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                  <div className="text-xs font-black text-amber-300">1. 30-Min Home Sample Pickup</div>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed">Certified phlebotomists arrive at your doorstep with temperature-controlled cold chain kits.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                  <div className="text-xs font-black text-amber-300">2. Auto-Synced Digital EHR</div>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed">All family medical records auto-saved in your secure account with post-report guidance.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                  <div className="text-xs font-black text-amber-300">3. 24/7 Care Manager Desk</div>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed">A dedicated healthcare coordinator handles your appointments, orders, and questions.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

       
        {/* Core Principles Bento Grid */}
        <div className="space-y-12 border-t border-purple-100/80 pt-16">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-black uppercase tracking-widest shadow-2xs">
              <span>✨ OUR CORE PHILOSOPHY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              What Matters Most to Us
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              We aren't just managing healthcare reports; we are building an unbreakable circle of trust and care for your family.
            </p>
          </div>

          {/* Modern Bento Grid & Explanatory Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT SIDE: 5 Bento Interactive Cards (lg:col-span-7) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: People First (Spotlight Large Card) */}
              <div className="sm:col-span-2 relative bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-8 rounded-3xl shadow-2xl overflow-hidden border border-purple-700/40 group transition-all duration-500 hover:shadow-purple-900/30">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                
                <div className="relative z-10 space-y-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-400 text-purple-950">Primary Focus</span>
                    <h4 className="text-2xl font-black tracking-tight text-white">People First</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-medium">
                    Every healthcare journey starts with a person, not a transaction. We prioritize deep empathy, emotional comfort, and crystal-clear guidance above everything else.
                  </p>
                </div>
              </div>

              {/* Card 2: Uncompromising Trust */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-100 shadow-lg shadow-purple-950/5 hover:shadow-xl hover:border-purple-300 transition-all duration-300 text-left flex flex-col justify-between space-y-5 group">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">Uncompromising Trust</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    100% NABL accredited labs, strict cold-chain sample logistics, and fully encrypted patient data.
                  </p>
                </div>
              </div>

              {/* Card 3: Zero Friction */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-100 shadow-lg shadow-purple-950/5 hover:shadow-xl hover:border-purple-300 transition-all duration-300 text-left flex flex-col justify-between space-y-5 group">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">Zero Friction</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Removing all complexity with 3-step prescription uploads, lightning-fast WhatsApp coordination, and zero waiting queues.
                  </p>
                </div>
              </div>

              {/* Card 4: Transparent Pricing */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-100 shadow-lg shadow-purple-950/5 hover:shadow-xl hover:border-purple-300 transition-all duration-300 text-left flex flex-col justify-between space-y-5 group">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300">
                  <span className="font-black text-lg">₹</span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">Transparent Pricing</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Zero hidden costs or surprise fees. Honest, upfront pricing with free doorstep sample pickups.
                  </p>
                </div>
              </div>

              {/* Card 5: Family Care */}
              <div className="bg-purple-50/70 backdrop-blur-xl p-6 rounded-3xl border border-purple-200/80 shadow-lg shadow-purple-950/5 hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between space-y-5 group">
                <div className="w-11 h-11 rounded-2xl bg-purple-200 text-purple-900 flex items-center justify-center group-hover:bg-purple-900 group-hover:text-white transition-all duration-300">
                  <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600/30" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-900">Unified Family Care</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Managing health reports and appointments for parents, children, and spouses in one single account.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: High-Converting Explanatory Column (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-white to-purple-50/40 p-8 sm:p-10 rounded-3xl border-2 border-purple-100 shadow-xl shadow-purple-950/10 flex flex-col justify-between space-y-8 text-left sticky top-8">
              
              <div className="space-y-4">
                <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-widest shadow-2xs">
                  THE HEALTH EXPRESS STANDARD
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                  Why These Principles Transform Your Experience
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Traditional healthcare feels cold, repetitive, and stressful. We engineered Health Express to completely remove friction, replacing uncertainty with dedicated human support and clinical excellence.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-purple-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-0.5">✓</div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Verified NABL Accuracy</div>
                    <p className="text-[11px] text-slate-600 font-medium">Reports verified by top specialists and delivered straight to your phone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-0.5">✓</div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Dedicated Care Managers</div>
                    <p className="text-[11px] text-slate-600 font-medium">Real human assistance available instantly via WhatsApp whenever you need guidance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-0.5">✓</div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Zero Travel & Waiting</div>
                    <p className="text-[11px] text-slate-600 font-medium">Certified phlebotomists arrive at your doorstep with cold-chain security.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                  className="w-full py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-700/25 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Connect with Health Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>





{/* Health Camps & Community Outreach Section (Newly Added) */}
        <section className="py-8 bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* SIDE 1: Content & Description (lg:col-span-6) */}
            <div className="lg:col-span-6 space-y-4 text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-black uppercase tracking-wider shadow-2xs">
                <HeartPulse className="w-3.5 h-3.5 text-purple-700" />
                <span>Community Outreach & Camps</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Bringing Preventive Healthcare Directly to Communities
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Health Express actively organizes corporate wellness checkups, residential society health camps, and senior citizen screening drives across Bengaluru. We believe proactive health camps save lives by detecting risks early.
              </p>

              {/* Key Camp Highlights */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800 bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
                  <div className="w-6 h-6 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span>Free Blood Sugar, BP & Basic Health Screening</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-800 bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
                  <div className="w-6 h-6 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>Expert Doctor Consultations at Societies & Offices</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-800 bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
                  <div className="w-6 h-6 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>On-site Sample Collection with Instant Digital Reports</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => openWhatsApp("Hello Health Express, I would like to organize or inquire about booking a health camp for my society/corporate office.")}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-700/25 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <span>Organize a Health Camp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* SIDE 2: 3 Images in Different Sizes (Bento Grid - Enlarged Heights) (lg:col-span-6) */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 items-center">
              
              {/* Image 1 (Tall Image - Increased Height) */}
              <div className="row-span-2 relative h-80 sm:h-[420px] rounded-3xl overflow-hidden shadow-xl border-4 border-white group">
                <img 
                  src="/images/services/campimge.png" 
                  alt="Health Camp Activity 1" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-purple-950 text-[10px] font-black uppercase shadow-sm">
                  Society Camp
                </span>
              </div>

              {/* Image 2 (Square Top Image - Increased Height) */}
              <div className="relative h-36 sm:h-50 rounded-3xl overflow-hidden shadow-xl border-4 border-white group">
                <img 
                  src="/images/services/campimge.png" 
                  alt="Health Camp Activity 2" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-purple-950 text-[9px] font-black uppercase shadow-sm">
                  Screening Drive
                </span>
              </div>

              {/* Image 3 (Square Bottom Image - Increased Height) */}
              <div className="relative h-36 sm:h-50 rounded-3xl overflow-hidden shadow-xl border-4 border-white group">
                <img 
                  src="/images/services/campimge.png" 
                  alt="Health Camp Activity 3" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-purple-950 text-[9px] font-black uppercase shadow-sm">
                  Corporate Wellness
                </span>
              </div>

            </div>

          </div>
        </section>
        
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