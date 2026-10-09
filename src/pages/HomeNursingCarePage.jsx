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





    

<section className="relative text-white pt-20 pb-24 overflow-hidden bg-black">
  {/* Big Background Image with minimal dark fade at edges */}
  <div className="absolute inset-0 z-0">
    <img
      src="/images/services/nursingbanne.png"
      alt="Home Nursing and Care Banner"
      className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
    />
    {/* Very light gradient only at the left and bottom so text pops without hiding the image */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
  </div>

  {/* Main Content Container */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="max-w-3xl space-y-6">
      
      {/* Location Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white text-xs font-extrabold tracking-wide uppercase shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
        <MapPin className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
        <span>Bengaluru Care Coordination</span>
      </div>

      {/* Main Heading with White Glow Shadow */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15] drop-shadow-[0_2px_16px_rgba(255,255,255,0.45)]">
        Home Nursing <span className="text-purple-300">&</span> Care
      </h1>

      {/* Subheading with White Shadow */}
      <p className="text-lg sm:text-xl font-bold text-gray-100 leading-snug drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)]">
        Professional care and caregiving support, where your family needs it.
      </p>

      {/* Description Paragraph with White-tinted Glass Overlay */}
      <p className="text-sm sm:text-base text-gray-100 leading-relaxed font-normal max-w-2xl bg-black/50 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-[0_8px_30px_rgba(255,255,255,0.1)]">
        Tell Health Express what kind of support you need, where you need it and for how long. We help coordinate suitable home nursing and caregiving options for your family — starting with select areas in Bengaluru.
      </p>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
        <button
          onClick={() => handleWhatsAppAction()}
          className="px-7 py-4 rounded-xl bg-white text-purple-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_6px_25px_rgba(255,255,255,0.25)] hover:bg-gray-100 hover:shadow-[0_8px_30px_rgba(255,255,255,0.4)] transition-all cursor-pointer touch-target active:scale-95 group"
        >
          <MessageSquare className="w-4.5 h-4.5 text-purple-700 fill-purple-700/20 transition-transform group-hover:scale-110" />
          <span>Request Home Care</span>
        </button>

        <button
          onClick={onOpenUploadModal}
          className="px-7 py-4 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-extrabold text-sm border border-white/30 flex items-center justify-center gap-2.5 shadow-[0_6px_25px_rgba(255,255,255,0.15)] transition-all cursor-pointer active:scale-95 group"
        >
          <span>Upload Doctor Prescription</span>
          <ArrowRight className="w-4 h-4 text-purple-200 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Trust / Service Area Indicator */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-200 pt-2 drop-shadow-[0_1px_6px_rgba(255,255,255,0.3)]">
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
     <section className="py-16 sm:py-20 bg-white border-b border-slate-200 overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
      
      {/* Left Column: Big Image with Purple Shadow & Equal Height Match */}
      <div className="lg:col-span-6 relative flex items-center">
        {/* Soft rich purple ambient glow behind the image */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-700/25 via-indigo-600/15 to-purple-500/10 rounded-[2.5rem] blur-3xl transform scale-95" />
        
        {/* Image Container matching content height */}
        <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-[2.5rem] overflow-hidden border-2 border-purple-200/80 shadow-[0_25px_60px_rgba(126,34,206,0.22)] bg-purple-50/50 group flex">
          <img
            src="/images/services/homecareimge.png"
            alt="Home Nursing Care Coordination"
            className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Subtle bottom gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right Column: Content & Details (Equal Height Alignment) */}
      <div className="lg:col-span-6 flex flex-col justify-between space-y-6 text-center sm:text-left">
        
        <div className="space-y-4">
          {/* Badge */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-purple-200 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Simpler Care Coordination
            </span>
          </div>

          {/* Heading */}
       
<h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
  Expert Home Nursing Care, <span className="text-purple-700">Right at Your Doorstep</span>
</h2>

        </div>

        {/* Eye-Catching Styled Content Container */}
        <div className="space-y-4 text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 sm:p-8 rounded-[2.5rem] border border-purple-100/80 shadow-[0_12px_35px_rgba(126,34,206,0.04)] text-left flex flex-col justify-center">
          
          {/* Paragraph 1 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs transition-all hover:border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600 mt-2 shrink-0 shadow-xs" />
            <p>
              Finding the right support for a loved one can be <strong className="text-slate-900 font-bold">time-consuming</strong> — especially after a hospital stay, surgery, childbirth, illness or when an elderly family member needs help at home.
            </p>
          </div>

          {/* Paragraph 2 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs transition-all hover:border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600 mt-2 shrink-0 shadow-xs" />
            <p>
              <strong className="text-purple-900 font-extrabold">Health Express</strong> helps make the process simpler. Tell us about your care requirement, location, preferred duration and the type of support you need to coordinate suitable options.
            </p>
          </div>

          {/* Paragraph 3 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs transition-all hover:border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600 mt-2 shrink-0 shadow-xs" />
            <p>
              From home nursing and elderly care to post-operative support, patient caregiving, and postpartum assistance, Health Express gives your family <strong className="text-slate-900 font-bold">one place to start</strong>.
            </p>
          </div>

        </div>

      </div>

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
     <section className="bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 py-20 overflow-hidden relative border-b border-purple-800/40 shadow-2xl">
  {/* Ambient background glow elements */}
  <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
    
    {/* Section Header / Badge */}
    <div className="text-center sm:text-left">
      <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-purple-800/90 text-purple-200 border border-purple-700 shadow-inner">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-300"></span>
        </span>
        Specialized Care Programs
      </span>
    </div>

    {/* Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {RUNNING_CARE_STRIP.map((strip) => (
        <div
          key={strip.id}
          className="bg-purple-900/40 hover:bg-purple-900/80 backdrop-blur-md p-7 rounded-3xl border border-purple-700/50 
                     shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] 
                     hover:border-purple-400 
                     hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.4)] 
                     transition-all duration-500 space-y-3 text-left group transform hover:-translate-y-1.5"
        >
          {/* Animated Icon Area */}
          <div className="w-12 h-12 rounded-2xl bg-purple-800/80 border border-purple-600/60 flex items-center justify-center text-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:scale-105">
            <svg 
              className="w-6 h-6 transition-transform duration-500 group-hover:rotate-[360deg]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h4 className="text-lg font-black text-white tracking-tight group-hover:text-purple-200 transition-colors duration-300 pt-1">
            {strip.title}
          </h4>
          <p className="text-sm text-purple-200/90 leading-relaxed font-medium">
            {strip.desc}
          </p>
          
          {/* Decorative hover line */}
          <div className="h-1 w-0 bg-gradient-to-r from-purple-400 to-indigo-300 rounded-full group-hover:w-full transition-all duration-500 mt-4"></div>
        </div>
      ))}
    </div>

  </div>
</section>







      

      {/* 6. HOW HEALTH EXPRESS WORKS */}



      <section className="py-20 bg-gradient-to-b from-white via-slate-50/50 to-purple-50/20 border-b border-slate-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    
    {/* Section Header */}
    <div className="text-center max-w-2xl mx-auto space-y-2">
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
        Simple 4-Step Process
      </span>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        How Health Express <span className="text-purple-700">Works</span>
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 font-medium">
        Getting professional and reliable home nursing support for your family is simple, transparent, and structured.
      </p>
    </div>

    {/* Main Split Layout: Left Image Card & Right 4 Steps */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      
      {/* Left Column: Visual Image Banner Card */}
      <div className="lg:col-span-5 relative group">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative bg-white p-3 rounded-3xl border border-purple-100 shadow-xl overflow-hidden space-y-4">
          <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-purple-950">
            <img 
              src="/images/services/smileimagetewo.jpg" 
              alt="Health Express Home Care Support" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-purple-950/20 to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 bg-purple-900/80 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-2 border border-purple-700/50">
                Trusted Care 24/7
              </span>
              <h3 className="text-lg font-black text-white tracking-tight">
                Compassionate Care Right at Your Doorstep
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 4-Step Grid/List */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <div
            key={step.step}
            className="bg-white p-6 rounded-3xl border border-purple-100/80 hover:border-purple-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(126,34,206,0.08)] transition-all duration-300 space-y-3 group transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-900 to-purple-800 text-white flex items-center justify-center font-black text-sm shadow-md shadow-purple-900/20 group-hover:scale-110 transition-transform duration-300">
                {step.step}
              </span>
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                Step 0{step.step}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>

  </div>
</section>





      {/* 7. WHY FAMILIES USE HEALTH EXPRESS */}
      

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




     <section className="py-20 bg-gradient-to-b from-white via-slate-50/50 to-purple-50/20 border-b border-slate-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    
    {/* Top Heading & Description */}
    <div className="text-center max-w-3xl mx-auto space-y-3">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
        Got Questions?
      </span>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
        Frequently Asked <span className="text-purple-700">Questions</span>
      </h2>
      <p className="text-sm text-slate-600 font-medium leading-relaxed">
        Find clear, straightforward answers regarding our home nursing care services, caregiver arrangements, scheduling flexibility, and clinical safety protocols.
      </p>
    </div>

    {/* Bottom 5-5 Left & Right Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      {/* Left Column: First 5 FAQs */}
      <div className="space-y-3.5 text-left">
        {FAQS.slice(0, 5).map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
                isOpen ? 'border-purple-300 shadow-[0_8px_30px_rgba(126,34,206,0.08)]' : 'border-slate-200/85 hover:border-purple-200'
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 flex items-center justify-between text-left text-xs sm:text-sm font-extrabold text-slate-900 hover:text-purple-900 cursor-pointer gap-4"
              >
                <span className="leading-snug">{faq.q}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-purple-50 pt-3 bg-purple-50/25">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Column: Remaining FAQs */}
      <div className="space-y-3.5 text-left">
        {FAQS.slice(5, 10).map((faq, sliceIdx) => {
          const idx = sliceIdx + 5; // Offset index to keep state aligned with FAQS array
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
                isOpen ? 'border-purple-300 shadow-[0_8px_30px_rgba(126,34,206,0.08)]' : 'border-slate-200/85 hover:border-purple-200'
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 flex items-center justify-between text-left text-xs sm:text-sm font-extrabold text-slate-900 hover:text-purple-900 cursor-pointer gap-4"
              >
                <span className="leading-snug">{faq.q}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-purple-50 pt-3 bg-purple-50/25">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
