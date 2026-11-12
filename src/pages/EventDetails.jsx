import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import tnsconPosterImg from '../assets/images/tnscon_2027_poster.jpg';
import { eventsData, societyInfo } from '../data/tnsData';

export default function EventDetails() {
  const { slug } = useParams();
  const event = eventsData.find((e) => e.slug === slug) || eventsData[0];

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title={event.shortTitle}
        description={event.summary}
        path={`/events/${event.slug}`}
      />

      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7F2E8]/80 hover:text-[#B0CB1F] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            {event.category}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-4xl">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-6 mt-5 text-sm text-[#F7F2E8]/90">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C18C26]" />
              <span>{event.dates}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C18C26]" />
              <span>{event.location}</span>
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-12 relative z-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="tns-surface p-7 space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#393185]">
                Event Overview
              </h2>
              <p className="text-[15px] text-[#292638]/90 leading-relaxed">{event.summary}</p>
              {event.externalUrl && (
                <div className="pt-2">
                  <a
                    href={event.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tns-btn-primary inline-flex items-center gap-2 text-xs"
                  >
                    <span>Visit Official TNSCON 2027 Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#B0CB1F]" />
                  </a>
                </div>
              )}
            </div>

            {event.tracks && (
              <div className="tns-surface p-7">
                <h2 className="font-editorial text-2xl font-bold text-[#393185] mb-4">
                  Scientific Focus Areas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {event.tracks.map((track) => (
                    <div
                      key={track}
                      className="p-4 rounded-xl bg-[#F7F2E8] border border-[#E3DCCF] flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#393185] shrink-0" />
                      <span className="text-sm font-semibold text-[#292638]">{track}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.importantDates && (
              <div className="tns-surface overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#E3DCCF]">
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#393185]">
                    Important Dates &amp; Milestones
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[440px] text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#F1EADB] text-[#393185] text-xs uppercase tracking-wider border-b border-[#E3DCCF]">
                        <th className="py-3 px-4 sm:px-6 font-bold">Date</th>
                        <th className="py-3 px-4 sm:px-6 font-bold">Milestone</th>
                        <th className="py-3 px-4 sm:px-6 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3DCCF]">
                      {event.importantDates.map((d) => (
                        <tr key={d.label}>
                          <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#393185] whitespace-nowrap">{d.date}</td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#292638]">{d.label}</td>
                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EDF3CE] text-[#292638]">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {event.featured && (
              <div className="tns-surface p-4">
                <img
                  src={tnsconPosterImg}
                  alt={event.shortTitle}
                  className="w-full rounded-xl object-contain"
                />
              </div>
            )}

            {event.leadership && (
              <div className="tns-surface p-6 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                  Organizing Leadership
                </span>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <strong className="text-[#393185] block">Organising Chairman</strong>
                    <span className="text-[#666477]">{event.leadership.organizingChairman}</span>
                  </div>
                  <div>
                    <strong className="text-[#393185] block">Organising Secretary</strong>
                    <span className="text-[#666477]">{event.leadership.organizingSecretary}</span>
                  </div>
                  <div>
                    <strong className="text-[#393185] block">Scientific Committee</strong>
                    <span className="text-[#666477] block">
                      Neurosurgery: {event.leadership.scientificNeurosurgery}
                    </span>
                    <span className="text-[#666477] block">
                      Neurology: {event.leadership.scientificNeurology}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="tns-surface p-6 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                Secretariat Contact
              </span>
              <p className="text-[#292638] font-medium">{societyInfo.secretariat.fullAddress}</p>
              <p className="text-[#666477]">{societyInfo.secretariat.phone}</p>
              <p className="text-[#393185] font-semibold">{societyInfo.secretariat.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
