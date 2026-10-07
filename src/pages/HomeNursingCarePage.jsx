import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, ShieldCheck, Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp, 
  MessageSquare, Stethoscope, Baby, Users, Home, Activity, Sparkles, 
  ArrowRight, ChevronLeft, ChevronRight, HelpCircle, UserCheck, ShieldAlert,
  Droplet, Syringe, Pill, TestTube
} from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';

// 10 On-Demand Home Health Care Needs for Carousel 1
const ON_DEMAND_SERVICES = [
  { id: 'injection', title: 'Injection Administration', desc: 'Single dose IM/IV/SC injections administered by trained staff.', icon: Syringe },
  { id: 'iv-drip', title: 'IV Drip / Infusion', desc: 'Saline, IV fluids, and prescribed intravenous infusion administration.', icon: Activity },
  { id: 'dressing', title: 'Dressing Change', desc: 'Sterile surgical wound care, bed leg ulcers, and burn dressing changes.', icon: ShieldCheck },
  { id: 'catheter', title: 'Catheter-Related Care', desc: 'Foley catheter insertion, flushing, bag change, and hygiene care.', icon: Stethoscope },
  { id: 'nebulization', title: 'Nebulization', desc: 'Inhalation therapy and respiratory nebulizer administration at home.', icon: Activity },
  { id: 'vitals', title: 'Vital Checks', desc: 'Comprehensive monitoring of Pulse, SpO2, Temperature, and Respiration.', icon: Heart },
  { id: 'blood-sugar', title: 'Blood Sugar Check', desc: 'Fasting and postprandial glucose level check with glucometer.', icon: Droplet },
  { id: 'bp-check', title: 'Blood Pressure Check', desc: 'Digital and manual BP monitoring with record keeping.', icon: Activity },
  { id: 'sample-col', title: 'Sample Collection', desc: 'Home blood, urine, and specimen collection for lab testing.', icon: TestTube },
  { id: 'medication', title: 'Medication Administration', desc: 'Oral, topical, and scheduled prescription drug administration.', icon: Pill }
];

// Running Carousel / Strip Items
const RUNNING_CARE_STRIP = [
  {
    id: 'dementia',
    title: 'Dementia Care',
    desc: 'Focused on safety, daily routines, companionship and family support.'
  },
  {
    id: 'companion',
    title: 'Companion Care',
    desc: 'Non-medical companionship and everyday assistance.'
  },
  {
    id: 'disability',
    title: 'Disability Care',
    desc: 'Personalized home support helping with daily activities, mobility and independent living.'
  },
  {
    id: 'livein',
    title: 'Live-In Care',
    desc: 'Extended support for individuals who need ongoing assistance and supervision at home.'
  }
];

// 4-step process
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Tell Us What You Need',
    desc: 'Share the patient or family member’s requirements, location, preferred duration and the type of support needed.'
  },
  {
    step: '02',
    title: 'We Coordinate Suitable Options',
    desc: 'Health Express helps identify suitable care options based on the information you provide.'
  },
  {
    step: '03',
    title: 'Discuss & Confirm',
    desc: 'Review the available option, scope of care, pricing, timing and other relevant details before proceeding.'
  },
  {
    step: '04',
    title: 'Care Begins',
    desc: 'Once the arrangement is confirmed, the selected caregiver or healthcare professional provides the agreed support.'
  }
];

// 10 Accordion FAQs
const FAQS = [
  {
    q: 'What is home nursing care?',
    a: 'Home nursing care involves skilled nursing or caregiving services provided in the comfort of your home, ranging from clinical procedures to daily patient assistance.'
  },
  {
    q: 'Can I arrange a home nurse in Bengaluru through Health Express?',
    a: 'Yes, Health Express helps coordinate home nursing and caregiving services across select areas in Bengaluru based on your specific requirements.'
  },
  {
    q: 'What is a Japa caregiver?',
    a: 'A Japa caregiver provides specialized postpartum support for new mothers and newborns, helping with newborn care, traditional mother recovery support, and daily infant assistance.'
  },
  {
    q: 'Can I request a Japa caregiver after delivery?',
    a: 'Yes, you can request a Japa caregiver for postpartum and newborn assistance after childbirth.'
  },
  {
    q: 'Can I arrange elderly care at home?',
    a: 'Yes, Health Express coordinates dedicated elderly care services including daily assistance, mobility support, companionship, and medication reminders.'
  },
  {
    q: 'What is respite care?',
    a: 'Respite care provides temporary relief for primary family caregivers, allowing them time to rest, attend to personal matters, or take a break while care continues seamlessly.'
  },
  {
    q: 'Who can use respite care?',
    a: 'Any family member or primary caregiver caring for an elderly relative, recovering patient, or individual needing long-term assistance can use respite care.'
  },
  {
    q: 'How long can respite care be arranged?',
    a: 'Respite care can be arranged for short-term needs ranging from a few hours or days to several weeks based on family requirements.'
  },
  {
    q: 'Can a family member request care for someone else?',
    a: 'Yes, family members frequently coordinate care on behalf of parents, spouses, or relatives.'
  },
  {
    q: 'How quickly can care start?',
    a: 'Once requirements, location, duration, and caregiver details are discussed and confirmed, care can typically be scheduled quickly.'
  }
];

export default function HomeNursingCarePage({ onOpenUploadModal }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    document.title = "Home Nursing & Care at Home in Bengaluru | Health Express";
    
    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Find and coordinate home nursing, elderly care, caregivers and Japa caregivers in Bengaluru. Tell Health Express what you need and we’ll help coordinate suitable care at home.";
  }, []);

  const handleWhatsAppAction = (customText) => {
    const text = customText || "Hi HealthExpress, I would like to request Home Nursing & Caregiving support in Bengaluru.";
    openWhatsApp(text);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans text-left">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white pt-10 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-700/80 border border-purple-500/50 text-purple-100 text-xs font-extrabold tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5 text-purple-200" />
              <span>Bengaluru Care Coordination</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Home Nursing & Care
            </h1>

            <p className="text-lg sm:text-xl font-bold text-purple-100 leading-snug">
              Professional care and caregiving support, where your family needs it.
            </p>

            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed font-normal max-w-2xl">
              Tell Health Express what kind of support you need, where you need it and for how long. We help coordinate suitable home nursing and caregiving options for your family — starting with select areas in Bengaluru.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => handleWhatsAppAction()}
                className="px-6 py-3.5 rounded-xl bg-white text-purple-900 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg hover:bg-purple-50 transition-all cursor-pointer touch-target active:scale-95"
              >
                <MessageSquare className="w-4.5 h-4.5 text-purple-700 fill-purple-700/20" />
                <span>Request Home Care</span>
              </button>

              <button
                onClick={onOpenUploadModal}
                className="px-6 py-3.5 rounded-xl bg-purple-700/70 hover:bg-purple-700 text-white font-extrabold text-sm border border-purple-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Upload Doctor Prescription</span>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Currently serving select areas in Bengaluru.</span>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SLIDING CAROUSEL DIRECTLY BELOW HERO */}
      <section className="bg-white py-10 border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                Small / On-Demand Home Health Needs
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                Need something done at home? Just ask.
              </h2>
            </div>

            {/* Scroll Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sliding Cards */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
          >
            {ON_DEMAND_SERVICES.map((item) => {
              const IconComp = item.icon || Activity;
              return (
                <div
                  key={item.id}
                  className="min-w-[240px] max-w-[260px] bg-slate-50 rounded-2xl p-4 border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleWhatsAppAction(`Hi HealthExpress, I need help with ${item.title} at home.`)}
                    className="w-full mt-4 py-2 px-3 rounded-xl bg-white hover:bg-purple-700 hover:text-white text-purple-900 border border-purple-200 font-extrabold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Request Visit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. INTRO / SEO BODY */}
      <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-3 py-1 rounded-full inline-block">
            Simpler Care Coordination
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Home Nursing Care, Without the Search
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs text-left">
            <p>
              Finding the right support for a loved one can be time-consuming — especially after a hospital stay, surgery, childbirth, illness or when an elderly family member needs help at home.
            </p>
            <p>
              Health Express helps make the process simpler. Tell us about your care requirement, location, preferred duration and the type of support you need. We help coordinate suitable nursing and caregiving options based on your requirements.
            </p>
            <p>
              From home nursing and elderly care to post-operative support, patient caregiving, respite care and postpartum assistance, Health Express gives your family one place to start.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CARE SERVICES */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Comprehensive Care Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Coordinated home health support tailored to your family's specific situation.
            </p>
          </div>

          {/* Category 1: Nursing & Clinical Support */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Nursing & Clinical Support
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Home Nursing Care</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Professional nursing support for medical needs, recovery, medication, catheter/wound care, and ongoing clinical monitoring at home.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Post-Hospital & Recovery Care</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Assistance with transition from hospital to home, managing treatment plans, vitals monitoring, and rehabilitation support.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Post-Operative Care at Home</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Specialized clinical care following surgical procedures to ensure wound healing, pain management, and complication prevention.
                </p>
              </div>
            </div>
          </div>

          {/* Category 2: Everyday & Family Care */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Everyday & Family Care
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Elderly Care</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Compassionate daily living assistance, mobility support, companionship, and medication reminders for senior family members.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Patient Caregivers</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Dedicated non-clinical attendant support helping patients with hygiene, feeding, mobility, and day-to-day comfort.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Respite Care - Care for Caregivers</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Temporary relief support for primary family caregivers to rest, recharge, or handle personal commitments.
                </p>
              </div>
            </div>
          </div>

          {/* Category 3: Mother & Baby Care */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Mother & Baby Care
              </h3>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50/50 rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-800 text-white flex items-center justify-center shrink-0">
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded">
                    Postpartum & Newborn Support
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Japa Caregivers for New Mothers & Newborns
                  </h4>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium max-w-3xl">
                Traditional postpartum care for new mothers and infants including newborn bathing, mother recovery support, infant care guidance, and daily newborn assistance.
              </p>

              <div className="bg-white p-4 rounded-2xl border border-purple-200/80 text-xs text-slate-600 font-semibold space-y-1">
                <span className="font-extrabold text-purple-900 uppercase text-[10px] tracking-wider block">
                  Important Care Distinction:
                </span>
                <p>
                  Japa caregiving is a dedicated practical support role focused on traditional postpartum care and daily newborn assistance. It is generally a support role and does not automatically substitute for licensed clinical nursing/medical care.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. RUNNING CAROUSEL / STRIP */}
      <section className="bg-purple-900 text-white py-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-800 text-purple-200 border border-purple-700">
            Specialized Care Programs
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RUNNING_CARE_STRIP.map((strip) => (
              <div
                key={strip.id}
                className="bg-purple-800/80 hover:bg-purple-800 p-5 rounded-2xl border border-purple-700/80 transition-all space-y-2 text-left"
              >
                <h4 className="text-base font-extrabold text-white">{strip.title}</h4>
                <p className="text-xs text-purple-200 leading-relaxed font-normal">{strip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW HEALTH EXPRESS WORKS */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-3 py-1 rounded-full inline-block">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How Health Express Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 text-left relative"
              >
                <span className="text-2xl font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-xl inline-block">
                  {step.step}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. WHY FAMILIES USE HEALTH EXPRESS */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Families Use Health Express
            </h2>
          </div>

          <div className="bg-purple-50/60 p-6 sm:p-8 rounded-3xl border border-purple-200/80 space-y-4 text-left">
            {[
              'One point of coordination for home-care requirements',
              'Support for different family members and care situations',
              'Care options coordinated around your location and requirements',
              'Clear discussion of availability, scope and pricing before confirmation',
              'Convenient coordination through WhatsApp'
            ].map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-normal">{point}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="py-14 bg-gradient-to-b from-purple-900 to-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tell Us What Your Family Needs
          </h2>

          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
            Whether you need a home nurse, elderly caregiver, patient caregiver, respite care or a Japa caregiver after childbirth, start by telling us what you need. Health Express will help coordinate the next step.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleWhatsAppAction()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer touch-target active:scale-95"
            >
              <MessageSquare className="w-4.5 h-4.5 text-white" />
              <span>Get Care at Home</span>
            </button>

            <button
              onClick={() => handleWhatsAppAction("Hi HealthExpress, I want to inquire about home nursing in Bengaluru.")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-purple-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-purple-50 transition-all cursor-pointer"
            >
              <span>WhatsApp Health Express</span>
            </button>
          </div>

          <p className="text-[11px] text-purple-300 font-medium pt-2">
            Availability, pricing and caregiver details are confirmed based on your specific requirement and location.
          </p>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-3 py-1 rounded-full inline-block">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-extrabold text-slate-900 hover:text-purple-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-purple-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 10. TRUST & SAFETY */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3 text-left">
            <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
              <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Trust & Safety Disclaimer</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
              Care requirements are different for every family. Health Express coordinates options based on the information you provide, but caregiver qualifications, availability, responsibilities, pricing and scope of services should always be confirmed before care begins.
            </p>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
              For medical or clinical needs, families should use appropriately qualified healthcare professionals and follow the advice of the treating doctor or healthcare team.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
