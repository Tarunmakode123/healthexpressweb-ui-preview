import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * REUSABLE AUTO-ROTATING INFINITE CAROUSEL COMPONENT
 * Provides smooth infinite looping, 5000ms auto-slide, pause on hover,
 * touch swipe support, responsive card sizing, and accessible navigation arrows.
 */
export default function AutoCarousel({ children, autoSlideInterval = 5000 }) {
  const items = React.Children.toArray(children);
  const totalItems = items.length;

  const [cardsPerView, setCardsPerView] = useState(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const timerRef = useRef(null);

  // Update responsive cardsPerView on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver to pause auto-slide when carousel is off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Buffer size equals cardsPerView for seamless infinite clone wrapping
  const buffer = cardsPerView;

  // Build extended items with leading and trailing clones for infinite loop
  const extendedItems = [
    ...items.slice(-buffer),
    ...items,
    ...items.slice(0, buffer)
  ];

  // Manual Navigation Handlers
  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Auto-Slide Timer Management (Exactly 5000ms interval)
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isHovered && isVisible && totalItems > 0) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, autoSlideInterval);
    }
  }, [isHovered, isVisible, totalItems, autoSlideInterval, handleNext]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer, currentIndex]);

  // Handle Seamless Transition Loop Snap
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    } else if (currentIndex < 0) {
      setIsTransitioning(false);
      setCurrentIndex(totalItems - 1);
    }
  };

  // Re-enable transition after seamless position snap
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Touch / Swipe Event Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsHovered(true);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setIsHovered(false);
  };

  if (totalItems === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center gap-2 sm:gap-4 relative">
        
        {/* Left Circular Navigation Arrow Button */}
        <button
          type="button"
          onClick={() => {
            handlePrev();
            resetTimer();
          }}
          className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-purple-200 text-purple-800 hover:bg-purple-700 hover:text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95 z-20 focus:outline-none focus:ring-2 focus:ring-purple-600"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Viewport & Slider Track */}
        <div className="overflow-hidden flex-1 py-3">
          <div
            className="flex"
            style={{
              transform: `translateX(-${(currentIndex + buffer) * (100 / cardsPerView)}%)`,
              transition: isTransitioning ? 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedItems.map((child, idx) => (
              <div
                key={idx}
                style={{ flex: `0 0 ${100 / cardsPerView}%` }}
                className="px-2 sm:px-3 box-border flex-shrink-0"
              >
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Right Circular Navigation Arrow Button */}
        <button
          type="button"
          onClick={() => {
            handleNext();
            resetTimer();
          }}
          className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-purple-200 text-purple-800 hover:bg-purple-700 hover:text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95 z-20 focus:outline-none focus:ring-2 focus:ring-purple-600"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

      </div>
    </div>
  );
}
