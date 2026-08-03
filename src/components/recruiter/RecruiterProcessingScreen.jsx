import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Building2, Sparkles } from 'lucide-react';

export default function RecruiterProcessingScreen({ onComplete }) {
  const [percent, setPercent] = useState(25);
  const [stepState, setStepState] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPercent(50);
      setStepState(2);
    }, 1000);

    const t2 = setTimeout(() => {
      setPercent(75);
      setStepState(3);
    }, 2200);

    const t3 = setTimeout(() => {
      setPercent(100);
      setStepState(4);
    }, 3400);

    const t4 = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="processing-screen-container">
      {/* Top Processing Graphic Illustration */}
      <div className="processing-illustration-wrap">
        <div className="illustration-glow-bg"></div>
        <div className="illustration-window-card">
          <div className="window-top-dots">
            <span className="dot dot-r"></span>
            <span className="dot dot-y"></span>
            <span className="dot dot-g"></span>
          </div>
          <div className="window-body-content">
            <div className="window-avatar-circle">🏢</div>
            <div className="window-lines-stack">
              <div className="window-line line-long"></div>
              <div className="window-line line-med"></div>
              <div className="window-line line-short"></div>
            </div>
          </div>
          <div className="window-gear-badge">
            <Building2 size={18} color="#FFFFFF" />
          </div>
        </div>
        <Sparkles size={16} className="sparkle-icon spark-1" color="#818CF8" />
        <Sparkles size={18} className="sparkle-icon spark-2" color="#818CF8" />
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="processing-title">Setting up your Recruiter Profile...</h2>
      <p className="processing-subtitle">
        Please wait while we validate your company details and create your employer account.
      </p>

      {/* Vertical Sequence Checklist Timeline */}
      <div className="processing-timeline-stack">
        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 1 ? 'completed' : 'pending'}`}>
            <CheckCircle2 size={20} />
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Validating Company Details</div>
            <div className="timeline-step-sub">All company details verified successfully!</div>
          </div>
        </div>

        <div className="timeline-connector-line"></div>

        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 2 ? 'completed' : 'pending'}`}>
            {stepState >= 2 ? <CheckCircle2 size={20} /> : <span className="dotted-spin">⚪</span>}
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Saving Recruiter Profile</div>
            <div className="timeline-step-sub">Storing your hiring preferences and domain details.</div>
          </div>
        </div>

        <div className="timeline-connector-line"></div>

        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 3 ? 'completed' : 'pending'}`}>
            {stepState >= 3 ? <CheckCircle2 size={20} /> : <span className="dotted-spin">⚪</span>}
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Creating Recruiter Account</div>
            <div className="timeline-step-sub">Configuring your dashboard access and employer portal.</div>
          </div>
        </div>

        <div className="timeline-connector-line"></div>

        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 4 ? 'completed' : 'pending'}`}>
            {stepState >= 4 ? <CheckCircle2 size={20} /> : <span className="dotted-spin-pulse">⚪</span>}
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Registration Complete</div>
            <div className="timeline-step-sub">Redirecting to your Recruiter Dashboard...</div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Percentage Indicator */}
      <div className="processing-bar-wrap">
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${percent}%` }}></div>
        </div>
        <span className="percent-text">{percent}%</span>
      </div>

      {/* Security Footer Message */}
      <div className="security-notice-row">
        <ShieldCheck size={18} color="#6366F1" />
        <span>Your company data is secure with us. We protect employer confidentiality.</span>
      </div>
    </div>
  );
}
