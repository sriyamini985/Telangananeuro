import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import SeoHead from '../components/SeoHead';
import HomeHero from '../components/HomeHero';
import aboutNeuroImg from '../assets/images/about_neuroscience.jpg';
import tnsconAbstractsPoster from '../assets/images/tnscon_abstracts_poster.jpg';
import tnsconCommitteePoster from '../assets/images/tnscon_committee_poster.jpg';
import {
  societyInfo,
  societyMessages,
  eventsData,
  newsAnnouncements,
} from '../data/tnsData';

function useCountdown(targetISO) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetISO) - new Date());
      setTime({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  return time;
}

export default function Home({ onOpenConferencePopup }) {
  const [activePosterTab, setActivePosterTab] = useState('abstracts');
  const flagshipEvent = eventsData.find((e) => e.featured) || eventsData[0];
  const countdown = useCountdown(flagshipEvent.startDateISO);
  const topNotice = newsAnnouncements[0];

  return (
    <div className="bg-transparent text-[#292638]">
      <SeoHead
        title=""
        description="Official association website of the Telangana Neurosciences Society (TNS). Advancing neurology, neurosurgery, research, and clinical excellence across Telangana."
        path="/"
      />

      {/* Section 1: Signature Hero with Realistic 3D Human Brain */}
      <HomeHero onOpenConferencePopup={onOpenConferencePopup} />

      {/* Section 2: Society at a Glance (Concise Summary + Cross-Links) */}
      <section className="py-16 lg:py-20 bg-[#F1EADB]/72 border-b border-[#E3DCCF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 text-left"
            >
              <div className="tns-surface overflow-hidden">
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#E9E6F5]">
                  <img
                    src={aboutNeuroImg}
                    alt="Neurosciences academic symposium and clinical grand rounds"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 border-t border-[#E3DCCF] bg-[#FBF8F1] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C18C26]">
                      Official State Society
                    </span>
                    <p className="text-[13px] text-[#666477] mt-0.5">
                      {societyInfo.registrationNumber} · {societyInfo.secretariat.city}, Telangana
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EDF3CE] text-[#292638] shrink-0">
                    {societyInfo.shortName}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="lg:col-span-7 flex flex-col gap-5 text-left"
            >
              <div>
                <span className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#C18C26]">
                  {societyInfo.motto}
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#393185] mt-2 leading-tight">
                  Uniting Neurologists, Neurosurgeons &amp; Researchers Across Telangana
                </h2>
              </div>

              <p className="text-[15px] text-[#292638]/90 leading-relaxed">
                {societyInfo.introSummary} Through annual conferences, continuing medical education
                (CME), and mentorship, TNS promotes collaborative clinical standards and academic
                dialogue across the state.
              </p>

              {/* Current Society Office Bearer Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#FBF8F1] border border-[#E3DCCF] flex items-center gap-3.5">
                  <img
                    src={societyMessages.president.photoUrl}
                    alt={societyMessages.president.author}
                    loading="lazy"
                    className="w-12 h-12 rounded-xl object-cover object-top border border-[#E3DCCF] border-b-2 border-b-[#C18C26] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="block text-[10.5px] uppercase tracking-wider text-[#C18C26] font-bold">
                      President
                    </span>
                    <strong className="font-editorial text-[16px] text-[#393185] block mt-0.5">
                      {societyMessages.president.author}
                    </strong>
                    <span className="text-xs text-[#666477]">Neurosurgery Leadership</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#FBF8F1] border border-[#E3DCCF] flex items-center gap-3.5">
                  <img
                    src={societyMessages.secretary.photoUrl}
                    alt={societyMessages.secretary.author}
                    loading="lazy"
                    className="w-12 h-12 rounded-xl object-cover object-top border border-[#E3DCCF] border-b-2 border-b-[#C18C26] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="block text-[10.5px] uppercase tracking-wider text-[#C18C26] font-bold">
                      General Secretary
                    </span>
                    <strong className="font-editorial text-[16px] text-[#393185] block mt-0.5">
                      {societyMessages.secretary.author}
                    </strong>
                    <span className="text-xs text-[#666477]">Secretariat &amp; Administration</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#393185] hover:text-[#C18C26] transition-colors border-b border-[#C18C26] pb-1"
                >
                  <span>Vision, Mission &amp; Objectives</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/committee"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#393185] hover:text-[#C18C26] transition-colors border-b border-transparent hover:border-[#C18C26] pb-1"
                >
                  <span>Executive Committee Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Upcoming Flagship Conference — TNSCON 2027 */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#393185] text-[#FBF8F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 text-left">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B0CB1F]">
                <span className="w-2 h-2 rounded-full bg-[#B0CB1F]" />
                Upcoming Annual Conference
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#FBF8F1] mt-2 leading-tight">
                {flagshipEvent.title}
              </h2>
              <p className="text-[14px] sm:text-[14.5px] text-[#F7F2E8]/85 leading-relaxed mt-3.5 sm:mt-4 max-w-2xl">
                Join neurologists, neurosurgeons, researchers, and medical professionals for three
                days of scientific learning, academic discussions, and collaboration.
              </p>

              <div className="flex flex-wrap gap-4 sm:gap-5 mt-5 text-[13px] sm:text-[13.5px] text-[#F7F2E8]/90">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C18C26] shrink-0" />
                  <span>{flagshipEvent.dates}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C18C26] shrink-0" />
                  <span>{flagshipEvent.location}</span>
                </span>
              </div>

              {/* Countdown Grid */}
              <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-2.5 sm:gap-3 max-w-md mt-6 sm:mt-7">
                {[
                  { val: countdown.d, label: 'Days' },
                  { val: countdown.h, label: 'Hours' },
                  { val: countdown.m, label: 'Minutes' },
                  { val: countdown.s, label: 'Seconds' },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="bg-[#2D276A] border border-[#FBF8F1]/15 rounded-xl py-2.5 sm:py-3 px-2 text-center"
                  >
                    <span className="block text-xl sm:text-2xl font-bold text-[#FBF8F1]">
                      {String(unit.val).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-[#C18C26] mt-1 font-semibold">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3.5 mt-7">
                <a
                  href={flagshipEvent.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#C18C26] hover:bg-[#AE7C1E] text-[#FBF8F1] font-semibold text-[13.5px] px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <span>Visit Conference Website</span>
                  <ArrowRight className="w-4 h-4" />
                  <ExternalLink className="w-3.5 h-3.5 opacity-85" />
                </a>
                <Link
                  to="/events/tnscon-2027"
                  className="border border-[#FBF8F1]/35 hover:bg-[#FBF8F1]/10 text-[#FBF8F1] font-semibold text-[13.5px] px-5 py-3 rounded-lg transition-colors"
                >
                  Schedule &amp; Tracks
                </Link>
                {onOpenConferencePopup && (
                  <button
                    type="button"
                    onClick={onOpenConferencePopup}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#B0CB1F] hover:text-white transition-colors px-2 py-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Invitation</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#2D276A] border border-[#FBF8F1]/15 mb-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePosterTab('abstracts')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePosterTab === 'abstracts'
                      ? 'bg-[#B0CB1F] text-[#292638] font-bold shadow-sm'
                      : 'text-[#FBF8F1]/80 hover:text-white'
                  }`}
                >
                  Call for Abstracts
                </button>
                <button
                  type="button"
                  onClick={() => setActivePosterTab('committee')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activePosterTab === 'committee'
                      ? 'bg-[#B0CB1F] text-[#292638] font-bold shadow-sm'
                      : 'text-[#FBF8F1]/80 hover:text-white'
                  }`}
                >
                  Committee Flyer
                </button>
              </div>

              <div className="bg-[#FBF8F1] p-3 rounded-2xl border border-[#E3DCCF] shadow-xl max-w-sm w-full">
                <img
                  src={activePosterTab === 'abstracts' ? tnsconAbstractsPoster : tnsconCommitteePoster}
                  alt={
                    activePosterTab === 'abstracts'
                      ? 'TNSCON 2027 Call for Abstracts Flyer'
                      : 'TNSCON 2027 Organizing & Scientific Committee Announcement'
                  }
                  className="w-full h-auto rounded-xl object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Key Society Pathways & Latest Notice */}
      <section className="py-16 lg:py-20 bg-[#F7F2E8]/55">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="tns-surface p-6 flex flex-col justify-between gap-4 border-t-4 border-t-[#393185]">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#E9E6F5] text-[#393185] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#393185]">
                  Membership Portal
                </h3>
                <p className="text-[13.5px] text-[#666477] leading-relaxed mt-2">
                  Explore Life Member and Associate/Trainee Member categories, eligibility criteria,
                  and submit applications directly to the Secretariat.
                </p>
              </div>
              <Link
                to="/membership"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#393185] hover:text-[#C18C26]"
              >
                <span>Eligibility &amp; Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="tns-surface p-6 flex flex-col justify-between gap-4 border-t-4 border-t-[#C18C26]">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#F3E6C9] text-[#C18C26] flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#393185]">
                  Academic Events &amp; Newsletter
                </h3>
                <p className="text-[13.5px] text-[#666477] leading-relaxed mt-2">
                  Stay informed on TNSCON 2027 dates, upcoming CME programs, surgical workshops,
                  and upcoming TNS Newsletter digital releases.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#393185] hover:text-[#C18C26]"
                >
                  <span>Events Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/newsletter"
                  className="text-[13px] font-semibold text-[#666477] hover:text-[#393185]"
                >
                  Newsletter →
                </Link>
              </div>
            </div>

            <div className="tns-surface p-6 flex flex-col justify-between gap-4 border-t-4 border-t-[#6E8210]">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#EDF3CE] text-[#292638] flex items-center justify-center mb-4">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#393185]">
                  Gallery &amp; Secretariat
                </h3>
                <p className="text-[13.5px] text-[#666477] leading-relaxed mt-2">
                  View official conference posters, archive updates, or reach our Kachiguda,
                  Hyderabad Secretariat desk for formal enquiries.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#393185] hover:text-[#C18C26]"
                >
                  <span>Society Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/contact"
                  className="text-[13px] font-semibold text-[#666477] hover:text-[#393185]"
                >
                  Contact Office →
                </Link>
              </div>
            </div>
          </div>

          {/* Highlight Notice & Compact Secretariat Strip */}
          {topNotice && (
            <div className="tns-surface p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-l-4 border-l-[#393185] text-left">
              <div className="space-y-1.5 max-w-2xl">
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#C18C26]">
                  Latest Notice · {topNotice.date}
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#393185]">
                  {topNotice.title}
                </h3>
                <p className="text-[13.5px] text-[#666477]">{topNotice.summary}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <div className="text-xs text-[#666477] space-y-1 border-r border-[#E3DCCF] pr-4 hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C18C26]" />
                    <span>{societyInfo.secretariat.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C18C26]" />
                    <span>{societyInfo.secretariat.email}</span>
                  </div>
                </div>
                <Link
                  to={topNotice.link}
                  className="tns-btn-secondary text-[13px] inline-flex items-center gap-2"
                >
                  <span>{topNotice.linkLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
