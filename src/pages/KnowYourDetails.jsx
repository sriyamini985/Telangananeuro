import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, AlertCircle, UserCheck, Mail, Phone, ArrowRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { API_BASE_URL } from '../config';
import { societyInfo } from '../data/tnsData';
import { registeredMembersDirectory } from '../data/memberDirectory';

function normalizePhoneDigits(val) {
  const digits = String(val || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function findLocalMember(query) {
  const q = query.trim();
  if (!q) return null;
  const qLower = q.toLowerCase();
  const qDigits = normalizePhoneDigits(q);

  return (
    registeredMembersDirectory.find((m) => {
      if (m.membershipNo && m.membershipNo.trim().toLowerCase() === qLower) return true;
      if (m.email && m.email.trim().toLowerCase() === qLower) return true;
      if (qDigits.length >= 7 && m.phone && normalizePhoneDigits(m.phone) === qDigits) return true;
      return false;
    }) || null
  );
}

export default function KnowYourDetails() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [memberResult, setMemberResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) {
      setStatusMessage('Please enter a registered Membership No, Email ID, or Mobile No.');
      setMemberResult(null);
      return;
    }

    setLoading(true);
    setStatusMessage('');
    setMemberResult(null);
    setSearchedQuery(cleaned);

    // 1. Check backend API lookup first
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/memberships/lookup?q=${encodeURIComponent(cleaned)}`
      );

      if (response.ok) {
        const data = await response.json();
        setMemberResult(data);
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        const localMatch = findLocalMember(cleaned);
        if (localMatch) {
          setMemberResult(localMatch);
        } else {
          setStatusMessage(
            `No membership record matched "${cleaned}". Please verify your Membership No, Email ID, or Mobile No, or contact the TNS Secretariat if your record has not yet been uploaded.`
          );
        }
        setLoading(false);
        return;
      }
    } catch {
      // Backend unreachable or offline: fall back gracefully to local directory
    }

    // 2. Fallback to local bundled directory
    const localMatch = findLocalMember(cleaned);
    if (localMatch) {
      setMemberResult(localMatch);
    } else if (registeredMembersDirectory.length === 0) {
      setStatusMessage(
        'Member directory records are currently being uploaded by the TNS Secretariat. Please check back shortly or contact info@telangananeuro.com to verify your membership details.'
      );
    } else {
      setStatusMessage(
        `No membership record matched "${cleaned}". Please verify your registered Membership No, Email ID, or Mobile No.`
      );
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="Know Your Membership Details"
        description="Look up your Telangana Neurosciences Society (TNS) Membership Number and registered member details using your Membership No, Email ID, or Mobile Number."
        path="/know-your-details"
      />

      {/* Page Header Banner */}
      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-medium text-[#F7F2E8]/75 mb-3 flex items-center gap-2"
          >
            <Link to="/" className="hover:text-[#B0CB1F] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/membership" className="hover:text-[#B0CB1F] transition-colors">
              Members
            </Link>
            <span>/</span>
            <span className="text-[#B0CB1F] font-semibold">Know your details</span>
          </nav>

          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            Know Your Details
          </h1>
          <p className="text-[#F7F2E8]/85 text-[15px] mt-3 max-w-2xl leading-relaxed">
            Verify your Telangana Neurosciences Society (TNS) membership record using your
            registered Membership Number, Email ID, or Mobile Number.
          </p>
        </div>
      </section>

      {/* Main Lookup & Results Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-8 relative z-10 text-left">
        {/* Search Card */}
        <div className="tns-surface p-6 sm:p-8 border-t-4 border-t-[#393185]">
          <form onSubmit={handleCheck} className="space-y-4">
            <label
              htmlFor="member-lookup-input"
              className="block text-sm font-semibold text-[#393185]"
            >
              Enter Registered Membership No / Email ID / Mobile No
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#666477] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="member-lookup-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. TNS-101, doctor@hospital.org, or 9849012345"
                  className="tns-input pl-10"
                  aria-describedby="lookup-helper-note"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tns-btn-primary px-7 py-2.5 text-sm inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#B0CB1F]" />
                <span>{loading ? 'Checking...' : 'Check'}</span>
              </button>
            </div>

            <p id="lookup-helper-note" className="text-xs text-[#666477]">
              Records match registered Membership Number, Email address, or 10-digit Mobile Number.
            </p>
          </form>
        </div>

        {/* Status Banner (Not found / awaiting upload / validation) */}
        {statusMessage && (
          <div
            role="status"
            className="p-5 rounded-2xl bg-[#FAF6ED] border border-[#C18C26]/45 flex items-start gap-3.5 text-sm text-[#292638]"
          >
            <AlertCircle className="w-5 h-5 text-[#C18C26] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="leading-relaxed">{statusMessage}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <Link
                  to="/membership?tab=apply"
                  className="font-semibold text-[#393185] hover:text-[#C18C26] inline-flex items-center gap-1"
                >
                  <span>New Membership Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/contact"
                  className="font-semibold text-[#666477] hover:text-[#393185]"
                >
                  Contact TNS Secretariat →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Result Card Matching Reference Structure in Official TNS Palette */}
        {memberResult && (
          <div className="tns-surface p-4 sm:p-8 space-y-5 shadow-md">
            <p className="text-[15px] text-[#292638]">
              Dear{' '}
              <strong className="font-semibold text-[#393185]">{memberResult.name}</strong>,
            </p>

            <div className="rounded-xl border border-[#E3DCCF] bg-[#FAF6ED] p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#393185]">
                  Membership Details
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#EDF3CE] text-[#292638]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5D700D]" />
                  <span>Verified Record</span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#E3DCCF] bg-white">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <tbody className="divide-y divide-[#E3DCCF]">
                    <tr>
                      <th className="w-32 sm:w-52 bg-[#393185] text-[#FBF8F1] font-semibold px-3.5 sm:px-5 py-3 sm:py-3.5">
                        Membership No
                      </th>
                      <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-semibold text-[#292638]">
                        {memberResult.membershipNo || 'Pending Allotment'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-[#393185] text-[#FBF8F1] font-semibold px-3.5 sm:px-5 py-3 sm:py-3.5">
                        Full Name
                      </th>
                      <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 font-medium text-[#292638]">
                        {memberResult.name}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-[#393185] text-[#FBF8F1] font-semibold px-3.5 sm:px-5 py-3 sm:py-3.5">
                        Email ID
                      </th>
                      <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 text-[#292638] break-all">
                        {memberResult.email || 'Not recorded'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-[#393185] text-[#FBF8F1] font-semibold px-3.5 sm:px-5 py-3 sm:py-3.5">
                        Mobile No.
                      </th>
                      <td className="px-3.5 sm:px-5 py-3 sm:py-3.5 text-[#292638]">
                        {memberResult.phone || 'Not recorded'}
                      </td>
                    </tr>
                    {memberResult.category && (
                      <tr>
                        <th className="bg-[#393185] text-[#FBF8F1] font-semibold px-3.5 sm:px-5 py-3 sm:py-3.5">
                          Category
                        </th>
                        <td className="px-4 sm:px-5 py-3.5 text-[#292638]">
                          {memberResult.category}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-xs sm:text-[13px] text-[#666477] space-y-1 pt-1">
              <p>
                If you have any questions or need to update your contact information, please contact
                the TNS Secretariat Office at{' '}
                <a
                  href={`mailto:${societyInfo.secretariat.email}`}
                  className="font-semibold text-[#393185] hover:underline"
                >
                  {societyInfo.secretariat.email}
                </a>
                .
              </p>
              <p className="font-medium text-[#292638]">
                Thank you for being part of the Telangana Neurosciences Society (
                {searchedQuery}).
              </p>
            </div>
          </div>
        )}

        {/* Helpful Secretariat Footer Bar */}
        <div className="p-5 rounded-2xl bg-[#F1EADB] border border-[#E3DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#666477]">
          <div className="space-y-1">
            <strong className="text-[#393185] text-sm block">
              Secretariat Membership Desk
            </strong>
            <span>Need assistance retrieving or updating your TNS Membership Number?</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <a
              href={`tel:${societyInfo.secretariat.phone.replace(/[^+\d]/g, '')}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#393185] hover:text-[#C18C26]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{societyInfo.secretariat.phone}</span>
            </a>
            <a
              href={`mailto:${societyInfo.secretariat.email}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#393185] hover:text-[#C18C26]"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{societyInfo.secretariat.email}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
