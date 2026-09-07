import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialPlacementOfficerRegistrationState } from '../../context/PlacementOfficerRegistrationState';
import OfficerSidebar from './OfficerSidebar';
import Step1OfficerBasicDetails from './steps/Step1OfficerBasicDetails';
import Step2OfficerInstitutionDetails from './steps/Step2OfficerInstitutionDetails';
import Step3OfficerReviewSubmit from './steps/Step3OfficerReviewSubmit';
import StepSavedToast from '../common/StepSavedToast';
import { ArrowLeft } from 'lucide-react';
import '../wizard/Wizard.css';

export default function PlacementOfficerRegistrationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [officerState, setOfficerState] = useState(initialPlacementOfficerRegistrationState);

  // Toast state
  const [toastInfo, setToastInfo] = useState({ show: false, summary: '' });

  const handleStateChange = (section, sectionData) => {
    setOfficerState(prev => ({
      ...prev,
      [section]: sectionData
    }));
  };

  const getStepSummary = (stepNum) => {
    const o = officerState.officerDetails;
    const inst = officerState.institutionDetails;

    switch (stepNum) {
      case 1:
        return o?.fullName ? `${o.fullName} • ${o.designation || 'Officer'} (${o.officialEmail || ''})` : 'Officer contact details saved.';
      case 2:
        return inst?.institutionName ? `${inst.institutionName} • Strength: ${inst.studentStrength || '0'} Students` : 'Institution details saved.';
      default:
        return 'Placement officer step details saved successfully.';
    }
  };

  const handleNextStep = () => {
    const summaryText = getStepSummary(currentStep);

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    setCurrentStep(prev => Math.min(3, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger floating toast
    setToastInfo({ show: true, summary: summaryText });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (targetStep) => {
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteDashboardRedirect = () => {
    navigate('/placement-officer/dashboard');
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="wizard-page-container">
      {/* Top Header */}
      <header className="wizard-top-header">
        <div className="wizard-header-title">
          PLACENTRA <span>| Placement Officer Portal</span>
        </div>
        <div className="wizard-header-right">
          <button className="btn-header-back" onClick={handleExit}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="wizard-body-layout">
        {/* Left Dark Sidebar */}
        <OfficerSidebar 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />

        {/* Right Main Content Panel */}
        <main className="wizard-content-panel">
          {currentStep === 1 && (
            <Step1OfficerBasicDetails 
              state={officerState} 
              onChange={handleStateChange}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2OfficerInstitutionDetails 
              state={officerState} 
              onChange={handleStateChange}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3OfficerReviewSubmit 
              state={officerState} 
              onJumpToStep={handleJumpToStep}
              onBack={handlePrevStep}
              onCompleteDashboard={handleCompleteDashboardRedirect}
            />
          )}
        </main>
      </div>

      {/* Step Saved Toast */}
      {toastInfo.show && (
        <StepSavedToast 
          title="Saved Successfully"
          summary={toastInfo.summary}
          onClose={() => setToastInfo({ show: false, summary: '' })}
        />
      )}
    </div>
  );
}
