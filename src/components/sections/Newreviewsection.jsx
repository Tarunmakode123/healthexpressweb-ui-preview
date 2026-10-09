import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2, Sparkles } from 'lucide-react';

const INDIAN_REVIEWS = [
  {
    name: "Rajesh Sharma",
    location: "Indiranagar, Bangalore",
    rating: 5,
    date: "2 days ago",
    review: "Health Express made my father's diabetes and lipid profile testing extremely hassle-free. The phlebotomist came right on time for home collection, and we received 100% accurate NABL verified reports within 6 hours!"
  },
  {
    name: "Priya Verma",
    location: "Koramangala, Bangalore",
    rating: 5,
    date: "1 week ago",
    review: "Outstanding service! Transparent pricing with huge discounts compared to local labs. Their dedicated health manager coordinated everything seamlessly on WhatsApp."
  },
  {
    name: "Amitabh Banerjee",
    location: "Jayanagar, Bangalore",
    rating: 5,
    date: "3 days ago",
    review: "Very professional team. Booking a CBC test took literally one click, and the digital reports were secure and easy to download. Highly recommended for families."
  },
  {
    name: "Sneha Patel",
    location: "Whitefield, Bangalore",
    rating: 5,
    date: "2 weeks ago",
    review: "I was struggling to schedule a thyroid profile and X-ray coordination for my mother. Health Express solved it all in one place. Amazing support and fast service!"
  },
  {
    name: "Vikram Singh",
    location: "HSR Layout, Bangalore",
    rating: 5,
    date: "5 days ago",
    review: "Clean, fast, and reliable. The free home collection executive was extremely courteous and followed all safety protocols. 5 stars for accuracy and speed."
  },
  {
    name: "Ananya Deshmukh",
    location: "JP Nagar, Bangalore",
    rating: 5,
    date: "Yesterday",
    review: "Super fast report delivery! I got my HbA1c test results in just a few hours. The digital dashboard is very clean and easy to access anytime."
  },
  {
    name: "Manoj Kumar",
    location: "Marathahalli, Bangalore",
    rating: 5,
    date: "3 weeks ago",
    review: "Best healthcare platform. Saved almost 60% on our full-body health checkup package. Zero hidden charges and very polite customer care."
  },
  {
    name: "Deepika Rathi",
    location: "Hebbal, Bangalore",
    rating: 5,
    date: "4 days ago",
    review: "Seamless booking and doorstep service. It feels like having a personal healthcare manager for the entire household. Excellent work by Health Express!"
  },
  {
    name: "Sanjay Gupta",
    location: "Electronic City, Bangalore",
    rating: 5,
    date: "1 month ago",
    review: "Reliable lab partners and prompt collection. Their digital reports are crystal clear and accepted by all major specialist doctors."
  },
  {
    name: "Pooja Malhotra",
    location: "Malleshwaram, Bangalore",
    rating: 5,
    date: "6 days ago",
    review: "Incredible user experience. From uploading prescription to final report delivery, everything was butter smooth. Will definitely use again."
  }
];

export default function TestimonialsSection() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 lg:py-12 bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-slate-100 relative overflow-hidden font-serif" id="testimonials-section" style={{ fontFamily: 'serif' }}>
      
      <style>{`
        /* Strongly Highlighted Sharp Edge Review Card Box */
        .review-card-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(100, 48, 158, 0.06) 100%);
          border: 1.5px solid rgba(100, 48, 158, 0.28);
          border-left: 5px solid #64309e;
          border-top: 3px solid rgba(100, 48, 158, 0.4);
          box-shadow: 0 10px 30px -4px rgba(100, 48, 158, 0.18);
          transition: all 0.35s ease;
        }
        .review-card-box:hover {
          box-shadow: 0 16px 38px -4px rgba(100, 48, 158, 0.3);
          border-color: rgba(100, 48, 158, 0.6);
          transform: translateY(-3px);
        }
      `}</style>

      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-100/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header & Scroller Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 text-left max-w-2xl">
            <span 
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-none font-extrabold text-xs uppercase tracking-wider border font-serif"
              style={{ backgroundColor: 'rgba(100, 48, 158, 0.05)', borderColor: 'rgba(100, 48, 158, 0.2)', color: '#64309e', fontFamily: 'serif' }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#64309e' }} />
              PATIENT REVIEWS & STORIES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-serif" style={{ fontFamily: 'serif' }}>
              Trusted by thousands of <br />
              <span style={{ color: '#64309e', fontFamily: 'serif' }}>families in Bangalore</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium font-serif" style={{ fontFamily: 'serif' }}>
              Read genuine feedback from patients who experience fast home collection, 100% clear results, and dedicated care every single day.
            </p>
          </div>

          {/* Manual Scroll Navigation Arrows */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-none border-2 border-slate-200 bg-white hover:bg-purple-50 flex items-center justify-center text-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-none border-2 border-slate-200 bg-white hover:bg-purple-50 flex items-center justify-center text-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Review Cards Container */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {INDIAN_REVIEWS.map((item, idx) => (
            <div 
              key={idx}
              className="w-[300px] sm:w-[340px] shrink-0 review-card-box rounded-none p-6 flex flex-col justify-between group relative text-left font-serif"
              style={{ fontFamily: 'serif' }}
            >
              {/* Top Quote Icon & Stars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#64309e] text-[#64309e]" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-purple-300/60 group-hover:text-purple-400 transition-colors" />
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed font-serif" style={{ fontFamily: 'serif' }}>
                  "{item.review}"
                </p>
              </div>

              {/* Bottom User Info */}
              <div className="pt-4 mt-6 border-t border-purple-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-950 transition-colors flex items-center gap-1.5 font-serif" style={{ fontFamily: 'serif' }}>
                    {item.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold font-serif" style={{ fontFamily: 'serif' }}>{item.location}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-none border border-purple-100 shadow-2xs font-serif" style={{ fontFamily: 'serif' }}>
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}