import React, { useState, useMemo } from 'react';
import { Pill, Clock, Utensils, Upload, MessageSquare, ArrowRight, Check, Sparkles } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import HealthCheckDisclaimer from './HealthCheckDisclaimer';

export default function MedicineTimingTool({ onOpenUploadModal }) {
  const [medicineName, setMedicineName] = useState('');
  const [frequency, setFrequency] = useState('2x'); // 1x, 2x, 3x, 4x
  const [foodTiming, setFoodTiming] = useState('after'); // before, with, after, as_directed
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('22:00');

  // Compute live visual daily timeline
  const schedule = useMemo(() => {
    const name = medicineName.trim() || 'Your Medicine';
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    const [sleepH, sleepM] = sleepTime.split(':').map(Number);

    let wakeMin = (wakeH || 7) * 60 + (wakeM || 0);
    let sleepMin = (sleepH || 22) * 60 + (sleepM || 0);
    if (sleepMin <= wakeMin) sleepMin += 24 * 60;

    const totalAwakeMin = sleepMin - wakeMin;

    const foodLabels = {
      before: 'Before food / Empty stomach',
      with: 'With meal / During food',
      after: 'After meal / Post food',
      as_directed: 'As directed by doctor'
    };

    const formatTime = (totalMin) => {
      let mins = totalMin % (24 * 60);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      return `${displayH}:${displayM} ${period}`;
    };

    const slots = [];

    if (frequency === '1x') {
      slots.push({
        time: formatTime(wakeMin + 60),
        label: foodTiming === 'before' ? 'Before breakfast' : 'After breakfast',
        period: 'Morning'
      });
    } else if (frequency === '2x') {
      slots.push({
        time: formatTime(wakeMin + 60),
        label: foodLabels[foodTiming] + ' (Breakfast)',
        period: 'Morning'
      });
      slots.push({
        time: formatTime(Math.min(sleepMin - 120, wakeMin + 13 * 60)),
        label: foodLabels[foodTiming] + ' (Dinner)',
        period: 'Evening'
      });
    } else if (frequency === '3x') {
      slots.push({
        time: formatTime(wakeMin + 60),
        label: foodLabels[foodTiming] + ' (Breakfast)',
        period: 'Morning'
      });
      slots.push({
        time: formatTime(wakeMin + Math.floor(totalAwakeMin * 0.45)),
        label: foodLabels[foodTiming] + ' (Lunch)',
        period: 'Afternoon'
      });
      slots.push({
        time: formatTime(sleepMin - 90),
        label: foodLabels[foodTiming] + ' (Dinner)',
        period: 'Night'
      });
    } else if (frequency === '4x') {
      const step = Math.floor(totalAwakeMin / 4);
      const periods = ['Morning', 'Mid-day', 'Evening', 'Night'];
      for (let i = 0; i < 4; i++) {
        slots.push({
          time: formatTime(wakeMin + 30 + i * step),
          label: foodLabels[foodTiming],
          period: periods[i]
        });
      }
    }

    return { name, slots };
  }, [medicineName, frequency, foodTiming, wakeTime, sleepTime]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: CONTROLS & INPUTS (7 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Question Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-extrabold uppercase tracking-wider">
            <Pill className="w-3.5 h-3.5 text-purple-700" />
            <span>MEDICINE TIMING PLANNER</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            Need help organizing your medicines?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Organize daily doses around your meals and routine for optimal adherence.
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          
          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Medicine Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Paracetamol, Multivitamin, Thyroid med"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>

          {/* Frequency Pill Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Prescribed Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: '1x', label: 'Once (1x)' },
                { key: '2x', label: 'Twice (2x)' },
                { key: '3x', label: '3× Daily' },
                { key: '4x', label: '4× Daily' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFrequency(item.key)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-extrabold transition-all ${
                    frequency === item.key
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Relationship Pill Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Food Relation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'after', label: 'After Food' },
                { key: 'before', label: 'Before Food' },
                { key: 'with', label: 'With Meal' },
                { key: 'as_directed', label: 'As Directed' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFoodTiming(item.key)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-extrabold transition-all ${
                    foodTiming === item.key
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Routine Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Wake-up Time</span>
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Sleep Time</span>
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>
          </div>

        </div>

        {/* Safety Guidance */}
        <p className="text-[11px] text-slate-500 italic leading-relaxed">
          * Follow the schedule prescribed by your doctor or pharmacist. This tool organizes your routine and does not replace medical advice.
        </p>

      </div>

      {/* RIGHT COLUMN: VISUAL DAILY TIMELINE RESULT (6 COLS ON DESKTOP) */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl border border-slate-800 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                VISUAL DAILY TIMELINE
              </span>
              <h4 className="text-lg font-extrabold text-white">{schedule.name}</h4>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700">
              {frequency} Daily
            </span>
          </div>

          {/* Visual Vertical Timeline */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {schedule.slots.map((slot, idx) => (
              <div key={idx} className="relative group">
                {/* Node Bullet */}
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-slate-950 group-hover:scale-125 transition-transform" />
                
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 group-hover:border-purple-500/50 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-purple-300 font-mono tracking-wider">
                      {slot.time}
                    </span>
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.label}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {slot.period}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Ecosystem CTAs Inside Visual Box */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-medium">Have a prescription?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Prescription</span>
              </button>

              <button
                type="button"
                onClick={() => openWhatsApp("Hello Health Express! I would like to speak with a Health Manager regarding my medication schedule.")}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                title="Talk on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
