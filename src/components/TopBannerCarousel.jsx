import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DISTRICT_BANNERS = [
  { id: 'hyderabad', label: 'Hyderabad', src: '/assets/banners/Hyderabad.png' },
  { id: 'warangal', label: 'Warangal', src: '/assets/banners/Warangal.png' },
  { id: 'karimnagar', label: 'Karimnagar', src: '/assets/banners/Karimnagar.png' },
  { id: 'khammam', label: 'Khammam', src: '/assets/banners/Khammam.png' },
  { id: 'mahbubnagar', label: 'Mahbubnagar', src: '/assets/banners/Mahbubnagar.png' },
  { id: 'medak', label: 'Medak', src: '/assets/banners/Medak.png' },
  { id: 'nalgonda', label: 'Nalgonda', src: '/assets/banners/Nalagonda.png' },
  { id: 'nizamabad', label: 'Nizamabad', src: '/assets/banners/Nizamabad.png' },
  { id: 'adilabad', label: 'Adilabad', src: '/assets/banners/Adilabad.png' },
];

const SLIDE_INTERVAL_MS = 4500;

/**
 * Full-width panoramic header banner carousel positioned directly above the navbar.
 * Auto-rotates smoothly across the 9 official Telangana Neurosciences Society district banners.
 */
export default function TopBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || prefersReduced) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DISTRICT_BANNERS.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + DISTRICT_BANNERS.length) % DISTRICT_BANNERS.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % DISTRICT_BANNERS.length);
  };

  return (
    <div
      className="relative w-full bg-[#EBE6C8] border-b border-[#C18C26]/40 overflow-hidden group select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Telangana Neurosciences Society District Header Banners"
    >
      {/* Preserves full 1920x500 panoramic artwork without clipping the TNS crest or district landmarks */}
      <div className="relative w-full aspect-[1920/500]">
        {DISTRICT_BANNERS.map((banner, idx) => {
          const isActive = idx === activeIndex;
          return (
            <img
              key={banner.id}
              src={banner.src}
              alt={`Telangana Neurosciences Society — ${banner.label}`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              loading={idx <= 1 ? 'eager' : 'lazy'}
              draggable={false}
            />
          );
        })}

        {/* Discreet Previous / Next controls on hover */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous banner"
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#393185]/75 hover:bg-[#393185] text-[#FBF8F1] border border-[#C18C26]/60 absolute left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next banner"
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#393185]/75 hover:bg-[#393185] text-[#FBF8F1] border border-[#C18C26]/60 absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Subtle district pagination dots */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#292638]/55 backdrop-blur-xs absolute bottom-2 left-1/2 -translate-x-1/2 z-20"
          aria-label="Select Telangana district banner"
        >
          {DISTRICT_BANNERS.map((banner, idx) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              title={banner.label}
              aria-label={`Show ${banner.label} banner`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeIndex
                  ? 'w-5 bg-[#C18C26]'
                  : 'w-1.5 bg-[#FBF8F1]/60 hover:bg-[#FBF8F1]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
