import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import ComingSoon from '../components/ComingSoon';
import tnsconAbstractsPoster from '../assets/images/tnscon_abstracts_poster.jpg';
import tnsconCommitteePoster from '../assets/images/tnscon_committee_poster.jpg';
import aboutNeuroImg from '../assets/images/about_neuroscience.jpg';
import { galleryItems } from '../data/tnsData';

const imageMap = {
  tnscon_abstracts: tnsconAbstractsPoster,
  tnscon_committee: tnsconCommitteePoster,
  tnscon_poster: tnsconAbstractsPoster,
  about_neuro: aboutNeuroImg,
};

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  const categories = ['All', 'Conferences', 'Academic Events', 'Workshops & CME', 'Society Activities'];

  const filteredItems = galleryItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxItem(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="Gallery"
        description="Official photography and conference visual archive of the Telangana Neurosciences Society."
        path="/gallery"
      />

      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            Visual Archive
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            Society Gallery
          </h1>
          <p className="text-[#F7F2E8]/85 text-[15px] mt-3 max-w-2xl leading-relaxed">
            Highlights from Telangana Neurosciences Society conferences, academic gatherings, and CME programs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-10 relative z-10">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#393185] text-[#FBF8F1]'
                  : 'bg-[#FBF8F1] border border-[#E3DCCF] text-[#292638] hover:border-[#393185]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const imgSrc = item.imageKey ? imageMap[item.imageKey] : null;
              return (
                <div
                  key={item.id}
                  className="tns-surface overflow-hidden flex flex-col text-left"
                >
                  <div className="h-64 bg-[#F1EADB] border-b border-[#E3DCCF] overflow-hidden flex items-center justify-center">
                    {imgSrc && (
                      <button
                        type="button"
                        onClick={() => setLightboxItem({ ...item, imgSrc })}
                        className="w-full h-full cursor-zoom-in block bg-[#FBF8F1]"
                        aria-label={`View ${item.title}`}
                      >
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className={`w-full h-full transition-transform duration-300 ${
                            item.imageKey === 'tnscon_poster'
                              ? 'object-contain p-3 hover:scale-[1.02]'
                              : 'object-cover object-center hover:scale-[1.03]'
                          }`}
                          loading="lazy"
                        />
                      </button>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#C18C26]">
                        {item.category}
                      </span>
                      <h2 className="font-editorial text-[17px] font-bold text-[#393185] mt-1">
                        {item.title}
                      </h2>
                      <p className="text-xs text-[#666477] leading-relaxed mt-1.5">{item.caption}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <ComingSoon
          eyebrow="Photography & Media Archive"
          title={
            filteredItems.length > 0
              ? 'More Event Photography Coming Soon'
              : `${selectedCategory} Archive Coming Soon`
          }
          message="Verified photography from past TNS Annual Conferences, regional CME meetings, workshops, and General Body sessions is being compiled for this archive."
          actionLabel="Explore Upcoming Conference (TNSCON 2027)"
          actionTo="/events/tnscon-2027"
        />
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[200] bg-[#292638]/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
        >
          <div
            className="bg-[#FBF8F1] rounded-2xl border border-[#E3DCCF] max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E3DCCF]">
              <h3 className="font-editorial font-bold text-[#393185] text-base">
                {lightboxItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="p-1.5 rounded-lg hover:bg-[#F1EADB] text-[#393185] cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#F7F2E8] p-4 flex items-center justify-center max-h-[72vh]">
              <img
                src={lightboxItem.imgSrc}
                alt={lightboxItem.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <p className="px-5 py-3 text-xs text-[#666477] border-t border-[#E3DCCF] text-left">
              {lightboxItem.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
