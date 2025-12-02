import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { LoadingProvider, useLoading } from "./context/LoadingContext.jsx";
import GlobalLoader from "./components/GlobalLoader.jsx";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TailoredSolutions from "./components/TailoredSolutions";
import CoreFeatures from "./components/CoreFeatures";
import Testimonials from "./components/Testimonials";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import FloatingTipWidget from "./components/FloatingTipWidget";
import DailyLoginModal from "./components/DailyLoginModal";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudentPage from "./pages/StudentPage";
import ProfessionalPage from "./pages/ProfessionalPage";
import SeniorCitizenPage from "./pages/SeniorCitizenPage";
import HomemakerPage from "./pages/HomemakerPage";
import RuralUserPage from "../src/pages/RuralPage.jsx";
import CyberSafeFeed from "./components/CyberSafeFeed.jsx";
import Anonymous from "./components/Anonymous.jsx";
import PhishingEmailSimulator from "./components/PhishingEmailSimulator.jsx";
import SMSScamSimulator from "./components/SMSScamSimulator.jsx";
import CertificationExam from "./components/CertificationExam.jsx";

import CybersecurityChatbot from "./pages/CyberSecurityChatBot.jsx";
import APIToolPage from "./pages/APIToolPage.jsx";
import CommunityReputationPage from "./components/CommunityReputation.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CertificatePage from "./pages/CertificatePage.jsx";

// Inner application that can consume AuthContext
const AppInner = () => {
  const { loading } = useAuth();
  const { active: globalLoading, message, subMessage } = useLoading();
  return (
    <>
      {(loading || globalLoading) && (
        <GlobalLoader message={message ?? "Securing your experience…"} subMessage={subMessage ?? "Please wait a moment"} />
      )}
      <Navbar />
      <FloatingTipWidget />
      <DailyLoginModal />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <TailoredSolutions />
              <CoreFeatures />
              <Testimonials />
              <FinalCta />
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cybersafe-feed" element={<CyberSafeFeed />} />
        <Route path="/anonymous" element={<Anonymous />} />
        <Route path="/community-reputation" element={<CommunityReputationPage />} />
        <Route path="/student-dashboard" element={<StudentPage />} />
        <Route
          path="/professional-dashboard"
          element={
            <ProtectedRoute>
              <ProfessionalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/senior-citizen-dashboard"
          element={
            <ProtectedRoute>
              <SeniorCitizenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homemaker-dashboard"
          element={
            <ProtectedRoute>
              <HomemakerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rural-user-dashboard"
          element={
            <ProtectedRoute>
              <RuralUserPage />
            </ProtectedRoute>
          }
        />
        <Route path="/chatbot" element={<CybersecurityChatbot />} />
        <Route path="/api-tool" element={<APIToolPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/phishing-simulator" element={<PhishingEmailSimulator />} />
        <Route path="/sms-simulator" element={<SMSScamSimulator />} />
        <Route path="/certification-exam" element={<CertificationExam />} />
        <Route path="/my-certificate" element={<CertificatePage />} />
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter basename="/Cybersafe">
          <AppInner />
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
