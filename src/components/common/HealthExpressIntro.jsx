import React, { useState, useEffect, useRef } from 'react';

export default function HealthExpressIntro() {
  const [state, setState] = useState('INITIALIZING'); // 'INITIALIZING', 'PLAYING', 'FADING_OUT', 'HIDDEN'
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setState('HIDDEN');
      return;
    }

    // 2. Check sessionStorage
    try {
      const alreadyShown = sessionStorage.getItem('healthExpressIntroShown');
      if (alreadyShown === 'true') {
        setState('HIDDEN');
        return;
      }
    } catch (e) {
      // Ignore storage errors
    }

    // 3. First visit in session -> Start Playing
    setState('PLAYING');

    // Failsafe timeout: Max 6.5s to ensure user never gets stuck
    timeoutRef.current = setTimeout(() => {
      dismissIntro();
    }, 6500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const dismissIntro = () => {
    try {
      sessionStorage.setItem('healthExpressIntroShown', 'true');
    } catch (e) {
      // Ignore
    }

    setState('FADING_OUT');
    setTimeout(() => {
      setState('HIDDEN');
    }, 600); // 600ms smooth fade transition
  };

  const handleVideoEnded = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Pause 250ms on final frame before fade out
    setTimeout(() => {
      dismissIntro();
    }, 250);
  };

  const handleVideoError = () => {
    console.warn('Intro video playback error. Gracefully dismissing intro.');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    dismissIntro();
  };

  if (state === 'HIDDEN') return null;

  return (
    <div
      className={`fixed inset-0 w-screen h-screen z-[99999] bg-black flex items-center justify-center overflow-hidden pointer-events-auto transition-opacity duration-600 ease-out ${
        state === 'FADING_OUT' ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Video Container - Full Screen Cinematic (object-cover edge-to-edge) */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src="/videos/health-express-logo-intro.mp4"
          autoPlay
          muted
          playsInline
          controls={false}
          preload="metadata"
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          className="w-full h-full object-contain md:object-cover pointer-events-none select-none"
        />
      </div>

      {/* Skip Intro Button */}
      <button
        onClick={dismissIntro}
        className="absolute bottom-6 right-6 z-10 px-4 py-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
      >
        Skip Intro →
      </button>
    </div>
  );
}
