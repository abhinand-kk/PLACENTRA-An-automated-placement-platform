import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Settings, Sparkles } from 'lucide-react';

export default function RegistrationProcessingScreen({ onComplete }) {
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
      setPercent(95);
      setStepState(4);
    }, 3400);

    const t4 = setTimeout(() => {
      setPercent(100);
      setStepState(5);
    }, 4500);

    const t5 = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
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
            <div className="window-avatar-circle">👤</div>
            <div className="window-lines-stack">
              <div className="window-line line-long"></div>
              <div className="window-line line-med"></div>
              <div className="window-line line-short"></div>
            </div>
          </div>
          <div className="window-gear-badge">
            <Settings size={20} color="#FFFFFF" className="spin-gear-icon" />
          </div>
        </div>
        <Sparkles size={16} className="sparkle-icon spark-1" color="#818CF8" />
        <Sparkles size={18} className="sparkle-icon spark-2" color="#818CF8" />
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="processing-title">Creating your PLACENTRA Profile...</h2>
      <p className="processing-subtitle">
        Please wait while we validate your information and set up your account.
      </p>

      {/* Vertical Sequence Checklist Timeline */}
      <div className="processing-timeline-stack">
        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 1 ? 'completed' : 'pending'}`}>
            <CheckCircle2 size={20} />
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Validating Details</div>
            <div className="timeline-step-sub">All your information looks good!</div>
          </div>
        </div>

        <div className="timeline-connector-line"></div>

        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 2 ? 'completed' : 'pending'}`}>
            {stepState >= 2 ? <CheckCircle2 size={20} /> : <span className="dotted-spin">⚪</span>}
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Verifying Documents</div>
            <div className="timeline-step-sub">Your documents have been verified successfully.</div>
          </div>
        </div>

        <div className="timeline-connector-line"></div>

        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 3 ? 'completed' : 'pending'}`}>
            {stepState >= 3 ? <CheckCircle2 size={20} /> : <span className="dotted-spin">⚪</span>}
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Setting up Your Profile</div>
            <div className="timeline-step-sub">We're creating your student profile.</div>
          </div>
        </div>

        <div className="timeline-connector-line"></div>

        <div className="timeline-item-row">
          <div className={`timeline-icon-circle ${stepState >= 4 ? (stepState === 5 ? 'completed' : 'active-loading') : 'pending'}`}>
            {stepState === 5 ? <CheckCircle2 size={20} /> : <span className="dotted-spin-pulse">⚪</span>}
          </div>
          <div className="timeline-text-col">
            <div className="timeline-step-title">Finalizing Setup</div>
            <div className="timeline-step-sub">Almost done! Please wait a moment.</div>
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
        <span>Your data is secure with us. We never share your information.</span>
      </div>
    </div>
  );
}
