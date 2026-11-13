import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Calendar, ExternalLink, MapPin, X, ArrowRight } from 'lucide-react';
import tnsconPoster from '../assets/images/tnscon_abstracts_poster.jpg';
import tnsconLogo from '../assets/images/tnscon_logo.png';

/**
 * TNSCON 2027 Conference Invitation Popup.
 * Appears once per session on initial homepage load or whenever opened manually
 * via a header/hero trigger. Respects ESC key closure and reduced-motion preferences.
 */
export default function TnsconPopup({ isOpen, onClose }) {
  const closeBtnRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tnscon-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-3 sm:p-6 bg-[#1C1635]/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tnscon-popup-title"
        >
          <motion.div
            key="tnscon-card"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-[#F7F2E8] border border-[#C18C26]/40 shadow-2xl my-auto max-h-[calc(100dvh-24px)] overflow-y-auto"
          >
            {/* Top TNS tricolor accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#393185] via-[#C18C26] to-[#B0CB1F]" />

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close TNSCON 2027 invitation"
              className="absolute top-3 right-3 z-20 min-w-[40px] min-h-[40px] rounded-full bg-white/95 hover:bg-white border border-[#E3DCCF] text-[#292638] hover:text-[#393185] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Visual Conference Poster Column */}
              <div className="md:col-span-5 bg-[#2A2368] flex flex-col justify-center gap-3.5 p-4 sm:p-5 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 pr-10 md:pr-0 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[10.5px] font-bold uppercase tracking-wider text-white">
                    <span className="w-2 h-2 rounded-full bg-[#B0CB1F] animate-pulse" />
                    Call for Abstracts
                  </span>
                  <img
                    src={tnsconLogo}
                    alt="TNSCON 2027 Logo"
                    className="h-9 w-auto object-contain rounded bg-white/95 px-1.5 py-0.5"
                  />
                </div>

                <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-full mx-auto rounded-xl overflow-hidden border border-white/25 shadow-xl bg-[#FBF8F1] p-1 relative z-10">
                  <img
                    src={tnsconPoster}
                    alt="TNSCON 2027 — Call for Abstracts Official Flyer"
                    className="w-full h-auto aspect-square rounded-lg object-contain block"
                  />
                </div>
              </div>

              {/* Editorial Conference Details & Primary CTA */}
              <div className="md:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                  11th Annual Conference of Telangana Neurosciences Society
                </span>

                <h2
                  id="tnscon-popup-title"
                  className="font-editorial text-2xl sm:text-3xl font-bold text-[#393185] mt-1.5 leading-tight"
                >
                  TNSCON 2027
                </h2>

                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF3CE] border border-[#B0CB1F]/40 text-[#292638] text-xs font-bold w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#C18C26] animate-pulse" />
                  <span>Call for Abstracts Open • Deadline: 31 Jan 2027</span>
                </div>

                <div className="mt-4 space-y-2.5 bg-white/90 border border-[#E3DCCF] rounded-xl p-4">
                  <div className="flex items-start gap-2.5 text-[13.5px]">
                    <Calendar className="w-4 h-4 text-[#C18C26] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#393185]">Dates: </span>
                      <span className="text-[#292638] font-medium">12–14 March 2027</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-[13.5px]">
                    <MapPin className="w-4 h-4 text-[#C18C26] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#393185]">Venue: </span>
                      <span className="text-[#292638] font-medium">
                        Conference Hall, Rajiv Gandhi Terminal, Begumpet Airport, Hyderabad
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[14px] text-[#555365] leading-relaxed mt-4">
                  The Organising Committee cordially invites researchers, clinicians, neurologists,
                  neurosurgeons, and postgraduates to submit original research in <strong>Award Paper</strong>,{' '}
                  <strong>Free Paper</strong>, or <strong>Poster Presentation</strong> categories.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="https://www.tnscon2027hyd.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tns-btn-primary inline-flex items-center gap-2 text-[14px]"
                  >
                    <span>Visit Conference (www.tnscon2027hyd.com)</span>
                    <ArrowRight className="w-4 h-4 text-[#B0CB1F]" />
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <Link
                    to="/events/tnscon-2027"
                    onClick={onClose}
                    className="tns-btn-secondary text-[13.5px] py-2.5 px-4"
                  >
                    Conference Overview
                  </Link>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[13px] font-medium text-[#666477] hover:text-[#393185] px-2 py-2 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
