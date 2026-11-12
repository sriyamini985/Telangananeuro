import React from 'react';
import { Link } from 'react-router-dom';
import tnsLogo from '../assets/images/tns-logo.png';

/**
 * Reusable official Telangana Neurosciences Society logo component.
 * Preserves original aspect ratio, transparent areas, and full color fidelity.
 */
export default function BrandLogo({
  variant = 'header',
  showWordmark = true,
  className = '',
  to = '/',
}) {
  const isFooter = variant === 'footer';
  const sizeClass =
    variant === 'hero'
      ? 'h-16 sm:h-20'
      : isFooter
      ? 'h-14 sm:h-16'
      : 'h-11 sm:h-12';

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group min-w-0 ${className}`}>
      <img
        src={tnsLogo}
        alt="Telangana Neurosciences Society Official Crest"
        className={`${sizeClass} w-auto object-contain shrink-0 select-none transition-transform duration-200 group-hover:scale-[1.02]`}
        draggable={false}
      />

      {showWordmark && (
        <div className="flex flex-col leading-tight text-left min-w-0">
          <span
            className={`font-editorial font-bold tracking-tight ${
              isFooter
                ? 'text-[#FBF8F1] text-[15px] sm:text-[17px]'
                : 'text-[#393185] text-[13.5px] sm:text-[16px]'
            }`}
          >
            Telangana Neurosciences Society
          </span>
          <span
            className={`text-[9.5px] sm:text-[10.5px] font-semibold tracking-[0.11em] sm:tracking-[0.16em] uppercase mt-0.5 ${
              isFooter ? 'text-[#E3DCCF]' : 'text-[#C18C26]'
            }`}
          >
            In Service of Neurosciences
          </span>
        </div>
      )}
    </div>
  );

  if (!to) return content;

  return (
    <Link to={to} className="inline-flex items-center focus:outline-none">
      {content}
    </Link>
  );
}
