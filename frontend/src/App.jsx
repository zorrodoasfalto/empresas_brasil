import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TrialExpiredRedirect from './components/TrialExpiredRedirect';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import GoogleMapsSimple from './pages/GoogleMapsSimple';
import GoogleMapsScraper from './pages/GoogleMapsScraper';
import LinkedInScraper from './pages/LinkedInScraper';
import InstagramEmailScraper from './pages/InstagramEmailScraper';
import TestPage from './pages/TestPage';
import Leads from './pages/Leads';
import Funil from './pages/Funil';
import Kanban from './pages/Kanban';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import SecurityPolicy from './pages/SecurityPolicy';
import Checkout from './pages/Checkout';
import CheckoutSimple from './pages/CheckoutSimple';
import VerifyEmail from './pages/VerifyEmail';
import SubscriptionPage from './pages/SubscriptionPage';
import AccountSettings from './pages/AccountSettings';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyles />
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/security" element={<SecurityPolicy />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-debug" element={<CheckoutSimple />} />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <Dashboard />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <Dashboard />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/google-places" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <GoogleMapsSimple />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/google-maps-scraper" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <GoogleMapsScraper />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/linkedin-scraper" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <LinkedInScraper />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instagram" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <InstagramEmailScraper />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route path="/test-victor" element={<TestPage />} />
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <Leads />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/funil" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <Funil />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/kanban" 
              element={
                <ProtectedRoute>
                  <TrialExpiredRedirect>
                    <Kanban />
                  </TrialExpiredRedirect>
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;