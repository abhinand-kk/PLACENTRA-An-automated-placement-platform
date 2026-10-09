import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Building2, Sparkles, Check, ArrowRight } from 'lucide-react';
import './RecruiterProcessingScreen.css';

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

  // SVG Circumference calculation for radius r = 52
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percent) / 100;

  const isComplete = stepState === 4 || percent === 100;

  const stages = [
    {
      id: 1,
      title: 'Validating Company Details',
      subtitle: 'All company details verified successfully!',
      inProgressText: 'Verifying company organization & work domain...'
    },
    {
      id: 2,
      title: 'Saving Recruiter Profile',
      subtitle: 'Storing your hiring preferences and domain details.',
      inProgressText: 'Configuring hiring volume and recruiting parameters...'
    },
    {
      id: 3,
      title: 'Creating Recruiter Account',
      subtitle: 'Configuring your dashboard access and employer portal.',
      inProgressText: 'Establishing employer portal & credentials...'
    },
    {
      id: 4,
      title: 'Registration Complete',
      subtitle: 'Redirecting to your Recruiter Dashboard...',
      inProgressText: 'Finalizing setup...'
    }
  ];

  return (
    <div className="recruiter-processing-layout">
      
      {/* Central Animated Hero Progress Ring */}
      <div className="hero-ring-container">
        <div className={`ring-halo-bg ${isComplete ? 'completed' : ''}`}></div>
        
        <svg className="svg-progress-ring" viewBox="0 0 120 120">
          <circle 
            className="ring-bg-track" 
            cx="60" 
            cy="60" 
            r={radius} 
            fill="none" 
          />
          <circle 
            className={`ring-fill-bar ${isComplete ? 'complete' : ''}`} 
            cx="60" 
            cy="60" 
            r={radius} 
            fill="none" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="ring-center-node">
          {isComplete ? (
            <>
              <CheckCircle2 size={36} color="#10B981" />
              <span className="center-status-badge complete" style={{ marginTop: '4px' }}>100% Ready</span>
            </>
          ) : (
            <>
              <span className="center-percent-text">{percent}%</span>
              <span className="center-status-badge">In Progress</span>
            </>
          )}
        </div>
      </div>

      {/* Main Title & Subtitle */}
      {isComplete ? (
        <>
          <h2 className="processing-title-text" style={{ color: '#0F172A' }}>
            Registration Complete! <Sparkles size={20} color="#10B981" style={{ display: 'inline', marginLeft: '6px' }} />
          </h2>
          <p className="processing-subtitle-text" style={{ color: '#047857', fontWeight: 600 }}>
            Redirecting to your Recruiter Dashboard...
          </p>
        </>
      ) : (
        <>
          <h2 className="processing-title-text">Setting up your Recruiter Profile...</h2>
          <p className="processing-subtitle-text">
            Please wait while we validate your company details and create your employer account.
          </p>
        </>
      )}

      {/* Timeline Steps Card Stack */}
      <div className="processing-timeline-card">
        {stages.map((stage, idx) => {
          const isStageCompleted = stepState > stage.id || isComplete;
          const isStageCurrent = stepState === stage.id && !isComplete;
          const isStagePending = stepState < stage.id;

          return (
            <React.Fragment key={stage.id}>
              <div className="timeline-step-entry">
                <div className={`timeline-step-badge ${isStageCompleted ? 'completed' : isStageCurrent ? 'current' : 'pending'}`}>
                  {isStageCompleted ? (
                    <CheckCircle2 size={18} color="#10B981" />
                  ) : isStageCurrent ? (
                    <span className="active-step-spinner"></span>
                  ) : (
                    <span>{stage.id}</span>
                  )}
                </div>

                <div className="timeline-text-col">
                  <div className={`timeline-step-heading ${isStageCompleted ? 'completed' : isStageCurrent ? 'current' : ''}`}>
                    <span>{stage.title}</span>
                    {isStageCompleted && (
                      <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700 }}>Done</span>
                    )}
                    {isStageCurrent && (
                      <span style={{ fontSize: '11.5px', color: '#4F46E5', fontWeight: 700 }}>Processing</span>
                    )}
                  </div>
                  <div className="timeline-step-desc">
                    {isStageCompleted || isStagePending ? stage.subtitle : stage.inProgressText}
                  </div>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className={`timeline-connector-bar ${isStageCompleted ? 'completed' : isStageCurrent ? 'current' : ''}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Overall Progress Bar */}
      <div className="overall-progress-track">
        <div 
          className={`overall-progress-fill ${isComplete ? 'completed' : ''}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      {/* Security Footer Notice */}
      <div className="security-notice-box">
        <ShieldCheck size={18} color="#4F46E5" />
        <span>Your company data is secure with us. We protect employer confidentiality.</span>
      </div>

    </div>
  );
}
