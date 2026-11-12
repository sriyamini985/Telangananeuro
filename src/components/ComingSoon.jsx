import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

/**
 * Editorial Coming Soon component for TNS sections awaiting official client updates,
 * photography, circulars, or fee/program confirmation.
 */
export default function ComingSoon({
  eyebrow = 'Official Society Update',
  title = 'Coming Soon',
  message = 'We are preparing this section. Please check back soon for updates from the Telangana Neurosciences Society.',
  actionLabel,
  actionTo,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#E3DCCF] bg-[#FAF6ED]/90 text-center ${
        compact ? 'px-6 py-7' : 'px-7 py-10 sm:px-10 sm:py-12'
      } ${className}`}
    >
      {/* Subtle architectural neural arc motif */}
      <svg
        viewBox="0 0 180 60"
        className="mx-auto mb-4 h-7 w-28 text-[#393185]/20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 38 C 42 10, 74 52, 96 28 C 118 8, 142 42, 172 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="8" cy="38" r="3" fill="#C18C26" fillOpacity="0.55" />
        <circle cx="96" cy="28" r="3.5" fill="#393185" fillOpacity="0.6" />
        <circle cx="172" cy="18" r="3" fill="#B0CB1F" fillOpacity="0.7" />
      </svg>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#393185]/8 border border-[#393185]/15 mb-3">
        <Clock className="w-3.5 h-3.5 text-[#C18C26]" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#393185]">
          {eyebrow}
        </span>
      </div>

      <h3
        className={`font-editorial font-bold text-[#393185] ${
          compact ? 'text-xl' : 'text-2xl sm:text-[1.75rem]'
        }`}
      >
        {title}
      </h3>

      <p
        className={`text-[#666477] leading-relaxed mx-auto mt-2.5 ${
          compact ? 'text-[13.5px] max-w-md' : 'text-[15px] max-w-xl'
        }`}
      >
        {message}
      </p>

      {actionLabel && actionTo && (
        <div className="mt-5">
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#393185] hover:text-[#C18C26] transition-colors"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
