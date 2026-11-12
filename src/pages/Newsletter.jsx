import React from 'react';
import SeoHead from '../components/SeoHead';
import ComingSoon from '../components/ComingSoon';

export default function Newsletter() {
  return (
    <div className="bg-transparent">
      <SeoHead
        title="TNS Newsletter"
        description="Official newsletter, circulars, and academic announcements from the Telangana Neurosciences Society (TNS)."
        path="/newsletter"
      />

      {/* Page Banner */}
      <section className="tns-page-banner border-b border-[#E3DCCF] bg-[#FAF6ED]/85 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
            Society Publications
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#393185] mt-2">
            TNS Newsletter
          </h1>
          <p className="text-[15.5px] text-[#666477] max-w-2xl mt-3 leading-relaxed">
            Official society circulars, scientific bulletins, and member communications from the
            Telangana Neurosciences Society.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <ComingSoon
            eyebrow="Upcoming Publication"
            title="Newsletter Issues Coming Soon"
            message="The editorial team is compiling upcoming issues and society circulars of the TNS Newsletter. Please check back soon for the inaugural digital edition."
            actionLabel="Explore Society Events & Announcements"
            actionTo="/events"
          />
        </div>
      </section>
    </div>
  );
}
