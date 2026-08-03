import React from 'react';
import { Building2, CheckCircle2, HelpCircle } from 'lucide-react';

export default function RecruiterSidebar({ currentStep = 1, completedSteps = [] }) {
  const steps = [
    { id: 1, name: 'Basic Company Details', desc: 'Company & recruiter info' },
    { id: 2, name: 'Hiring Preferences', desc: 'Target roles & packages' },
    { id: 3, name: 'Review & Submit', desc: 'Final registration' }
  ];

  return (
    <aside className="wizard-sidebar">
      <div>
        {/* Logo Banner */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Building2 size={20} />
          </div>
          <span className="sidebar-logo-text">PLACENTRA</span>
        </div>

        {/* Sidebar Title */}
        <div className="sidebar-heading">
          <h1 className="sidebar-title">Recruiter Registration</h1>
          <p className="sidebar-subtitle">Complete your employer account setup</p>
        </div>

        {/* Steps List */}
        <div className="sidebar-steps-list">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <div 
                key={step.id}
                className={`step-item-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-num-badge">
                  {isCompleted ? <CheckCircle2 size={16} /> : step.id}
                </div>
                <div className="step-text-wrap">
                  <span className="step-name">{step.name}</span>
                  <span className="step-desc">{step.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Card */}
      <div className="sidebar-help-card">
        <HelpCircle size={22} className="help-icon" />
        <div className="help-title">Need Assistance?</div>
        <div className="help-desc">Our recruiter support team is available 24/7.</div>
        <button className="btn-contact-support">Contact Support</button>
      </div>
    </aside>
  );
}
