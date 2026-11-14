import React, { useState } from 'react';
import { Search, ShieldCheck, Mail } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { committeeData, societyInfo } from '../data/tnsData';

function getInitials(name, explicitInitials) {
  if (explicitInitials) return explicitInitials;
  const cleaned = String(name || '')
    .replace(/\b(Prof|Dr|Mr|Ms)\.?/gi, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TNS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function MemberPortrait({
  photoUrl,
  name,
  initials,
  sizeClass = 'w-16 h-16',
  fallbackClass = 'bg-[#393185] text-[#FBF8F1] border-b-2 border-[#C18C26] text-xl',
}) {
  const [imgError, setImgError] = useState(false);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setImgError(true)}
        loading="lazy"
        className={`${sizeClass} rounded-xl object-cover object-top shrink-0 border border-[#E3DCCF] border-b-2 border-b-[#C18C26] bg-[#FAF6ED] shadow-xs`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl font-editorial font-bold flex items-center justify-center shrink-0 ${fallbackClass}`}
    >
      {getInitials(name, initials)}
    </div>
  );
}

export default function Committee() {
  const [query, setQuery] = useState('');

  const filterMember = (m) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.designation && m.designation.toLowerCase().includes(q))
    );
  };

  const officeBearers = committeeData.officeBearers.filter(filterMember);
  const advisors = committeeData.advisors.filter(filterMember);
  const exOfficio = committeeData.exOfficioMembers.filter(filterMember);
  const execMembers = committeeData.executiveCommittee.filter(filterMember);
  const founders = committeeData.founderMembers.filter(filterMember);
  const pastPresidents = (committeeData.pastPresidents || []).filter(filterMember);

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="Executive Committee"
        description="Official Office Bearers, Advisors, Founder Members, and Executive Committee of the Telangana Neurosciences Society."
        path="/committee"
      />

      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            Society Governance
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            Leadership &amp; Committee
          </h1>
          <p className="text-[#F7F2E8]/85 text-[15px] mt-3 max-w-2xl leading-relaxed">
            Office Bearers, Advisory Board, Founder Members, and Executive Committee members guiding the Telangana Neurosciences Society.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-14 relative z-10">
        {/* Search */}
        <div className="tns-surface p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[#666477]">
            Telangana Neurosciences Society Committee Directory
          </p>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#666477] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by member name or role..."
              className="tns-input pl-9 py-2 text-xs"
              aria-label="Search committee members"
            />
          </div>
        </div>

        {/* 1. Office Bearers */}
        {officeBearers.length > 0 && (
          <section className="text-left space-y-6">
            <div className="border-b border-[#E3DCCF] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                Core Office Bearers
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#393185] mt-1">
                Executive Office Bearers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {officeBearers.map((m) => (
                <div key={m.name} className="tns-surface p-5 sm:p-6 flex items-start gap-4">
                  <MemberPortrait
                    photoUrl={m.photoUrl}
                    name={m.name}
                    initials={m.initials}
                    sizeClass="w-16 h-16 sm:w-20 sm:h-20"
                  />
                  <div className="text-left min-w-0">
                    <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#EDF3CE] text-[#292638]">
                      {m.role}
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#393185] mt-1.5">
                      {m.name}
                    </h3>
                    <p className="text-xs font-medium text-[#666477] mt-0.5">{m.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Advisors */}
        {advisors.length > 0 && (
          <section className="text-left space-y-6">
            <div className="border-b border-[#E3DCCF] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                Advisory Council
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#393185] mt-1">
                Society Advisors
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {advisors.map((adv) => (
                <div key={adv.name} className="tns-surface p-5 flex items-center gap-4">
                  <MemberPortrait
                    photoUrl={adv.photoUrl}
                    name={adv.name}
                    initials={adv.initials}
                    sizeClass="w-14 h-14"
                    fallbackClass="bg-[#E9E6F5] text-[#393185] text-base"
                  />
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#C18C26]">
                      {adv.role}
                    </span>
                    <h3 className="font-editorial font-bold text-[16px] text-[#393185]">
                      {adv.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Ex-Officio & Executive Committee Members */}
        {(exOfficio.length > 0 || execMembers.length > 0) && (
          <section id="executive" className="text-left space-y-6 scroll-mt-16">
            <div className="border-b border-[#E3DCCF] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                Executive Council
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#393185] mt-1">
                Executive Members &amp; Ex-Officio Members
              </h2>
            </div>

            <div className="overflow-x-auto tns-surface">
              <table className="w-full min-w-[440px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E3DCCF] bg-[#F1EADB] text-[#393185] text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-bold">Member Name</th>
                    <th className="py-3.5 px-5 font-bold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCCF] text-[13.5px]">
                  {[...execMembers, ...exOfficio].map((member) => (
                    <tr key={member.name} className="hover:bg-[#F7F2E8]/70 transition-colors">
                      <td className="py-3 px-5 font-semibold text-[#292638]">
                        <div className="flex items-center gap-3">
                          <MemberPortrait
                            photoUrl={member.photoUrl}
                            name={member.name}
                            initials={member.initials}
                            sizeClass="w-10 h-10"
                            fallbackClass="bg-[#E9E6F5] text-[#393185] text-xs"
                          />
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[#393185] font-medium">{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 4. Founder Members */}
        {founders.length > 0 && (
          <section id="founders" className="text-left space-y-6 scroll-mt-16">
            <div className="border-b border-[#E3DCCF] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                Founding Heritage
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#393185] mt-1">
                Founder Members
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {founders.map((f) => (
                <div key={f.name} className="tns-surface p-4 flex items-center sm:flex-col sm:items-start gap-3">
                  <MemberPortrait
                    photoUrl={f.photoUrl}
                    name={f.name}
                    initials={f.initials}
                    sizeClass="w-14 h-14 sm:w-16 sm:h-16"
                    fallbackClass="bg-[#E9E6F5] text-[#393185] text-base"
                  />
                  <div className="min-w-0">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#C18C26] block">
                      {f.role}
                    </span>
                    <h3 className="font-editorial font-bold text-[15px] text-[#393185] mt-0.5">
                      {f.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. List of Past Presidents */}
        {pastPresidents.length > 0 && (
          <section id="past-presidents" className="text-left space-y-6 scroll-mt-16">
            <div className="border-b border-[#E3DCCF] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                Presidential Roll
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#393185] mt-1">
                List of Past Presidents
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastPresidents.map((pp) => (
                <div
                  key={pp.name}
                  className="tns-surface p-4 sm:p-5 flex items-center gap-3.5 border-l-4 border-l-[#C18C26]"
                >
                  <MemberPortrait
                    photoUrl={pp.photoUrl}
                    name={pp.name}
                    initials={pp.initials}
                    sizeClass="w-14 h-14"
                    fallbackClass="bg-[#FAF6ED] text-[#393185] border border-[#E3DCCF] text-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-editorial text-sm font-bold text-[#C18C26]">
                        #{pp.order}
                      </span>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#666477]">
                        {pp.role}
                      </span>
                    </div>
                    <h3 className="font-editorial font-bold text-[16px] text-[#393185] mt-0.5">
                      {pp.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Official Registry Note */}
        <div className="p-5 rounded-2xl bg-[#F1EADB] border border-[#E3DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#666477] text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#393185] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#393185] block text-sm font-semibold">
                Official TNS Governance Registry ({societyInfo.registrationNumber})
              </strong>
              <span>
                Roster verified against official Telangana Neurosciences Society Secretariat records ({societyInfo.secretariat.websiteDisplay}). Individual portraits are added as submitted.
              </span>
            </div>
          </div>
          <a
            href={`mailto:${societyInfo.secretariat.email}`}
            className="inline-flex items-center gap-1.5 font-semibold text-[#393185] hover:text-[#C18C26] shrink-0"
          >
            <Mail className="w-4 h-4" />
            <span>{societyInfo.secretariat.email}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
