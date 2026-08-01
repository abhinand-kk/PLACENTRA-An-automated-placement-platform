import React from 'react';
import { Shield, User, Mail, GraduationCap, Code2, Briefcase, FileText, CheckCircle2, Headphones } from 'lucide-react';

export default function WizardSidebar({ activeStep, onSelectStep, maxReachedStep }) {
  const steps = [
    { id: 1, title: 'Basic Details', desc: 'Tell us about yourself', icon: <User size={14} /> },
    { id: 2, title: 'Contact Verification', desc: 'Verify your email & mobile', icon: <Mail size={14} /> },
    { id: 3, title: 'Academic Details', desc: 'Your education information', icon: <GraduationCap size={14} /> },
    { id: 4, title: 'Skills & Projects', desc: 'Your skills and projects', icon: <Code2 size={14} /> },
    { id: 5, title: 'Internships & Certifications', desc: 'Experience & achievements', icon: <Briefcase size={14} /> },
    { id: 6, title: 'Documents', desc: 'Upload your documents', icon: <FileText size={14} /> },
    { id: 7, title: 'Review & Submit', desc: 'Review and finish', icon: <CheckCircle2 size={14} /> }
  ];

  return (
    <aside className="wizard-sidebar">
      <div>
        {/* Brand Header */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={18} />
          </div>
          <div>
            <span className="sidebar-logo-text">PLACENTRA</span>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500 }}>Connecting Talent. Creating Futures.</div>
          </div>
        </div>

        {/* Title */}
        <div className="sidebar-heading">
          <h2 className="sidebar-title">Student Registration</h2>
          <p className="sidebar-subtitle">Create your profile in 7 simple steps</p>
        </div>

        {/* Vertical Step Buttons */}
        <div className="sidebar-steps-list">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = step.id < activeStep || (maxReachedStep && step.id <= maxReachedStep && !isActive);

            return (
              <button
                key={step.id}
                className={`step-item-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => onSelectStep(step.id)}
              >
                <div className="step-num-badge">
                  {isCompleted ? <CheckCircle2 size={14} /> : step.id}
                </div>
                <div className="step-text-wrap">
                  <span className="step-name">{step.title}</span>
                  <span className="step-desc">{step.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Support Card at Bottom */}
      <div className="sidebar-help-card">
        <Headphones size={22} className="help-icon" />
        <div className="help-title">Need Help?</div>
        <div className="help-desc">We're here to assist you</div>
        <button className="btn-contact-support">Contact Support</button>
      </div>
    </aside>
  );
}
