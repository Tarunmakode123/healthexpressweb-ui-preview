import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import NewServicesSection from '../components/sections/NewServicesSection';
import Newwhychooseus from '../components/sections/Newwhychooseus';
import Newsectionvideoabout from '../components/sections/Newsectionvideoabout';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import Sixpointsection from '../components/sections/Sixpointsection';
import HealthRecordsSection from '../components/sections/HealthRecordsSection';
import Newreviewsection from '../components/sections/Newreviewsection';
import Newfaqsection from '../components/sections/Newfaqsection';
import HealthLibrarySection from '../components/sections/HealthLibrarySection';
import Homecontactsection from '../components/sections/Homecontactsection';
import StickyMobileCTA from '../components/layout/StickyMobileCTA';

export default function HomePage({ onOpenUploadModal, onOpenCalculatorModal }) {
  return (
    <div className="space-y-0 relative">
      {/* 1. WHO ARE YOU? -> Hero */}
      <HeroSection onOpenUploadModal={onOpenUploadModal} />

       {/* 1. WHO ARE YOU? -> Hero */}
      <NewServicesSection />

       {/* 1. WHO ARE YOU? -> Hero */}
      <Newwhychooseus />

      {/* 1. WHO ARE YOU? -> Hero */}
      <Newsectionvideoabout />


      {/* WHAT HEALTH EXPRESS DOES & PATIENT JOURNEY -> One Connected Platform & 4-Step Journey */}
      <HowItWorksSection onOpenUploadModal={onOpenUploadModal} />


      {/* 1. WHO ARE YOU? -> Hero */}
      <Sixpointsection />
 
      
 
  

      {/* HEALTH RECORDS AND REPORTS */}
      <HealthRecordsSection />



{/* HEALTH RECORDS AND REPORTS */}
      <Newreviewsection />





      
 {/* HEALTH RECORDS AND REPORTS */}
      <Newfaqsection />

      
 


{/* HEALTH LIBRARY -> Evidence-informed guides */}
      <HealthLibrarySection />



{/* HEALTH LIBRARY -> Evidence-informed guides */}
      <Homecontactsection />




      {/* Floating Sticky Mobile WhatsApp CTA */}
      <StickyMobileCTA onOpenUploadModal={onOpenUploadModal} />
    </div>
  );
}