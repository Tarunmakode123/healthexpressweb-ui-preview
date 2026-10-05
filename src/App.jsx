import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/cart/CartDrawer';
import CalculatorModal from './components/common/CalculatorModal';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrescriptionModal from './components/common/PrescriptionModal';
import CareManagerCTA from './components/common/CareManagerCTA';
import HealthExpressAssistant from './components/chat/HealthExpressAssistant';
import HealthExpressIntro from './components/common/HealthExpressIntro';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import HealthLibraryPage from './pages/HealthLibraryPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import HealthCalculatorsPage from './pages/HealthCalculatorsPage';
import CalculatorDetailPage from './pages/CalculatorDetailPage';
import SurgeriesPage from './pages/SurgeriesPage';
import SurgeryDetailPage from './pages/SurgeryDetailPage';
import AboutPage from './pages/AboutPage';
import ProvidersPage from './pages/ProvidersPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import AuthPage from './pages/AuthPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Helper component to scroll window to top on route navigation & track PAGE_VIEW
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    import('./utils/analytics.js').then(({ logAnalyticsEvent }) => {
      logAnalyticsEvent('PAGE_VIEW', { pagePath: pathname, metadata: { page_path: pathname }, deduplicate: true });
    }).catch(() => {});
  }, [pathname]);

  return null;
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [activeCalcSlug, setActiveCalcSlug] = useState('bmi-calculator');

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);

  const handleOpenCalcModal = (slug = 'bmi-calculator') => {
    setActiveCalcSlug(slug);
    setIsCalcModalOpen(true);
  };
  const handleCloseCalcModal = () => setIsCalcModalOpen(false);

  useEffect(() => {
    const handleGlobalCalcModal = (e) => {
      const slug = e.detail?.slug || 'bmi-calculator';
      handleOpenCalcModal(slug);
    };

    window.addEventListener('open-calculator-modal', handleGlobalCalcModal);
    return () => window.removeEventListener('open-calculator-modal', handleGlobalCalcModal);
  }, []);

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <HealthExpressIntro />}
      <div className={`min-h-screen flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 antialiased ${isAdminRoute ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
        
        {/* Responsive Header Navbar (Public Consumer Pages Only) */}
        {!isAdminRoute && (
          <Navbar onOpenUploadModal={handleOpenUploadModal} onOpenCalculatorModal={handleOpenCalcModal} />
        )}

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage onOpenUploadModal={handleOpenUploadModal} onOpenCalculatorModal={handleOpenCalcModal} />} />
            <Route path="/services" element={<ServicesPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/services/:slug" element={<ServiceDetailPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/surgeries" element={<SurgeriesPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/surgeries/:slug" element={<SurgeryDetailPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/health-library" element={<HealthLibraryPage />} />
            <Route path="/health-library/:slug" element={<ArticleDetailPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/health-calculators" element={<HealthCalculatorsPage onOpenCalculatorModal={handleOpenCalcModal} />} />
            <Route path="/health-calculators/:slug" element={<CalculatorDetailPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/about" element={<AboutPage onOpenUploadModal={handleOpenUploadModal} />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal/:type" element={<LegalPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/account" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Routes>
        </main>

        {/* Public Website Footer & Floating Widgets (Public Consumer Pages Only) */}
        {!isAdminRoute && (
          <>
            <Footer onOpenUploadModal={handleOpenUploadModal} />
            <CareManagerCTA />
            <HealthExpressAssistant onOpenUploadModal={handleOpenUploadModal} />
          </>
        )}

        {/* Global Slide-over Cart & Modals */}
        <CartDrawer />

        <CalculatorModal 
          isOpen={isCalcModalOpen}
          calculatorSlug={activeCalcSlug}
          onClose={handleCloseCalcModal}
        />

        <PrescriptionModal 
          isOpen={isUploadModalOpen} 
          onClose={handleCloseUploadModal} 
        />

      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
