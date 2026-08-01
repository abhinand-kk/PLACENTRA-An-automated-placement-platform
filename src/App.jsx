import React, { useState } from 'react';
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

export default function App() {
  // Default to 'officer' as requested, with instant toggle support for student & recruiter
  const [role, setRole] = useState('officer');

  return (
    <div className="placentra-app">
      <Navbar activeRole={role} onRoleChange={setRole} />
      <main>
        <Hero role={role} />
        <PlacementJourney role={role} />
        <HowItWorks role={role} />
        <AIFeatures role={role} />
        <DarkStatsBanner />
        <PartnerUniversities />
        <RecruitingCompanies />
        <Testimonials role={role} />
        <CTABanner role={role} />
      </main>
      <Footer />
    </div>
  );
}
