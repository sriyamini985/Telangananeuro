import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ExternalLink } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    to: '/',
    matchPaths: ['/'],
  },
  {
    key: 'about',
    label: 'About Us',
    to: '/about',
    matchPaths: ['/about'],
    children: [
      { label: 'TNS History & Overview', to: '/about' },
      { label: 'President Message', to: '/about#leadership-messages' },
      { label: 'Secretary Message', to: '/about#leadership-messages' },
      { label: 'Constitution and Objectives', to: '/about#objectives' },
      { label: 'Founders & Heritage', to: '/about#heritage' },
    ],
  },
  {
    key: 'members',
    label: 'Members',
    to: '/membership',
    matchPaths: ['/membership', '/know-your-details'],
    children: [
      { label: 'Benefits of Membership', to: '/membership?tab=benefits' },
      { label: 'Become a Member', to: '/membership?tab=apply' },
      { label: 'Eligibility & Categories', to: '/membership?tab=eligibility' },
      { label: 'Know Your Membership Details', to: '/know-your-details' },
    ],
  },
  {
    key: 'committee',
    label: 'Executive Committee',
    to: '/committee',
    matchPaths: ['/committee'],
    children: [
      { label: 'Office Bearers', to: '/committee' },
      { label: 'Past Presidents', to: '/committee#past-presidents' },
      { label: 'Executive Committee Members', to: '/committee#executive' },
      { label: 'Advisors & Founder Members', to: '/committee#founders' },
    ],
  },
  {
    key: 'bidding',
    label: 'Bidding',
    to: '/contact?subject=Conference+Bidding+(TNSCON)',
    matchPaths: [],
    isHighlighted: true,
  },
  {
    key: 'events',
    label: 'Events',
    to: '/events',
    matchPaths: ['/events'],
    children: [
      { label: 'Upcoming Conference (TNSCON 2027)', to: '/events/tnscon-2027' },
      { label: 'Conference Website (tnscon2027hyd.com)', to: 'https://www.tnscon2027hyd.com/', external: true },
      { label: 'Past Conference', to: '/events?filter=Past' },
      { label: 'Webinar & Symposia', to: '/events' },
      { label: 'Workshop & CME', to: '/events?filter=Workshop' },
    ],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    to: '/gallery',
    matchPaths: ['/gallery'],
    children: [
      { label: 'TNSCON 2027 Archive', to: '/gallery' },
      { label: 'Academic Events', to: '/gallery' },
      { label: 'Workshops & CME', to: '/gallery' },
      { label: 'Society Activities', to: '/gallery' },
    ],
  },
  {
    key: 'newsletter',
    label: 'TNS Newsletter',
    to: '/newsletter',
    matchPaths: ['/newsletter'],
    children: [
      { label: 'Upcoming Digital Editions', to: '/newsletter' },
      { label: 'Society Announcements', to: '/events?tab=news' },
    ],
  },
  {
    key: 'login',
    label: 'Member Login',
    to: '/admin',
    matchPaths: ['/admin'],
  },
  {
    key: 'contact',
    label: 'Contact Us',
    to: '/contact',
    matchPaths: ['/contact'],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [location]);

  // Lock background page scrolling when the mobile drawer is open and allow Escape to close
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const isItemActive = (item) => {
    if (!item.matchPaths || item.matchPaths.length === 0) return false;
    return item.matchPaths.some((p) =>
      p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
    );
  };

  return (
    <header
      className={`sticky top-0 left-0 w-full z-[100] transition-shadow duration-300 ${
        isScrolled
          ? 'shadow-[0_6px_24px_rgba(41,38,56,0.22)]'
          : 'shadow-[0_2px_10px_rgba(41,38,56,0.12)]'
      }`}
    >
      {/* Main Full-Width Society Purple Navigation Bar directly below Top Banner */}
      <div className="w-full bg-[#393185] border-y border-[#C18C26]/45 text-[#FBF8F1]">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-5">
          {/* Desktop Horizontal Menu */}
          <nav
            className="hidden xl:flex items-center justify-center gap-0.5 2xl:gap-1 min-h-[50px]"
            aria-label="Primary Society Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const active = isItemActive(item);
              const isDropdownOpen = openDropdown === item.key;

              return (
                <div
                  key={item.key}
                  className="relative flex items-center"
                  onMouseEnter={() => hasChildren && setOpenDropdown(item.key)}
                  onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                >
                  <Link
                    to={item.to}
                    className={`relative inline-flex items-center gap-1 px-2.5 xl:px-3.5 py-3 text-[12.5px] xl:text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                      item.isHighlighted
                        ? 'my-1.5 py-1.5 rounded-lg bg-[#C18C26] hover:bg-[#D59E34] text-[#292638] font-bold shadow-xs'
                        : active
                        ? 'text-[#B0CB1F]'
                        : 'text-[#FBF8F1] hover:text-[#B0CB1F]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                    {active && !item.isHighlighted && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-[#C18C26] rounded-full" />
                    )}
                  </Link>

                  {hasChildren && (
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-0 top-full w-60 bg-[#FBF8F1] text-[#292638] rounded-b-xl shadow-xl border border-[#E3DCCF] border-t-2 border-t-[#C18C26] py-1.5 flex flex-col z-50 text-left"
                        >
                          {item.children.map((sub) =>
                            sub.external ? (
                              <a
                                key={sub.label}
                                href={sub.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpenDropdown(null)}
                                className="px-4 py-2.5 text-[13px] font-medium text-[#292638] hover:bg-[#E9E6F5] hover:text-[#393185] transition-colors border-b border-[#E3DCCF]/50 last:border-b-0 flex items-center justify-between"
                              >
                                <span>{sub.label}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#C18C26]" />
                              </a>
                            ) : (
                              <Link
                                key={sub.label}
                                to={sub.to}
                                onClick={() => setOpenDropdown(null)}
                                className="px-4 py-2.5 text-[13px] font-medium text-[#292638] hover:bg-[#E9E6F5] hover:text-[#393185] transition-colors border-b border-[#E3DCCF]/50 last:border-b-0"
                              >
                                {sub.label}
                              </Link>
                            )
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile / Tablet Sticky Bar Header */}
          <div className="flex xl:hidden items-center justify-between gap-2 py-2 sm:py-2.5">
            <Link to="/" className="inline-flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="shrink-0">
                <BrandLogo
                  variant="header"
                  showWordmark={false}
                  to=""
                  className="[&_img]:h-8 min-[380px]:[&_img]:h-9"
                />
              </div>
              <div className="flex flex-col text-left leading-tight min-w-0">
                <span className="font-editorial text-[12.5px] min-[375px]:text-[13.5px] sm:text-[15px] font-bold text-[#FBF8F1] truncate">
                  Telangana Neurosciences Society
                </span>
                <span className="text-[9px] min-[375px]:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#C18C26] truncate">
                  Regd. No: 793 of 2016
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-[#2D276A] hover:bg-[#C18C26] hover:text-[#292638] text-[#FBF8F1] transition-colors cursor-pointer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="xl:hidden fixed inset-x-0 bottom-0 top-[56px] bg-[#292638]/40 backdrop-blur-[1px] z-40"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="xl:hidden relative z-50 w-full bg-[#FBF8F1] text-[#292638] border-b border-[#E3DCCF] shadow-xl overflow-y-auto overscroll-contain max-h-[calc(100dvh-64px)]"
            >
              <div className="px-4 sm:px-6 py-3.5 flex flex-col gap-1 text-left">
                {NAV_ITEMS.map((item) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const expanded = mobileExpanded === item.key;

                  if (!hasChildren) {
                    return (
                      <Link
                        key={item.key}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`min-h-[44px] flex items-center px-3 py-2.5 rounded-lg text-[14px] font-semibold border-b border-[#E3DCCF]/70 ${
                          item.isHighlighted
                            ? 'bg-[#C18C26] text-[#292638] font-bold my-1.5 justify-center'
                            : isItemActive(item)
                            ? 'text-[#393185] bg-[#E9E6F5]/60'
                            : 'text-[#292638] active:bg-[#F1EADB]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.key} className="border-b border-[#E3DCCF]/70">
                      <div className="flex items-center justify-between gap-2 pl-3 pr-1 py-1">
                        <Link
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex-1 min-h-[44px] flex items-center text-[14px] font-semibold ${
                            isItemActive(item) ? 'text-[#393185]' : 'text-[#292638]'
                          }`}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileExpanded(expanded ? null : item.key)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#393185] hover:bg-[#E9E6F5]/70 cursor-pointer"
                          aria-label={`Toggle ${item.label} submenu`}
                          aria-expanded={expanded}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {expanded && (
                        <div className="flex flex-col gap-1 pl-5 pb-3 border-l-2 border-[#C18C26] ml-3 mb-2">
                          {item.children.map((sub) =>
                            sub.external ? (
                              <a
                                key={sub.label}
                                href={sub.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileOpen(false)}
                                className="min-h-[40px] flex items-center justify-between py-1.5 px-2 rounded-md text-[13.5px] font-medium text-[#666477] hover:text-[#393185] hover:bg-[#E9E6F5]/40"
                              >
                                <span>{sub.label}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#C18C26]" />
                              </a>
                            ) : (
                              <Link
                                key={sub.label}
                                to={sub.to}
                                onClick={() => setMobileOpen(false)}
                                className="min-h-[40px] flex items-center py-1.5 px-2 rounded-md text-[13.5px] font-medium text-[#666477] hover:text-[#393185] hover:bg-[#E9E6F5]/40"
                              >
                                {sub.label}
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
