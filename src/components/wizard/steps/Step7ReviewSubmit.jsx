import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, Edit3, User, Mail, GraduationCap, Briefcase, FileText, AlertTriangle, Sparkles } from 'lucide-react';

export default function Step7ReviewSubmit({ state, onJumpToStep, onBack, onCompleteDashboard }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const { basicDetails, contactVerification, currentEducation, experiences, documents } = state;

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setProgressPercent(25);
  };

  useEffect(() => {
    if (isSubmitting) {
      const t1 = setTimeout(() => setProgressPercent(50), 600);
      const t2 = setTimeout(() => setProgressPercent(75), 1200);
      const t3 = setTimeout(() => {
        setProgressPercent(100);
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isSubmitting]);

  if (isSuccess) {
    return (
      <div className="success-screen-card">
        <div className="success-badge-circle">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="success-title">Registration Successful!</h2>
        <p className="success-desc">
          Your profile has been created successfully.<br />
          Welcome to PLACENTRA. You can now explore opportunities and apply for internships and placements.
        </p>

        <button className="btn-wizard-primary" style={{ padding: '14px 36px', fontSize: '15px' }} onClick={onCompleteDashboard}>
          <span>Go to Dashboard</span>
          <Sparkles size={18} />
        </button>

        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '32px' }}>
          Note: All data shown is for UI/UX reference only.
        </p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="submit-loading-card">
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          Creating your PLACENTRA Profile...
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
          Please wait while we validate your information and set up your account.
        </p>

        <div className="submit-spinner"></div>

        <div className="loading-progress-bar">
          <div className="loading-progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div className="checklist-step">
            <span style={{ color: progressPercent >= 25 ? '#10B981' : '#94A3B8' }}>
              {progressPercent >= 25 ? '✓' : '⚪'}
            </span>
            <span><strong>Validating Details:</strong> All information looks good!</span>
          </div>
          <div className="checklist-step">
            <span style={{ color: progressPercent >= 50 ? '#10B981' : '#94A3B8' }}>
              {progressPercent >= 50 ? '✓' : '⚪'}
            </span>
            <span><strong>Verifying Documents:</strong> Your documents are verified successfully!</span>
          </div>
          <div className="checklist-step">
            <span style={{ color: progressPercent >= 75 ? '#10B981' : '#94A3B8' }}>
              {progressPercent >= 75 ? '✓' : '⚪'}
            </span>
            <span><strong>Creating Student Profile:</strong> Setting up your account...</span>
          </div>
          <div className="checklist-step">
            <span style={{ color: progressPercent >= 100 ? '#10B981' : '#94A3B8' }}>
              {progressPercent >= 100 ? '✓' : '⚪'}
            </span>
            <span><strong>Finalizing Setup:</strong> Almost done!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <CheckCircle2 size={22} />
        </div>
        <div className="step-header-text">
          <h2>Review and Submit</h2>
          <p>Please verify all your information carefully before submitting.</p>
        </div>
      </div>

      {/* Alert Warning */}
      <div className="wizard-alert alert-amber">
        <AlertTriangle size={18} className="flex-shrink-0" />
        <div>
          Please verify all the details below. After you click <strong>"Submit Registration"</strong>, you will not be able to edit any information.
        </div>
      </div>

      {/* Summary Group 1: Basic Details */}
      <div className="review-group-card">
        <div className="review-header">
          <div className="review-title-wrap">
            <User size={18} color="#4F46E5" />
            <span className="review-title">Basic Details</span>
          </div>
          <button className="btn-edit-section" onClick={() => onJumpToStep(1)}>
            <Edit3 size={14} /> Edit
          </button>
        </div>

        <div className="review-grid">
          <div>
            <div className="review-item-label">Full Name</div>
            <div className="review-item-val">{basicDetails.firstName} {basicDetails.middleName} {basicDetails.lastName}</div>
          </div>
          <div>
            <div className="review-item-label">Date of Birth</div>
            <div className="review-item-val">{basicDetails.dob}</div>
          </div>
          <div>
            <div className="review-item-label">Gender / Blood Group</div>
            <div className="review-item-val">{basicDetails.gender} | {basicDetails.bloodGroup}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div className="review-item-label">College / University</div>
            <div className="review-item-val">{basicDetails.college}</div>
          </div>
          <div>
            <div className="review-item-label">Course & Branch</div>
            <div className="review-item-val">{basicDetails.course} ({basicDetails.branch})</div>
          </div>
          <div>
            <div className="review-item-label">Roll Number</div>
            <div className="review-item-val">{basicDetails.rollNumber}</div>
          </div>
          <div>
            <div className="review-item-label">Semester / Admission Year</div>
            <div className="review-item-val">Sem {basicDetails.currentSemester} | Year {basicDetails.admissionYear}</div>
          </div>
        </div>
      </div>

      {/* Summary Group 2: Contact Details */}
      <div className="review-group-card">
        <div className="review-header">
          <div className="review-title-wrap">
            <Mail size={18} color="#4F46E5" />
            <span className="review-title">Contact Details</span>
          </div>
          <button className="btn-edit-section" onClick={() => onJumpToStep(2)}>
            <Edit3 size={14} /> Edit
          </button>
        </div>

        <div className="review-grid">
          <div>
            <div className="review-item-label">Primary Email</div>
            <div className="review-item-val">{basicDetails.primaryEmail} <span className="badge-verified">Verified</span></div>
          </div>
          <div>
            <div className="review-item-label">Mobile Number</div>
            <div className="review-item-val">+91 {basicDetails.mobileNumber} <span className="badge-verified">Verified</span></div>
          </div>
          <div>
            <div className="review-item-label">Address</div>
            <div className="review-item-val">{contactVerification.address.city}, {contactVerification.address.state} - {contactVerification.address.pincode}</div>
          </div>
        </div>
      </div>

      {/* Summary Group 3: Current Education */}
      <div className="review-group-card">
        <div className="review-header">
          <div className="review-title-wrap">
            <GraduationCap size={18} color="#4F46E5" />
            <span className="review-title">Current Education</span>
          </div>
          <button className="btn-edit-section" onClick={() => onJumpToStep(3)}>
            <Edit3 size={14} /> Edit
          </button>
        </div>

        <div className="review-grid">
          <div>
            <div className="review-item-label">Program & Major</div>
            <div className="review-item-val">{currentEducation.program} ({currentEducation.major})</div>
          </div>
          <div>
            <div className="review-item-label">Batch & Duration</div>
            <div className="review-item-val">{currentEducation.batch} ({currentEducation.startDate} - {currentEducation.expectedEndDate})</div>
          </div>
          <div>
            <div className="review-item-label">Performance</div>
            <div className="review-item-val">{currentEducation.percentage}{currentEducation.scoreType} | {currentEducation.totalBacklogs} Backlogs</div>
          </div>
        </div>
      </div>

      {/* Summary Group 4: Experience */}
      <div className="review-group-card">
        <div className="review-header">
          <div className="review-title-wrap">
            <Briefcase size={18} color="#4F46E5" />
            <span className="review-title">Internships & Experience</span>
          </div>
          <button className="btn-edit-section" onClick={() => onJumpToStep(5)}>
            <Edit3 size={14} /> Edit
          </button>
        </div>

        {experiences.map((exp) => (
          <div key={exp.id} style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
            • <strong>{exp.company}</strong> — {exp.jobTitle} ({exp.startDate} - {exp.endDate})
          </div>
        ))}
      </div>

      {/* Summary Group 5: Documents */}
      <div className="review-group-card">
        <div className="review-header">
          <div className="review-title-wrap">
            <FileText size={18} color="#4F46E5" />
            <span className="review-title">Documents</span>
          </div>
          <button className="btn-edit-section" onClick={() => onJumpToStep(6)}>
            <Edit3 size={14} /> Edit
          </button>
        </div>

        <div className="review-grid">
          <div><CheckCircle2 size={14} color="#10B981" /> Profile Photo</div>
          <div><CheckCircle2 size={14} color="#10B981" /> Resume</div>
          <div><CheckCircle2 size={14} color="#10B981" /> Class X Certificate</div>
          <div><CheckCircle2 size={14} color="#10B981" /> Class XII Certificate</div>
          <div><CheckCircle2 size={14} color="#10B981" /> Degree Marksheet (DigiLocker)</div>
        </div>
      </div>

      {/* Caution alert */}
      <div className="wizard-alert alert-red" style={{ fontSize: '12px' }}>
        <AlertTriangle size={16} />
        <span>Documents once saved and verified cannot be changed later.</span>
      </div>

      {/* Footer Actions */}
      <div className="wizard-footer-actions">
        <button className="btn-wizard-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button className="btn-wizard-primary" style={{ backgroundColor: '#4F46E5' }} onClick={handleFinalSubmit}>
          <span>Submit Registration</span>
        </button>
      </div>
    </div>
  );
}
