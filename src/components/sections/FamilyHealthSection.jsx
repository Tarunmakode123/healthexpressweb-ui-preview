import React from 'react';
import { Users, FolderHeart, FileText, Calendar } from 'lucide-react';

export default function FamilyHealthSection() {
  const features = [
    {
      icon: Users,
      title: 'Family Accounts',
      description: 'Manage healthcare needs for the people who matter to you.'
    },
    {
      icon: FolderHeart,
      title: 'Health Records',
      description: 'Keep important healthcare information organized and accessible.'
    },
    {
      icon: FileText,
      title: 'Reports',
      description: 'Access digital reports from participating diagnostic services.'
    },
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'Keep consultations and healthcare services easier to manage.'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-purple-700">
            YOUR HEALTH, ORGANIZED
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One place for your family's healthcare journey.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Healthcare rarely involves just one appointment or one person. Health Express is designed to help you organize healthcare services and information for yourself and your family — from booking diagnostics to managing reports and keeping track of ongoing healthcare needs.
          </p>
        </div>

        {/* 4 Feature Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-purple-50/40 hover:bg-purple-50 p-6 rounded-3xl border border-purple-100/80 shadow-xs transition-all text-left space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{feat.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
