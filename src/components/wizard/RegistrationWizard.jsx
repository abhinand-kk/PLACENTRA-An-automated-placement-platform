import React, { useState } from 'react';
import { initialStudentRegistrationState } from '../../context/StudentRegistrationState';
import WizardSidebar from './WizardSidebar';
import Step1BasicDetails from './steps/Step1BasicDetails';
import Step2ContactVerification from './steps/Step2ContactVerification';
import Step3CurrentEducation from './steps/Step3CurrentEducation';
import Step4PreviousEducation from './steps/Step4PreviousEducation';
import Step5Experience from './steps/Step5Experience';
import Step6Documents from './steps/Step6Documents';
import Step7ReviewSubmit from './steps/Step7ReviewSubmit';
import StepSavedToast from '../common/StepSavedToast';
import { ArrowLeft } from 'lucide-react';
import './Wizard.css';

export default function RegistrationWizard({ onExitWizard }) {
  // Single StudentRegistrationState object maintained throughout registration
  const [wizardState, setWizardState] = useState(initialStudentRegistrationState);
  const [activeStep, setActiveStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);

  // Toast state
  const [toastInfo, setToastInfo] = useState({ show: false, summary: '' });

  const handleStateChange = (sectionKey, updatedSectionData) => {
    setWizardState(prev => ({
      ...prev,
      [sectionKey]: updatedSectionData
    }));
  };

  const getStepSummary = (stepNum) => {
    const b = wizardState.basicDetails;
    const c = wizardState.contactVerification;
    const edu = wizardState.currentEducation;

    switch (stepNum) {
      case 1:
        return b?.firstName ? `${b.firstName} ${b.lastName} • Reg: ${b.registerNumber || 'Student'}` : 'Basic details saved.';
      case 2:
        return c?.officialEmail ? `Email: ${c.officialEmail} • Mobile: ${c.mobileNumber || 'Verified'}` : 'Contact information saved.';
      case 3:
        return edu?.institutionName ? `${edu.institutionName} • ${edu.degreeCourse || 'Degree'}` : 'Current education saved.';
      case 4:
        return 'Previous academic scores & records saved.';
      case 5:
        return 'Skills, internships & project details saved.';
      case 6:
        return 'Resume and documents uploaded successfully.';
      default:
        return 'Step data saved successfully.';
    }
  };

  const handleNextStep = () => {
    // Generate summary for the step being completed
    const summaryText = getStepSummary(activeStep);

    const next = Math.min(activeStep + 1, 7);
    setActiveStep(next);
    if (next > maxReachedStep) {
      setMaxReachedStep(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show step saved toast
    setToastInfo({ show: true, summary: summaryText });
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStep = (stepId) => {
    // Only allow navigating to stepId if it's less than or equal to maxReachedStep
    if (stepId <= maxReachedStep || stepId <= activeStep) {
      setActiveStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderActiveStepComponent = () => {
    switch (activeStep) {
      case 1:
        return <Step1BasicDetails state={wizardState} onChange={handleStateChange} onNext={handleNextStep} />;
      case 2:
        return <Step2ContactVerification state={wizardState} onChange={handleStateChange} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 3:
        return <Step3CurrentEducation state={wizardState} onChange={handleStateChange} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 4:
        return <Step4PreviousEducation state={wizardState} onChange={handleStateChange} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 5:
        return <Step5Experience state={wizardState} onChange={handleStateChange} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 6:
        return <Step6Documents state={wizardState} onChange={handleStateChange} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 7:
        return <Step7ReviewSubmit state={wizardState} onJumpToStep={handleSelectStep} onBack={handlePrevStep} onCompleteDashboard={onExitWizard} />;
      default:
        return <Step1BasicDetails state={wizardState} onChange={handleStateChange} onNext={handleNextStep} />;
    }
  };

  return (
    <div className="wizard-page-container">
      {/* Top Header Bar */}
      <header className="wizard-top-header">
        <div className="wizard-header-title">
          PLACENTRA – <span>Student Registration Flow (7 Steps)</span>
        </div>
        <div className="wizard-header-right">
          <button className="btn-header-back" onClick={onExitWizard}>
            <ArrowLeft size={14} />
            <span>Back to Landing Page</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="wizard-body-layout">
        {/* Left Sidebar */}
        <WizardSidebar 
          activeStep={activeStep} 
          onSelectStep={handleSelectStep}
          maxReachedStep={maxReachedStep}
        />

        {/* Right Content Panel */}
        <main className="wizard-content-panel">
          {renderActiveStepComponent()}
        </main>
      </div>

      {/* Toast Component */}
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
