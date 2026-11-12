import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import TopBannerCarousel from './components/TopBannerCarousel';
import NeuroPageBackground from './components/NeuroPageBackground';
import TnsconPopup from './components/TnsconPopup';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import ScrollToTop from './layout/ScrollToTop';
import tnsLogo from './assets/images/tns-logo.png';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Committee = lazy(() => import('./pages/Committee'));
const Membership = lazy(() => import('./pages/Membership'));
const KnowYourDetails = lazy(() => import('./pages/KnowYourDetails'));
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Newsletter = lazy(() => import('./pages/Newsletter'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-[65vh] bg-transparent flex flex-col items-center justify-center gap-4">
    <img
      src={tnsLogo}
      alt="Telangana Neurosciences Society"
      className="h-14 w-auto object-contain opacity-90"
    />
    <div className="w-8 h-8 border-3 border-[#393185]/20 border-t-[#393185] rounded-full animate-spin" />
    <span className="text-[#666477] text-xs font-semibold uppercase tracking-widest">
      Loading...
    </span>
  </div>
);

const pageTransitionVariants = {
  initial: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

function AnimatedRoutes({ showToast, onOpenConferencePopup }) {
  const location = useLocation();

  return (
    <>
      {/* Subtle synaptic gradient shimmer bar pulsing briefly on each route change */}
      <motion.div
        key={`bar-${location.pathname}`}
        initial={{ scaleX: 0, opacity: 0.9 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'left center' }}
        className="fixed top-0 left-0 right-0 h-[3px] z-[80] pointer-events-none bg-gradient-to-r from-[#393185] via-[#C18C26] to-[#009DE2]"
        aria-hidden="true"
      />

      {/* Non-blocking enter transition prevents WebGL Canvas unmount/remount races */}
      <motion.div
        key={location.pathname}
        variants={pageTransitionVariants}
        initial="initial"
        animate="enter"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route
              path="/"
              element={
                <Home
                  onShowToast={showToast}
                  onOpenConferencePopup={onOpenConferencePopup}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/committee" element={<Committee />} />
            <Route path="/membership" element={<Membership onShowToast={showToast} />} />
            <Route path="/know-your-details" element={<KnowYourDetails />} />
            <Route path="/events" element={<Events onShowToast={showToast} />} />
            <Route path="/events/:slug" element={<EventDetails />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/contact" element={<Contact onShowToast={showToast} />} />
            <Route path="/admin" element={<AdminLogin onShowToast={showToast} />} />
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard onShowToast={showToast} />}
            />
            <Route
              path="*"
              element={
                <Home
                  onShowToast={showToast}
                  onOpenConferencePopup={onOpenConferencePopup}
                />
              }
            />
          </Routes>
        </Suspense>
      </motion.div>
    </>
  );
}

function AppShell() {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState('');
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [conferencePopupOpen, setConferencePopupOpen] = useState(false);
  const hasAutoShownPopupRef = useRef(false);

  // Open TNSCON 2027 invitation popup automatically when the homepage first loads/refreshes
  useEffect(() => {
    if (location.pathname !== '/' || hasAutoShownPopupRef.current) return undefined;
    const timer = setTimeout(() => {
      hasAutoShownPopupRef.current = true;
      setConferencePopupOpen(true);
    }, 550);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleCloseConferencePopup = useCallback(() => {
    hasAutoShownPopupRef.current = true;
    setConferencePopupOpen(false);
  }, []);

  const handleOpenConferencePopup = useCallback(() => {
    setConferencePopupOpen(true);
  }, []);

  const showToast = (message) => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToastMessage(message);
    const id = setTimeout(() => setToastMessage(''), 4200);
    setToastTimeoutId(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F2E8] text-[#292638] relative isolate">
      <NeuroPageBackground />
      <ScrollToTop />
      <TopBannerCarousel />
      <Navbar />

      <main className="flex-grow relative z-10">
        <AnimatedRoutes
          showToast={showToast}
          onOpenConferencePopup={handleOpenConferencePopup}
        />
      </main>

      <Footer />

      <TnsconPopup
        isOpen={conferencePopupOpen}
        onClose={handleCloseConferencePopup}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="tns-toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="tns-toast-container pointer-events-none"
          >
            <div className="bg-[#393185] text-[#FBF8F1] py-3.5 px-5 rounded-xl shadow-xl border-l-4 border-[#B0CB1F] flex items-center gap-3 pointer-events-auto max-w-sm">
              <span className="text-[#C18C26] text-base font-bold shrink-0">ⓘ</span>
              <span className="text-[13px] font-medium text-left">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <AppShell />
      </Router>
    </MotionConfig>
  );
}
