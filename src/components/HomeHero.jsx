import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import tnsLogo from '../assets/images/tns-logo.png';

const BrainHeroCanvas = lazy(() => import('./brain/BrainHeroCanvas'));

function BrainSuspenseLoader() {
  return (
    <div
      className="w-full h-[360px] sm:h-[440px] lg:h-[560px] flex flex-col items-center justify-center gap-3"
      aria-label="Loading 3D Anatomical Brain"
    >
      <div className="w-10 h-10 rounded-full border-2 border-[#393185]/20 border-t-[#393185] border-r-[#C18C26] animate-spin" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666477]">
        Initializing 3D Brain
      </span>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 },
  }),
};

export default function HomeHero({ onOpenConferencePopup }) {
  return (
    <section className="relative overflow-hidden bg-[#F7F2E8]/45 pt-8 lg:pt-12 pb-12 lg:pb-16 lg:min-h-[560px] flex items-center border-b border-[#E3DCCF]">
      {/* Subtle architectural warm ivory backdrop accents */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 78% 45%, rgba(57, 49, 133, 0.06) 0%, transparent 55%), radial-gradient(circle at 12% 20%, rgba(193, 140, 38, 0.05) 0%, transparent 45%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT SIDE: Official Society Crest, Heading, Mission & CTAs */}
          <motion.div
            className="lg:col-span-6 flex flex-col items-start text-left"
            initial="hidden"
            animate="show"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-3 mb-5"
            >
              <img
                src={tnsLogo}
                alt="Telangana Neurosciences Society Crest"
                className="h-12 sm:h-16 w-auto object-contain shrink-0"
              />
              <div className="h-7 sm:h-8 w-px bg-[#E3DCCF] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#393185]">
                  Official Medical Society
                </span>
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#C18C26] flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#B0CB1F] tns-live-dot shrink-0" />
                  In Service of Neurosciences
                </span>
              </div>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-editorial text-[1.8rem] min-[375px]:text-[2.1rem] sm:text-[2.85rem] lg:text-[3.35rem] font-bold text-[#393185] leading-[1.1] tracking-tight"
            >
              Telangana Neurosciences Society
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-3.5 sm:mt-4 text-[15.5px] sm:text-[19px] font-semibold text-[#292638] leading-snug max-w-xl"
            >
              Advancing Neuroscience Through Knowledge, Collaboration &amp; Clinical Excellence.
            </motion.p>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="mt-3 sm:mt-3.5 text-[14px] sm:text-[15.5px] text-[#666477] leading-relaxed max-w-xl"
            >
              A professional association dedicated to bringing together neurologists, neurosurgeons,
              researchers, and medical professionals across Telangana to advance neuroscience
              education, research, and clinical practice.
            </motion.p>

            <motion.div
              custom={4}
              variants={fadeUp}
              className="w-full flex flex-col min-[420px]:flex-row flex-wrap items-stretch min-[420px]:items-center gap-3 sm:gap-3.5 mt-6 sm:mt-7"
            >
              <Link
                to="/membership?tab=apply"
                className="tns-btn-primary inline-flex items-center justify-center gap-2 text-[14px] min-h-[44px]"
              >
                <span>Become a Member</span>
                <ArrowRight className="w-4 h-4 text-[#B0CB1F]" />
              </Link>
              <Link
                to="/events"
                className="tns-btn-secondary inline-flex items-center justify-center gap-2 text-[14px] min-h-[44px]"
              >
                <Calendar className="w-4 h-4 text-[#C18C26]" />
                <span>Explore Events</span>
              </Link>
              {onOpenConferencePopup && (
                <button
                  type="button"
                  onClick={onOpenConferencePopup}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#C18C26]/40 bg-[#FAF6ED] hover:bg-[#393185]/5 text-[#393185] text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C18C26]" />
                  <span>TNSCON 2027</span>
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: Realistic 3D Anatomical Human Brain */}
          <div className="lg:col-span-6 w-full max-w-full flex items-center justify-center overflow-hidden">
            <Suspense fallback={<BrainSuspenseLoader />}>
              <BrainHeroCanvas />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
