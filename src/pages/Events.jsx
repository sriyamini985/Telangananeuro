import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import ComingSoon from '../components/ComingSoon';
import tnsconPosterImg from '../assets/images/tnscon_abstracts_poster.jpg';
import { eventsData, newsAnnouncements } from '../data/tnsData';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'news' ? 'news' : 'events';
  const initialFilter = searchParams.get('filter') || 'All';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [categoryFilter, setCategoryFilter] = useState(initialFilter);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const filterParam = searchParams.get('filter');
    if (tabParam === 'news') setActiveTab('news');
    else setActiveTab('events');
    if (filterParam) setCategoryFilter(filterParam);
  }, [searchParams]);

  const categories = ['All', 'Annual Conference', 'CME Program', 'Workshop', 'Past Events'];

  const filteredEvents = eventsData.filter((ev) => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'CME') {
      return ev.category === 'CME Program' || ev.category === 'Workshop';
    }
    return ev.category === categoryFilter;
  });

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'news' ? { tab: 'news' } : {});
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="Events & News"
        description="Upcoming conferences, CME programs, workshops, and announcements from the Telangana Neurosciences Society, including TNSCON 2027."
        path="/events"
      />

      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            Academic Calendar
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            Events &amp; Announcements
          </h1>
          <p className="text-[#F7F2E8]/85 text-[15px] mt-3 max-w-2xl leading-relaxed">
            Annual state conferences, continuing medical education programs, workshops, and official Society notices.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-10 relative z-10">
        {/* Top Tab Switcher */}
        <div className="flex border-b border-[#E3DCCF] gap-4">
          <button
            type="button"
            onClick={() => switchTab('events')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'border-[#393185] text-[#393185]'
                : 'border-transparent text-[#666477] hover:text-[#393185]'
            }`}
          >
            Conferences &amp; Events
          </button>
          <button
            type="button"
            onClick={() => switchTab('news')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'border-[#393185] text-[#393185]'
                : 'border-transparent text-[#666477] hover:text-[#393185]'
            }`}
          >
            News &amp; Announcements
          </button>
        </div>

        {activeTab === 'events' ? (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#393185] text-[#FBF8F1]'
                      : 'bg-[#FBF8F1] border border-[#E3DCCF] text-[#292638] hover:border-[#393185]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Events List */}
            <div className="space-y-6">
              {filteredEvents.map((ev) =>
                ev.isComingSoon ? (
                  <div key={ev.slug} className="tns-surface p-6 sm:p-8 text-left space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#E9E6F5] text-[#393185]">
                          {ev.category}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#F1EADB] text-[#C18C26]">
                          Coming Soon
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#666477]">{ev.location}</span>
                    </div>
                    <ComingSoon
                      compact
                      eyebrow={ev.category}
                      title={ev.title}
                      message={ev.summary}
                      actionLabel="Contact TNS Secretariat for Academic Enquiries"
                      actionTo="/contact"
                    />
                  </div>
                ) : (
                  <article
                    key={ev.slug}
                    className={`tns-surface p-6 sm:p-8 text-left ${
                      ev.featured ? 'border-l-4 border-l-[#C18C26]' : ''
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className={ev.featured ? 'lg:col-span-8 space-y-3' : 'lg:col-span-12 space-y-3'}>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#E9E6F5] text-[#393185]">
                            {ev.category}
                          </span>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                              ev.status === 'Upcoming'
                                ? 'bg-[#EDF3CE] text-[#292638]'
                                : 'bg-[#F1EADB] text-[#666477]'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>

                        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#393185]">
                          {ev.title}
                        </h2>

                        <div className="flex flex-wrap gap-5 text-[13.5px] text-[#292638]">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#C18C26]" />
                            <span>{ev.dates}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#C18C26]" />
                            <span>{ev.location}</span>
                          </span>
                        </div>

                        <p className="text-[14px] text-[#666477] leading-relaxed">{ev.summary}</p>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <Link
                            to={`/events/${ev.slug}`}
                            className="tns-btn-primary text-xs inline-flex items-center gap-2"
                          >
                            <span>Event Details</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#B0CB1F]" />
                          </Link>
                          {ev.externalUrl && (
                            <a
                              href={ev.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tns-btn-secondary text-xs inline-flex items-center gap-1.5"
                            >
                              <span>Official Conference Portal</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {ev.featured && (
                        <div className="lg:col-span-4 flex justify-center">
                          <div className="bg-[#F7F2E8] p-2.5 rounded-2xl border border-[#E3DCCF] shadow-sm max-w-[260px] w-full">
                            <img
                              src={tnsconPosterImg}
                              alt={ev.shortTitle}
                              className="w-full rounded-xl object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="divide-y divide-[#E3DCCF] bg-[#FBF8F1] border border-[#E3DCCF] rounded-2xl overflow-hidden text-left">
              {newsAnnouncements.map((news) => (
                <article key={news.id} className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#E9E6F5] text-[#393185]">
                        {news.tag}
                      </span>
                      <span className="text-[#666477] inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#C18C26]" />
                        {news.date}
                      </span>
                    </div>
                    <h2 className="font-editorial text-xl font-bold text-[#393185]">
                      {news.title}
                    </h2>
                    <p className="text-sm text-[#666477] leading-relaxed">{news.summary}</p>
                  </div>
                  <Link
                    to={news.link}
                    className="tns-btn-secondary text-xs shrink-0 inline-flex items-center gap-1.5 w-fit"
                  >
                    <span>{news.linkLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              ))}
            </div>

            <ComingSoon
              compact
              eyebrow="TNS Circulars & Bulletins"
              title="Additional Regional CME & Society Notices Coming Soon"
              message="Further regional CME calendars, fellowship circulars, and official updates will be posted here as approved by the TNS Secretariat."
              actionLabel="View TNS Newsletter Status"
              actionTo="/newsletter"
            />
          </div>
        )}
      </div>
    </div>
  );
}
