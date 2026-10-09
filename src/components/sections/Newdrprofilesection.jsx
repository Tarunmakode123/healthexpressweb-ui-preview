import React from 'react';
import { Award, Star, ArrowRight, Stethoscope } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function DoctorsProfileSection() {
  const doctors = [
    {
      name: "Dr. Ananya Sharma",
      designation: "Senior General Physician",
      degree: "MBBS, MD - General Medicine",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Priya Deshmukh",
      designation: "Consultant Gynecologist",
      degree: "MBBS, MS - Obstetrics & Gynaecology",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Neha Verma",
      designation: "Pediatrician & Child Care",
      degree: "MBBS, MD - Pediatrics",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Pooja Iyer",
      designation: "Chief Dermatologist",
      degree: "MBBS, MD - Dermatology",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Ritu Saxena",
      designation: "Senior Cardiologist",
      degree: "MBBS, DM - Cardiology",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Sneha Pillai",
      designation: "Clinical Endocrinologist",
      degree: "MBBS, DNB - Endocrinology",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Kavita Menon",
      designation: "Neurology Specialist",
      degree: "MBBS, DM - Neurology",
      image: "/images/services/drprofile.png"
    },
    {
      name: "Dr. Meenakshi Roy",
      designation: "Senior Ophthalmologist",
      degree: "MBBS, MS - Ophthalmology",
      image: "/images/services/drprofile.png"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold uppercase tracking-wider">
            <Stethoscope className="w-4 h-4 text-purple-700" />
            <span>Expert Medical Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Experienced Specialists
          </h2>
          <p className="text-base text-slate-600 font-medium">
            Consult with top-rated medical professionals dedicated to providing compassionate and expert healthcare for you and your family.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc, index) => (
            <div 
              key={index}
              className="bg-white rounded-none border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="relative w-full h-56 bg-purple-50 overflow-hidden">
                <img 
                  src={doc.image} 
                  alt={doc.name} 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-purple-900 flex items-center gap-1 shadow-sm">
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
                    className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
    </section>
  );
}