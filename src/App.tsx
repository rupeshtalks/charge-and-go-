import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppPreferencesProvider } from './context/AppPreferencesContext';
import { AmbientSpace3D } from './components/3d/AmbientSpace3D';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { PricingPage } from './pages/public/PricingPage';
import { ServiceAreasPage } from './pages/public/ServiceAreasPage';
import { FAQPage } from './pages/public/FAQPage';
import { ContactPage } from './pages/public/ContactPage';
import { LegalPage } from './pages/public/LegalPage';

// Auth Pages
import { AuthPage } from './pages/auth/AuthPage';

// Customer Flow
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { BookingFlowPage } from './pages/customer/BookingFlowPage';
import { BookingDetailsPage } from './pages/customer/BookingDetailsPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { NotificationHistoryPage } from './pages/customer/NotificationHistoryPage';

// Driver Console
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage';

// Admin Suite
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export function App() {
  return (
    <AppPreferencesProvider>
      <BrowserRouter>
        <AmbientSpace3D />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 2 }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Marketing */}
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/coverage" element={<ServiceAreasPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Legal Documents */}
              <Route path="/terms" element={<LegalPage title="Terms of Service & Vehicle Custody" category="Terms" />} />
              <Route path="/privacy" element={<LegalPage title="Privacy Policy & Inspection Photos" category="Privacy" />} />
              <Route path="/refunds" element={<LegalPage title="Refund & Cancellation Policy" category="Refunds" />} />

              {/* Authentication */}
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/forgot-password" element={<AuthPage mode="forgot-password" />} />

              {/* Profile & Notifications */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationHistoryPage />} />

              {/* Customer Operations */}
              <Route path="/customer" element={<CustomerDashboardPage />} />
              <Route path="/book" element={<BookingFlowPage />} />
              <Route path="/booking/:id" element={<BookingDetailsPage />} />

              {/* Driver Mobile Console */}
              <Route path="/driver" element={<DriverDashboardPage />} />

              {/* Admin Business Management Suite */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppPreferencesProvider>
  );
}

export default App;
