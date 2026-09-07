import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialRecruiterRegistrationState } from '../../context/RecruiterRegistrationState';
import RecruiterSidebar from './RecruiterSidebar';
import Step1BasicCompanyDetails from './steps/Step1BasicCompanyDetails';
import Step2HiringPreferences from './steps/Step2HiringPreferences';
import Step3RecruiterReviewSubmit from './steps/Step3RecruiterReviewSubmit';
import StepSavedToast from '../common/StepSavedToast';
import { ArrowLeft } from 'lucide-react';
import '../wizard/Wizard.css';

export default function RecruiterRegistrationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [recruiterState, setRecruiterState] = useState(initialRecruiterRegistrationState);

  // Toast state
  const [toastInfo, setToastInfo] = useState({ show: false, summary: '' });

  const handleStateChange = (section, sectionData) => {
    setRecruiterState(prev => ({
      ...prev,
      [section]: sectionData
    }));
  };

  const getStepSummary = (stepNum) => {
    const c = recruiterState.companyDetails;
    const h = recruiterState.hiringPreferences;

    switch (stepNum) {
      case 1:
        return c?.companyName ? `${c.companyName} • ${c.recruiterName || 'Recruiter'} (${c.officialEmail || ''})` : 'Basic company details saved.';
      case 2:
        return h?.packageOffered ? `Package: ${h.packageOffered} LPA • Month: ${h.expectedHiringMonth || 'TBD'}` : 'Hiring preferences & package details saved.';
      default:
        return 'Recruiter step details saved successfully.';
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
    navigate('/recruiter/dashboard');
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="wizard-page-container">
      {/* Top Header */}
      <header className="wizard-top-header">
        <div className="wizard-header-title">
          PLACENTRA <span>| Employer Portal</span>
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
        <RecruiterSidebar 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />

        {/* Right Main Content Panel */}
        <main className="wizard-content-panel">
          {currentStep === 1 && (
            <Step1BasicCompanyDetails 
              state={recruiterState} 
              onChange={handleStateChange}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2HiringPreferences 
              state={recruiterState} 
              onChange={handleStateChange}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3RecruiterReviewSubmit 
              state={recruiterState} 
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
