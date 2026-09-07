import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PlacementJourney from './components/PlacementJourney';
import HowItWorks from './components/HowItWorks';
import AIFeatures from './components/AIFeatures';
import DarkStatsBanner from './components/DarkStatsBanner';
import PartnerUniversities from './components/PartnerUniversities';
import RecruitingCompanies from './components/RecruitingCompanies';
import Testimonials from './components/Testimonials';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';
import RegistrationWizard from './components/wizard/RegistrationWizard';
import RecruiterRegistrationWizard from './components/recruiter/RecruiterRegistrationWizard';
import RecruiterDashboard from './components/recruiter/RecruiterDashboard';
import PlacementOfficerRegistrationWizard from './components/officer/PlacementOfficerRegistrationWizard';
import OfficerDashboard from './components/officer/OfficerDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import StudentProfileEdit from './components/student/StudentProfileEdit';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

function StudentRegisterRoute() {
  const navigate = useNavigate();
  return <RegistrationWizard onExitWizard={() => navigate('/')} />;
}

function MainLandingApp() {
  const [role, setRole] = useState('officer');
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'wizard'

  if (viewMode === 'wizard') {
    return <RegistrationWizard onExitWizard={() => setViewMode('landing')} />;
  }

  return (
    <div className="placentra-app">
      <Navbar 
        activeRole={role} 
        onRoleChange={setRole} 
        onOpenWizard={() => setViewMode('wizard')} 
      />
      <main>
        <Hero role={role} onOpenWizard={() => setViewMode('wizard')} />
        <PlacementJourney role={role} />
        <HowItWorks role={role} />
        <AIFeatures role={role} />
        <DarkStatsBanner />
        <PartnerUniversities />
        <RecruitingCompanies />
        <Testimonials role={role} />
        <CTABanner role={role} onOpenWizard={() => setViewMode('wizard')} />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLandingApp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student/register" element={<StudentRegisterRoute />} />
      <Route path="/recruiter/register" element={<RecruiterRegistrationWizard />} />
      <Route path="/placement-officer/register" element={<PlacementOfficerRegistrationWizard />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile/edit" element={<StudentProfileEdit />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['placement_officer']} />}>
        <Route path="/placement-officer/dashboard" element={<OfficerDashboard />} />
      </Route>

      <Route path="*" element={<MainLandingApp />} />
    </Routes>
  );
}
