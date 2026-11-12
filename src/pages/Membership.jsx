import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Send, ShieldCheck, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { API_BASE_URL } from '../config';
import { membershipData, societyInfo } from '../data/tnsData';

export default function Membership({ onShowToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'benefits';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['benefits', 'eligibility', 'apply'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'Neurosurgery',
    category: 'Life Member',
    hospital: '',
    medicalCouncilNo: '',
    message: '',
  });

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Membership submission failed.');
      }

      setFormSubmitted(true);
      if (onShowToast) {
        onShowToast('Membership application submitted to the TNS Secretariat.');
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: 'Neurosurgery',
        category: 'Life Member',
        hospital: '',
        medicalCouncilNo: '',
        message: '',
      });
    } catch (error) {
      const msg =
        error.message === 'Failed to fetch'
          ? `Backend server unreachable (${API_BASE_URL}). Please start the TNS backend server or contact ${societyInfo.secretariat.email}.`
          : error.message;
      setErrorMsg(msg);
      if (onShowToast) {
        onShowToast(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'benefits', label: 'Benefits & Overview' },
    { id: 'eligibility', label: 'Categories & Eligibility' },
    { id: 'apply', label: 'Apply Online' },
  ];

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="Membership"
        description="Become a member of the Telangana Neurosciences Society. Explore membership benefits, eligibility criteria, categories, and online application."
        path="/membership"
      />

      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            Join the Society
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            TNS Membership Portal
          </h1>
          <p className="text-[#F7F2E8]/85 text-[15px] mt-3 max-w-2xl leading-relaxed">
            Uniting neurosurgeons, neurologists, trainees, and neuroscience researchers across Telangana.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 relative z-10">
        {/* Tab Selector */}
        <div className="flex border-b border-[#E3DCCF] mb-10 gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-3 text-[14px] font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#393185] text-[#393185]'
                  : 'border-transparent text-[#666477] hover:text-[#393185]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-10 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {membershipData.benefits.map((item, idx) => (
                  <div key={item.title} className="tns-surface p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#E9E6F5] text-[#393185] flex items-center justify-center shrink-0">
                      {idx === 0 ? (
                        <Users className="w-5 h-5" />
                      ) : idx === 1 ? (
                        <Award className="w-5 h-5" />
                      ) : idx === 2 ? (
                        <BookOpen className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-editorial text-lg font-bold text-[#393185]">
                        {item.title}
                      </h2>
                      <p className="text-[13.5px] text-[#666477] leading-relaxed mt-1.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Application Process Strip */}
              <div className="tns-surface p-7">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C18C26]">
                  How to Join
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#393185] mt-1 mb-6">
                  Application Process
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {membershipData.applicationSteps.map((st) => (
                    <div key={st.step} className="p-4 rounded-xl bg-[#F7F2E8] border border-[#E3DCCF]">
                      <span className="font-editorial text-xl font-bold text-[#C18C26]">
                        {st.step}
                      </span>
                      <h3 className="font-editorial font-bold text-[#393185] mt-1">{st.title}</h3>
                      <p className="text-xs text-[#666477] leading-relaxed mt-1.5">{st.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-[#E3DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#666477]">
                    Already an existing member? Verify your Membership Number and registered record online.
                  </span>
                  <Link
                    to="/know-your-details"
                    className="tns-btn-secondary text-xs inline-flex items-center gap-1.5 shrink-0 w-fit"
                  >
                    <span>Know Your Membership Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'eligibility' && (
            <motion.div
              key="eligibility"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 text-left"
            >
              <div className="tns-surface p-7">
                <h2 className="font-editorial text-2xl font-bold text-[#393185] mb-4">
                  Eligibility Guidelines
                </h2>
                <ul className="space-y-3 list-disc pl-5 text-[14px] text-[#666477] leading-relaxed">
                  {membershipData.eligibilityCriteria.map((criterion, idx) => (
                    <li key={idx}>{criterion}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {membershipData.categories.map((cat) => (
                  <div key={cat.id} className="tns-surface p-6 border-t-4 border-t-[#393185]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                      Membership Category
                    </span>
                    <h3 className="font-editorial text-xl font-bold text-[#393185] mt-1">
                      {cat.title}
                    </h3>
                    <p className="text-[13.5px] text-[#292638] font-medium mt-2">{cat.audience}</p>
                    <p className="text-xs text-[#666477] mt-2 leading-relaxed">{cat.notes}</p>
                    <div className="mt-5 pt-4 border-t border-[#E3DCCF] flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#393185] bg-[#EDF3CE] px-3 py-1 rounded-full">
                        {cat.isComingSoonFee ? 'Fee Schedule Coming Soon' : cat.feeDisplay}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('apply')}
                        className="text-xs font-semibold text-[#393185] hover:text-[#C18C26] underline cursor-pointer"
                      >
                        Proceed to Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'apply' && (
            <motion.div
              key="apply"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
            >
              <div className="lg:col-span-4 space-y-5">
                <div className="tns-surface p-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                    Secretariat Desk
                  </span>
                  <h2 className="font-editorial text-xl font-bold text-[#393185] mt-1">
                    Membership Review
                  </h2>
                  <p className="text-[13px] text-[#666477] leading-relaxed mt-2">
                    Submitted requests are forwarded directly to the General Secretary (
                    {societyInfo.secretariat.generalSecretary}) for verification and onboarding.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#E3DCCF] text-xs text-[#666477] space-y-1">
                    <p>
                      <strong className="text-[#393185]">Address:</strong>{' '}
                      {societyInfo.secretariat.fullAddress}
                    </p>
                    <p>
                      <strong className="text-[#393185]">Phone:</strong>{' '}
                      {societyInfo.secretariat.phone}
                    </p>
                  </div>
                </div>

                <div className="tns-surface p-6 space-y-3 border-l-4 border-l-[#C18C26]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                    Verification Checklist
                  </span>
                  <ul className="space-y-2 text-xs text-[#666477] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#393185] shrink-0 mt-0.5" />
                      <span>Active Telangana / National Medical Council Registration Details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#393185] shrink-0 mt-0.5" />
                      <span>Postgraduate Qualification in Neurology, Neurosurgery, or Allied Neuroscience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#393185] shrink-0 mt-0.5" />
                      <span>Verification notice sent to {societyInfo.secretariat.email}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-8 tns-surface p-6 sm:p-8">
                <h2 className="font-editorial text-2xl font-bold text-[#393185] mb-5">
                  Online Membership Application
                </h2>

                {formSubmitted ? (
                  <div className="p-8 rounded-xl bg-[#EDF3CE]/60 border border-[#B0CB1F] text-center space-y-3">
                    <CheckCircle className="w-10 h-10 text-[#393185] mx-auto" />
                    <h3 className="font-editorial text-xl font-bold text-[#393185]">
                      Membership Request Received
                    </h3>
                    <p className="text-xs text-[#292638] max-w-md mx-auto leading-relaxed">
                      Thank you for applying to the Telangana Neurosciences Society. Our Secretariat
                      will review your credentials and contact you with confirmation steps.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="tns-btn-secondary text-xs mt-2 cursor-pointer"
                    >
                      Submit Another Application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="mem-name" className="block text-xs font-semibold text-[#393185] mb-1.5">
                          Full Name (with Dr. / Prof.) *
                        </label>
                        <input
                          id="mem-name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Dr. Ananya Rao"
                          className="tns-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="mem-email" className="block text-xs font-semibold text-[#393185] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          id="mem-email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="doctor@hospital.org"
                          className="tns-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="mem-phone" className="block text-xs font-semibold text-[#393185] mb-1.5">
                          Mobile Number *
                        </label>
                        <input
                          id="mem-phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98490 12345"
                          className="tns-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="mem-specialty" className="block text-xs font-semibold text-[#393185] mb-1.5">
                          Specialty *
                        </label>
                        <select
                          id="mem-specialty"
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleInputChange}
                          className="tns-input"
                        >
                          <option value="Neurosurgery">Neurosurgery</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Neuroscience Research">Neuroscience Research</option>
                          <option value="Postgraduate Trainee (M.Ch / DM / DNB)">
                            Postgraduate Trainee (M.Ch / DM / DNB)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="mem-category" className="block text-xs font-semibold text-[#393185] mb-1.5">
                          Membership Category *
                        </label>
                        <select
                          id="mem-category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="tns-input"
                        >
                          <option value="Life Member">Life Member</option>
                          <option value="Associate / Trainee Member">Associate / Trainee Member</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="mem-council" className="block text-xs font-semibold text-[#393185] mb-1.5">
                          State / NMC Registration No.
                        </label>
                        <input
                          id="mem-council"
                          name="medicalCouncilNo"
                          type="text"
                          value={formData.medicalCouncilNo}
                          onChange={handleInputChange}
                          placeholder="TSMC / NMC Reg. No."
                          className="tns-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mem-hospital" className="block text-xs font-semibold text-[#393185] mb-1.5">
                        Hospital / Academic Institution *
                      </label>
                      <input
                        id="mem-hospital"
                        name="hospital"
                        type="text"
                        required
                        value={formData.hospital}
                        onChange={handleInputChange}
                        placeholder="Nizam's Institute of Medical Sciences / Hospital"
                        className="tns-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="mem-message" className="block text-xs font-semibold text-[#393185] mb-1.5">
                        Qualifications &amp; Notes
                      </label>
                      <textarea
                        id="mem-message"
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Degree (M.Ch / DM / DNB), year of passing, or enquiry details..."
                        className="tns-input resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="tns-btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#B0CB1F]" />
                      <span>{loading ? 'Submitting Application...' : 'Submit Membership Request'}</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
