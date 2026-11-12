import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, Compass, Quote, Users } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import aboutNeuroImg from '../assets/images/about_neuroscience.jpg';
import {
  societyInfo,
  societyMessages,
  societyMissionVision,
  societyObjectives,
  committeeData,
} from '../data/tnsData';

export default function About() {
  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="About Us"
        description="Learn about the Telangana Neurosciences Society (TNS), its mission, vision, academic objectives, and founding heritage."
        path="/about"
      />

      {/* Page Header Banner */}
      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            About the Association
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            {societyInfo.name}
          </h1>
          <p className="text-[#F7F2E8]/85 text-[15px] mt-3 max-w-2xl leading-relaxed">
            {societyInfo.introSummary}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20 space-y-16 relative z-10">
        {/* Society Overview & Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-5"
          >
            <div className="tns-surface overflow-hidden">
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#E9E6F5]">
                <img
                  src={aboutNeuroImg}
                  alt="Telangana Neurosciences Society Grand Rounds"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-5 bg-[#FBF8F1] border-t border-[#E3DCCF]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                  {societyInfo.motto}
                </span>
                <p className="text-xs text-[#666477] mt-1">
                  Multidisciplinary collaboration across neurology, neurosurgery, and clinical research.
                </p>
              </div>
            </div>

            <div className="tns-surface p-5 space-y-3 border-l-4 border-l-[#C18C26]">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#C18C26]">
                Society Profile
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F2E8] border border-[#E3DCCF]">
                  <span className="block text-[#666477]">Registration</span>
                  <strong className="text-[#393185] font-semibold mt-0.5 block">
                    {societyInfo.registrationNumber}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F2E8] border border-[#E3DCCF]">
                  <span className="block text-[#666477]">Secretariat</span>
                  <strong className="text-[#393185] font-semibold mt-0.5 block">
                    {societyInfo.secretariat.city}
                  </strong>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C18C26]">
              Society Overview
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#393185]">
              Advancing Clinical Excellence &amp; Neurological Science
            </h2>
            {societyInfo.aboutOverview.map((paragraph, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-[#292638]/90">
                {paragraph}
              </p>
            ))}

            <ul className="space-y-2.5 pt-1">
              {societyInfo.aboutPillars.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#292638]">
                  <CheckCircle2 className="w-4 h-4 text-[#C18C26] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-xl bg-[#F1EADB] border border-[#E3DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#666477]">
              <div>
                <strong className="text-[#393185] uppercase tracking-wider block">
                  Registered Association ({societyInfo.registrationNumber})
                </strong>
                <span>Telangana State Medical Neuroscience Society · {societyInfo.secretariat.city}</span>
              </div>
              <Link
                to="/contact"
                className="font-semibold text-[#393185] hover:text-[#C18C26] shrink-0"
              >
                Secretariat &amp; Contact →
              </Link>
            </div>
          </div>
        </div>

        {/* President's & Secretary's Official Messages */}
        <section id="leadership-messages" className="text-left space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C18C26]">
              From the Leadership
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#393185] mt-1.5">
              Messages from the President &amp; Secretary
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {[societyMessages.president, societyMessages.secretary].map((msg, idx) => (
              <article
                key={msg.title}
                className={`tns-surface p-7 sm:p-8 border-t-4 flex flex-col justify-between ${
                  idx === 0 ? 'border-t-[#393185]' : 'border-t-[#C18C26]'
                }`}
              >
                <div>
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E3DCCF]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C18C26]">
                      {msg.designation}
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-[#393185] mt-1">
                      {msg.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#E9E6F5] text-[#393185] flex items-center justify-center shrink-0">
                    <Quote className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 text-[14px] text-[#292638]/90 leading-relaxed">
                  <p className="font-semibold text-[#393185]">{msg.salutation}</p>
                  {msg.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E3DCCF] flex items-center gap-3.5">
                  {msg.photoUrl && (
                    <img
                      src={msg.photoUrl}
                      alt={msg.author}
                      loading="lazy"
                      className="w-12 h-12 rounded-xl object-cover object-top border border-[#E3DCCF] border-b-2 border-b-[#C18C26] shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-[#666477]">{msg.signOff}</p>
                    <p className="font-editorial text-lg font-bold text-[#393185] mt-0.5">
                      {msg.author}
                    </p>
                    <p className="text-xs font-medium text-[#C18C26]">{msg.designation}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="tns-surface p-7 border-t-4 border-t-[#393185]">
            <div className="w-10 h-10 rounded-lg bg-[#E9E6F5] text-[#393185] flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#393185]">
              {societyMissionVision.vision.title}
            </h3>
            <p className="text-[14.5px] text-[#666477] leading-relaxed mt-3">
              {societyMissionVision.vision.description}
            </p>
          </div>

          <div className="tns-surface p-7 border-t-4 border-t-[#C18C26]">
            <div className="w-10 h-10 rounded-lg bg-[#F3E6C9] text-[#C18C26] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#393185]">
              {societyMissionVision.mission.title}
            </h3>
            <p className="text-[14.5px] text-[#666477] leading-relaxed mt-3">
              {societyMissionVision.mission.description}
            </p>
          </div>
        </div>

        {/* Objectives Table / Grid */}
        <div id="objectives" className="text-left scroll-mt-16">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C18C26]">
              Academic &amp; Clinical Mandate
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#393185] mt-1.5">
              Objectives of the Society
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {societyObjectives.map((obj) => (
              <div
                key={obj.code}
                className="p-6 rounded-2xl bg-[#FBF8F1] border border-[#E3DCCF] flex gap-4"
              >
                <span className="font-editorial text-xl font-bold text-[#C18C26] shrink-0">
                  {obj.code}
                </span>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#393185]">
                    {obj.title}
                  </h3>
                  <p className="text-[13.5px] text-[#666477] leading-relaxed mt-1.5">
                    {obj.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Members & Heritage Summary (Full Roster on /committee#founders) */}
        <div id="heritage" className="tns-surface p-7 sm:p-9 text-left scroll-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3DCCF]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                Society Heritage
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#393185] mt-1">
                Founding Patrons &amp; Governance
              </h2>
            </div>
            <Link
              to="/committee#founders"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#393185] hover:text-[#C18C26]"
            >
              <span>View Complete Leadership Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-[14.5px] text-[#292638]/90 leading-relaxed mt-5">
            Founded under the mentorship of esteemed senior neuroscientists across Telangana—including{' '}
            {committeeData.founderMembers.map((f, idx) => (
              <span key={f.name} className="font-semibold text-[#393185]">
                {f.name}
                {idx < committeeData.founderMembers.length - 1 ? ', ' : ''}
              </span>
            ))}
            —the Society upholds high ethical and academic standards across both clinical neurology
            and neurosurgery.
          </p>

          <div className="mt-7 pt-6 border-t border-[#E3DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-[#666477]">
              <Users className="w-5 h-5 text-[#393185] shrink-0" />
              <span>Interested in becoming a member of the Telangana Neurosciences Society?</span>
            </div>
            <Link
              to="/membership?tab=apply"
              className="tns-btn-primary text-xs shrink-0 inline-flex items-center gap-2"
            >
              <span>Apply for Membership</span>
              <ArrowRight className="w-4 h-4 text-[#B0CB1F]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
