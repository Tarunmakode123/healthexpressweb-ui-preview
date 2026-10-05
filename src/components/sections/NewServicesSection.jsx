import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const CATEGORY_ROWS = [
  {
    categoryName: "Lab Test",
    badgeLabel: "Pathology & Diagnostics",
    subtitle: "Accurate blood screening and comprehensive health packages delivered at home.",
    reverse: false,
    items: [
      { name: "Complete Blood Count (CBC)", desc: "Essential screening test for overall health evaluation, detecting anemia, infections, and blood disorders.", brand: "Health Express Diagnostics", icon: "/images/services/iconnew.png" },
      { name: "Thyroid Profile (T3 T4 TSH)", desc: "Comprehensive hormone level evaluation to monitor thyroid function, metabolism, and energy regulation.", brand: "Health Express Labs", icon: "/images/services/iconnew.png" },
      { name: "HbA1c Diabetes Test", desc: "Reliable 3-month average blood sugar monitoring report for effective diabetes management and risk assessment.", brand: "Health Express Care", icon: "/images/services/iconnew.png" },
      { name: "Lipid Profile Test", desc: "Advanced heart health and cholesterol screening to measure triglycerides, HDL, and LDL levels accurately.", brand: "Health Express Wellness", icon: "/images/services/iconnew.png" }
    ]
  },
  {
    categoryName: "Home Care",
    badgeLabel: "At-Home Medical Care",
    subtitle: "Professional nursing, elder care, and medical assistance right at the comfort of your home.",
    reverse: true,
    items: [
      { name: "Trained Attendant & Elder Care", desc: "Compassionate and professional caregivers assisting seniors with daily living, mobility, and medication.", brand: "Health Express Home Care", icon: "/images/services/homecaree.jpg" },
      { name: "Professional Nursing Care", desc: "Certified nurses providing post-surgical care, wound dressing, catheter care, and injections at home.", brand: "Health Express Nursing", icon: "/images/services/homecaree.jpg" },
      { name: "Physiotherapy at Home", desc: "Expert physical therapists for stroke rehab, orthopedic recovery, joint pain relief, and mobility exercises.", brand: "Health Express Rehab", icon: "/images/services/homecaree.jpg" },
      { name: "Critical & ICU Care at Home", desc: "24/7 dedicated medical setup with oxygen support, monitors, and trained medical staff at your residence.", brand: "Health Express Critical", icon: "/images/services/homecaree.jpg" }
    ]
  },
  {
    categoryName: "Radiology",
    badgeLabel: "Diagnostic Imaging",
    subtitle: "High-precision imaging scans powered by cutting-edge technology and expert radiologists.",
    reverse: false,
    items: [
      { name: "MRI Brain Scan", desc: "High-resolution detailed neurological imaging for precise diagnosis of brain structures and conditions.", brand: "Health Express Imaging", icon: "/images/services/exrayicon.png" },
      { name: "CT Chest Scan", desc: "Detailed thoracic and pulmonary imaging for clear visualization of lung and chest tissue health.", brand: "Health Express Scans", icon: "/images/services/exrayicon.png" },
      { name: "Ultrasound Whole Abdomen", desc: "Safe, non-invasive internal organ screening to examine liver, kidneys, pancreas, and pelvic regions.", brand: "Health Express Diagnostics", icon: "/images/services/exrayicon.png" },
      { name: "Digital X-Ray", desc: "Instant, low-radiation skeletal and chest imaging for rapid diagnosis of bone and joint injuries.", brand: "Health Express Radiology", icon: "/images/services/exrayicon.png" }
    ]
  },
  {
    categoryName: "Surgery",
    badgeLabel: "Surgical Care",
    subtitle: "Advanced minimally invasive procedures performed by expert surgeons with fast recovery.",
    reverse: true,
    items: [
      { name: "Laser Piles Surgery", desc: "Advanced pain-free modern procedure ensuring minimal discomfort and exceptionally fast patient recovery.", brand: "Health Express Surgical", icon: "/images/services/surgeryicon.png" },
      { name: "Laparoscopic Hernia Repair", desc: "State-of-the-art mesh surgery performed by leading specialists with expert post-operative care.", brand: "Health Express Care", icon: "/images/services/surgeryicon.png" },
      { name: "Gallbladder Removal", desc: "Safe and effective keyhole laparoscopic procedure ensuring minimal scarring and shorter hospital stays.", brand: "Health Express Surgery", icon: "/images/services/surgeryicon.png" },
      { name: "Knee Replacement", desc: "Advanced joint care, rehabilitation, and orthopedic solutions designed to restore full mobility.", brand: "Health Express Orthopedics", icon: "/images/services/surgeryicon.png" }
    ]
  }
];

export default function NewServicesSection() {
  const rowRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const scrollManual = (index, direction) => {
    if (rowRefs[index].current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      rowRefs[index].current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-14 lg:py-10 bg-white relative overflow-hidden">
      
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: scroll-left 35s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: scroll-right 35s linear infinite;
        }
        .animate-marquee-left:hover, .animate-marquee-right:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 lg:space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span 
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-extrabold text-xs uppercase tracking-wider border"
            style={{ backgroundColor: 'rgba(97, 44, 156, 0.05)', borderColor: 'rgba(97, 44, 156, 0.2)', color: '#612c9c' }}
          >
            Explore Offerings
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Specialized Medical Services, <br />
            <span style={{ color: '#612c9c' }}>Designed For Care.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Browse through our extensive catalog of lab diagnostics, home care, radiology scans, and surgical procedures.
          </p>
        </div>

        {/* Rows Setup */}
        <div className="space-y-8 lg:space-y-10">
          {CATEGORY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-slate-100 pb-8 last:border-b-0">
              
              {/* LEFT SIDE: Category Title & Info */}
              <div className="lg:col-span-3 space-y-2 text-left">
                <span 
                  className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md border inline-block"
                  style={{ backgroundColor: 'rgba(97, 44, 156, 0.05)', borderColor: 'rgba(97, 44, 156, 0.2)', color: '#612c9c' }}
                >
                  {row.badgeLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
                  {row.categoryName}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {row.subtitle}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:underline"
                    style={{ color: '#612c9c' }}
                  >
                    <span>View All {row.categoryName}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Manual Navigation Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => scrollManual(rowIndex, 'left')}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollManual(rowIndex, 'right')}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Automatic Marquee + Manual Scroll Container */}
              <div className="lg:col-span-9 overflow-hidden relative py-2">
                
                {/* Minimal Edge Gradient Fades */}
                <div className="absolute left-0 inset-y-0 w-4 sm:w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 inset-y-0 w-4 sm:w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <div 
                  ref={rowRefs[rowIndex]} 
                  className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className={row.reverse ? "animate-marquee-right" : "animate-marquee-left"}>
                    {row.items.concat(row.items).map((item, idx) => (
                      <div 
                        key={idx}
                        className="w-[310px] sm:w-[330px] bg-white hover:bg-purple-50/20 border-2 border-slate-200/80 rounded-2xl p-4.5 mx-3 flex flex-col justify-between shrink-0 transition-all duration-300 group shadow-sm hover:shadow-md"
                      >
                        <div className="space-y-3">
                          
                          {/* Brand & Badge Top Header */}
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" style={{ color: '#612c9c' }} />
                              {item.brand}
                            </span>
                            <span 
                              className="text-[9px] font-extrabold px-2 py-0.5 rounded border"
                              style={{ backgroundColor: 'rgba(97, 44, 156, 0.05)', borderColor: 'rgba(97, 44, 156, 0.2)', color: '#612c9c' }}
                            >
                              Verified
                            </span>
                          </div>

                          {/* Sub-Service Name with Larger Dynamic Icon on the Right Side */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <h4 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                            <img 
                              src={item.icon || "/images/services/iconnew.png"} 
                              alt="icon" 
                              className="w-8 h-8 object-contain shrink-0" 
                            />
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                            {item.desc}
                          </p>
                        </div>

                        {/* Bottom Action */}
                        <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                          <Link 
                            to="/services"
                            className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                            style={{ backgroundColor: '#612c9c' }}
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                          </Link>
                          <span className="text-[11px] font-extrabold text-slate-500">
                            Available 24/7
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}