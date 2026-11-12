import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, Globe, Printer } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { API_BASE_URL } from '../config';
import { societyInfo } from '../data/tnsData';

export default function Contact({ onShowToast }) {
  const [searchParams] = useSearchParams();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: searchParams.get('subject') || '',
    message: '',
  });

  useEffect(() => {
    const subj = searchParams.get('subject');
    if (subj) {
      setFormData((prev) => ({ ...prev, subject: subj }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry.');
      }

      setFormSubmitted(true);
      if (onShowToast) {
        onShowToast('Your message has been delivered to the TNS Secretariat.');
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      const msg =
        error.message === 'Failed to fetch'
          ? `Backend server unreachable (${API_BASE_URL}). Please email ${societyInfo.secretariat.email} directly or start the backend service.`
          : error.message;
      setErrorMsg(msg);
      if (onShowToast) onShowToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#292638]">
      <SeoHead
        title="Contact Us"
        description="Contact the Telangana Neurosciences Society Secretariat in Hyderabad for membership, events, or academic enquiries."
        path="/contact"
      />

      <section className="tns-page-banner text-[#FBF8F1] text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <span className="text-[#B0CB1F] text-xs font-bold uppercase tracking-[0.22em] block mb-2">
            Secretariat Desk
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            Contact Us
          </h1>
          <p className="text-[#F7F2E8]/85 text-[14.5px] sm:text-[15px] mt-3 max-w-2xl leading-relaxed">
            Reach out to the Telangana Neurosciences Society Secretariat for membership, conferences, or academic collaboration.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16 space-y-10 sm:space-y-12 relative z-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Secretariat Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="tns-surface p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#E9E6F5] text-[#393185] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-editorial text-lg font-bold text-[#393185]">
                    {societyInfo.secretariat.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#C18C26] mt-0.5">
                    {societyInfo.name} · {societyInfo.registrationNumber}
                  </p>
                  <address className="not-italic text-[13.5px] text-[#666477] leading-relaxed mt-2">
                    {societyInfo.secretariat.addressLine1}
                    <br />
                    {societyInfo.secretariat.addressLine2}
                  </address>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E3DCCF] space-y-2 text-xs">
                <div>
                  <strong className="text-[#393185] block">
                    {societyInfo.secretariat.generalSecretary}
                  </strong>
                  <span className="text-[#666477]">
                    {societyInfo.secretariat.generalSecretaryRole}
                  </span>
                </div>
                <div>
                  <strong className="text-[#393185] block">
                    {societyInfo.secretariat.treasurer}
                  </strong>
                  <span className="text-[#666477]">{societyInfo.secretariat.treasurerRole}</span>
                </div>
              </div>
            </div>

            <div className="tns-surface p-5 sm:p-6 space-y-3 text-[13.5px]">
              <h3 className="font-editorial text-lg font-bold text-[#393185]">
                Direct Channels
              </h3>
              <a
                href={`tel:${societyInfo.secretariat.phone.replace(/[^+\d]/g, '')}`}
                className="flex items-center gap-2.5 text-[#292638] hover:text-[#393185] font-medium min-w-0"
              >
                <Phone className="w-4 h-4 text-[#C18C26] shrink-0" />
                <span className="break-words">Ph: {societyInfo.secretariat.phone}</span>
              </a>
              <div className="flex items-center gap-2.5 text-[#292638] font-medium min-w-0">
                <Printer className="w-4 h-4 text-[#C18C26] shrink-0" />
                <span className="break-words">Fax: {societyInfo.secretariat.fax}</span>
              </div>
              <a
                href={`mailto:${societyInfo.secretariat.email}`}
                className="flex items-center gap-2.5 text-[#393185] hover:text-[#C18C26] font-semibold min-w-0"
              >
                <Mail className="w-4 h-4 text-[#C18C26] shrink-0" />
                <span className="break-all">{societyInfo.secretariat.email}</span>
              </a>
              <a
                href={societyInfo.secretariat.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#393185] hover:text-[#C18C26] font-medium min-w-0"
              >
                <Globe className="w-4 h-4 text-[#C18C26] shrink-0" />
                <span className="break-all">{societyInfo.secretariat.websiteDisplay}</span>
              </a>
            </div>

            <div className="tns-surface p-6 space-y-2 border-l-4 border-l-[#393185]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18C26]">
                Academic &amp; Conference Desk
              </span>
              <p className="text-xs text-[#666477] leading-relaxed">
                For TNSCON 2027 abstract submissions, CME accreditation proposals, or member directory updates, mention your department and institution in the enquiry subject.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 tns-surface p-6 sm:p-8">
            <h2 className="font-editorial text-2xl font-bold text-[#393185] mb-5">
              Send an Enquiry
            </h2>

            {formSubmitted ? (
              <div className="p-8 rounded-xl bg-[#EDF3CE]/60 border border-[#B0CB1F] text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-[#393185] mx-auto" />
                <h3 className="font-editorial text-xl font-bold text-[#393185]">
                  Message Sent Successfully
                </h3>
                <p className="text-xs text-[#292638] max-w-md mx-auto">
                  Thank you for writing to the Telangana Neurosciences Society. Our Secretariat will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  className="tns-btn-secondary text-xs mt-2 cursor-pointer"
                >
                  Send Another Enquiry
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
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-[#393185] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Dr. Rajesh Kumar"
                      className="tns-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-[#393185] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
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
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#393185] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
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
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#393185] mb-1.5">
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Membership / Academic Enquiry"
                      className="tns-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-[#393185] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write your enquiry for the Secretariat..."
                    className="tns-input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tns-btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#B0CB1F]" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps */}
        <div className="tns-surface p-3 h-72 sm:h-96 overflow-hidden">
          <iframe
            title="Telangana Neurosciences Society Secretariat Map"
            src={societyInfo.secretariat.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
