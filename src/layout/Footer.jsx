import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { societyInfo } from '../data/tnsData';

export default function Footer() {
  return (
    <footer className="bg-[#393185] text-[#F7F2E8]/85 border-t border-[#2D276A] relative z-10 text-left overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Column 1: Society Crest & Overview */}
        <div className="flex flex-col gap-4">
          <BrandLogo variant="footer" showWordmark={true} />
          <p className="text-[13.5px] leading-relaxed text-[#F7F2E8]/80 mt-1">
            {societyInfo.introSummary}
          </p>
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#B0CB1F]">
            {societyInfo.registrationNumber} · Est. Telangana
          </p>
        </div>

        {/* Column 2: Society Navigation */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[#FBF8F1] text-[13px] font-bold tracking-[0.14em] uppercase border-b border-[#FBF8F1]/15 pb-2.5">
            Society Navigation
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13.5px]">
            <li>
              <Link to="/" className="hover:text-[#B0CB1F] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#B0CB1F] transition-colors">
                About the Society
              </Link>
            </li>
            <li>
              <Link to="/committee" className="hover:text-[#B0CB1F] transition-colors">
                Executive Committee
              </Link>
            </li>
            <li>
              <Link to="/membership" className="hover:text-[#B0CB1F] transition-colors">
                Membership Portal
              </Link>
            </li>
            <li>
              <Link to="/know-your-details" className="hover:text-[#B0CB1F] transition-colors">
                Know Your Membership Details
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-[#B0CB1F] transition-colors">
                Gallery
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Academic Events */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[#FBF8F1] text-[13px] font-bold tracking-[0.14em] uppercase border-b border-[#FBF8F1]/15 pb-2.5">
            Conferences &amp; Events
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13.5px]">
            <li>
              <Link to="/events" className="hover:text-[#B0CB1F] transition-colors">
                Events &amp; Announcements
              </Link>
            </li>
            <li>
              <Link to="/events/tnscon-2027" className="hover:text-[#B0CB1F] transition-colors">
                TNSCON 2027 (12–14 Mar 2027)
              </Link>
            </li>
            <li>
              <Link to="/newsletter" className="hover:text-[#B0CB1F] transition-colors">
                TNS Newsletter
              </Link>
            </li>
            <li>
              <a
                href="https://tnscon2027hyd.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#B0CB1F] transition-colors"
              >
                <span>tnscon2027hyd.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C18C26]" />
              </a>
            </li>
            <li>
              <Link to="/admin" className="text-[#F7F2E8]/60 hover:text-[#B0CB1F] transition-colors text-xs">
                Secretariat Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Secretariat Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[#FBF8F1] text-[13px] font-bold tracking-[0.14em] uppercase border-b border-[#FBF8F1]/15 pb-2.5">
            Secretariat Office
          </h4>
          <div className="flex flex-col gap-3 text-[13.5px]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C18C26] shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed">
                {societyInfo.secretariat.addressLine1}
                <br />
                {societyInfo.secretariat.addressLine2}
              </address>
            </div>
            <a
              href={`tel:${societyInfo.secretariat.phone.replace(/[^+\d]/g, '')}`}
              className="flex items-center gap-2.5 hover:text-[#B0CB1F] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#C18C26] shrink-0" />
              <span>
                Ph: {societyInfo.secretariat.phone} · Fax: {societyInfo.secretariat.fax}
              </span>
            </a>
            <a
              href={`mailto:${societyInfo.secretariat.email}`}
              className="flex items-center gap-2.5 hover:text-[#B0CB1F] transition-colors break-all"
            >
              <Mail className="w-4 h-4 text-[#C18C26] shrink-0" />
              <span>{societyInfo.secretariat.email}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="bg-[#2D276A] border-t border-[#FBF8F1]/10 py-5 text-xs text-[#F7F2E8]/75">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} {societyInfo.name} ({societyInfo.registrationNumber}). All Rights Reserved.
          </p>
          <p className="text-[#E3DCCF]">
            Official Website:{' '}
            <a
              href={societyInfo.secretariat.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B0CB1F] font-medium hover:underline"
            >
              {societyInfo.secretariat.websiteDisplay}
            </a>{' '}
            · Telangana, India
          </p>
        </div>
      </div>
    </footer>
  );
}
