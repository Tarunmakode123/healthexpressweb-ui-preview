import React, { useEffect } from 'react';
import { X, Sparkles, Activity, Pill, Thermometer, Droplet, HeartPulse } from 'lucide-react';
import MedicineTimingTool from './MedicineTimingTool';
import BloodPressureTool from './BloodPressureTool';
import TemperatureTool from './TemperatureTool';
import HydrationTool from './HydrationTool';

export default function HealthCheckModal({ activeTool, onClose, onOpenUploadModal }) {
  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeTool) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTool]);

  if (!activeTool) return null;

  const renderToolComponent = () => {
    switch (activeTool) {
      case 'medicine':
        return <MedicineTimingTool onOpenUploadModal={onOpenUploadModal} />;
      case 'bp':
        return <BloodPressureTool />;
      case 'temp':
        return <TemperatureTool />;
      case 'hydration':
        return <HydrationTool />;
      default:
        return null;
    }
  };

  const getToolMeta = () => {
    switch (activeTool) {
      case 'medicine':
        return {
          title: 'When should I take my medicine?',
          subtitle: 'Medicine Timing Planner',
          icon: <Pill className="w-5 h-5 text-purple-700" />,
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-200'
        };
      case 'bp':
        return {
          title: 'What does my BP reading mean?',
          subtitle: 'Blood Pressure Interpretation',
          icon: <HeartPulse className="w-5 h-5 text-rose-600" />,
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-200'
        };
      case 'temp':
        return {
          title: 'Is my temperature concerning?',
          subtitle: 'Fever & Temperature Check',
          icon: <Thermometer className="w-5 h-5 text-amber-600" />,
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200'
        };
      case 'hydration':
        return {
          title: 'Am I drinking enough water?',
          subtitle: 'Daily Hydration Target',
          icon: <Droplet className="w-5 h-5 text-sky-600 fill-current" />,
          badgeBg: 'bg-sky-100 text-sky-900 border-sky-200'
        };
      default:
        return { title: 'Quick Health Check', subtitle: 'Health Express Utility', icon: <Activity className="w-5 h-5 text-purple-700" />, badgeBg: 'bg-purple-100 text-purple-900' };
    }
  };

  const meta = getToolMeta();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 p-5 sm:p-7 max-h-[90vh] overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors touch-target"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8 space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-wider ${meta.badgeBg}`}>
            {meta.icon}
            <span>{meta.subtitle}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {meta.title}
          </h3>
        </div>

        {/* Tool Active Content */}
        <div className="flex-1">
          {renderToolComponent()}
        </div>

      </div>
    </div>
  );
}
