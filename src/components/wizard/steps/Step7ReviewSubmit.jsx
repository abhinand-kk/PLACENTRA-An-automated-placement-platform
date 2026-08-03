import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Edit3, User, Mail, GraduationCap, Briefcase, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import RegistrationProcessingScreen from '../RegistrationProcessingScreen';

export default function Step7ReviewSubmit({ state, onJumpToStep, onBack, onCompleteDashboard }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { basicDetails, contactVerification, currentEducation, previousEducation, experiences, documents } = state;

  const basic = basicDetails || {};
  const contact = contactVerification || {};
  const currEdu = currentEducation || {};
  const prevEdu = previousEducation || {};
  const c12 = prevEdu.class12 || {};
  const c10 = prevEdu.class10 || {};
  const expList = experiences || [];
  const docs = documents || {};

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
  };

  if (isSubmitting) {
    return (
      <RegistrationProcessingScreen 
        onComplete={onCompleteDashboard} 
      />
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
          <p>Please review all your information carefully before submitting. You won't be able to edit after submission.</p>
        </div>
      </div>

      {/* Yellow Warning Banner */}
      <div className="wizard-alert alert-amber" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>Please verify all the details below. After you click 'Submit Registration', you will not be able to edit any information.</span>
        </div>
        <div style={{ fontWeight: 700, marginLeft: '26px' }}>
          Make sure everything is correct before submitting.
        </div>
      </div>

      {/* 6 Summary Cards Grid (3 Columns x 2 Rows) */}
      <div className="review-cards-grid-3">
        {/* CARD 1: Basic Details */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <User size={18} color="#4F46E5" />
              <span className="review-card-title">Basic Details</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(1)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Full Name</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.firstName || 'Abhinand'} {basic.middleName || 'K K'} {basic.lastName || 'K K'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Date of Birth</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.dob || '01/06/2004'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Gender</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.gender || 'Male'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Blood Group</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.bloodGroup || 'B+'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">College / University</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.college || 'Amal Jyothi College of Engineering, Kottayam'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Course / Program</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.course || 'MCA (Integrated)'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Roll Number / University ID</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.rollNumber || 'AJC25MCA2002'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Current Semester</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.currentSemester || '3'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Admission Year</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.admissionYear || '2024'}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Contact Details */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Mail size={18} color="#4F46E5" />
              <span className="review-card-title">Contact Details</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(2)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Primary Email</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">
                {basic.primaryEmail || 'kkabhinand05@gmail.com'} &nbsp;
                <span className="badge-verified-tiny">Verified</span>
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Mobile Number</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">
                +91 {basic.mobileNumber || '916235407730'} &nbsp;
                <span className="badge-verified-tiny">Verified</span>
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Alternate Email</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">-</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Alternate Mobile</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">-</span>
            </div>
            <div className="kv-row" style={{ alignItems: 'flex-start' }}>
              <span className="kv-key">Address</span>
              <span className="kv-sep">:</span>
              <span className="kv-val" style={{ lineHeight: 1.5 }}>
                Santhom Mens Hostel, Amal Jyothi College of Engineering, Kanjirappally, Erumeli, Kerala - 686518
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Current / Most Recent Education */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <GraduationCap size={18} color="#4F46E5" />
              <span className="review-card-title">Current / Most Recent Education</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(3)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Field of Study</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{currEdu.fieldOfStudy || 'Computer Applications'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Program</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{currEdu.program || 'MCA (Integrated)'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Major / Branch</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{currEdu.major || 'Artificial Intelligence'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">College / University</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">Amal Jyothi College of Engineering, Kottayam</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Start Date</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">Aug 2023</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">End Date (Expected)</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">May 2026</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Batch</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">2023-2026</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Current Semester</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{currEdu.currentSemester || '3'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Percentage (Till Now)</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">88.50%</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Backlogs</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">0</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Previous Education */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <GraduationCap size={18} color="#4F46E5" />
              <span className="review-card-title">Previous Education</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(4)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-section-subtitle">Class XII (10+2)</div>
          <div className="review-kv-table" style={{ marginBottom: '14px' }}>
            <div className="kv-row">
              <span className="kv-key">Board</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c12.board || 'CBSE'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">School</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c12.schoolName || 'Delhi Public School, Kochi'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Year of Passing</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c12.yearOfPassing || '2024'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Percentage</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c12.percentage || '92.40'}%</span>
            </div>
          </div>

          <div className="review-section-subtitle">Class X</div>
          <div className="review-kv-table" style={{ marginBottom: '14px' }}>
            <div className="kv-row">
              <span className="kv-key">Board</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c10.board || 'ICSE'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">School</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c10.schoolName || "St. George's High School, Kochi"}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Year of Passing</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c10.yearOfPassing || '2022'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Percentage</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{c10.percentage || '94.20'}%</span>
            </div>
          </div>

          <div className="review-section-subtitle">Other Qualification</div>
          <div className="qual-subtitle-item">Diploma in Computer Engineering</div>
          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Institute</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">Govt. Polytechnic College, Kochi</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Year of Passing</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">2021</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Percentage</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">89.60%</span>
            </div>
          </div>
        </div>

        {/* CARD 5: Internships & Work Experience */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Briefcase size={18} color="#4F46E5" />
              <span className="review-card-title">Internships & Work Experience</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(5)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>M Squared Software and Services Pvt Ltd</span>
            <span className="internship-badge">Internship</span>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Role</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">Web Developer Intern</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Duration</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">Jun 2026 - Jul 2026 (2 Months)</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Location</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">Trivandrum, Kerala</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Skills Used</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">HTML, CSS, JavaScript, Django, Git, REST API</span>
            </div>
            <div className="kv-row" style={{ alignItems: 'flex-start', marginTop: '4px' }}>
              <span className="kv-key">Description</span>
              <span className="kv-sep">:</span>
              <span className="kv-val" style={{ lineHeight: 1.5 }}>
                Worked on developing responsive web applications using HTML, CSS, JavaScript and Django.
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button type="button" className="btn-card-action" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => onJumpToStep(5)}>
              + Add Another Experience
            </button>
          </div>
        </div>

        {/* CARD 6: Documents */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <FileText size={18} color="#4F46E5" />
              <span className="review-card-title">Documents</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(6)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-doc-list">
            <div className="doc-item-row">
              <div className="doc-item-left">
                <FileText size={16} color="#4F46E5" />
                <span>Profile Photo</span>
              </div>
              <div className="doc-item-status">
                Uploaded <CheckCircle2 size={14} color="#10B981" />
              </div>
            </div>

            <div className="doc-item-row">
              <div className="doc-item-left">
                <FileText size={16} color="#4F46E5" />
                <span>Resume</span>
              </div>
              <div className="doc-item-status">
                Uploaded <CheckCircle2 size={14} color="#10B981" />
              </div>
            </div>

            <div className="doc-item-row">
              <div className="doc-item-left">
                <FileText size={16} color="#4F46E5" />
                <span>Class X Certificate</span>
              </div>
              <div className="doc-item-status">
                Uploaded <CheckCircle2 size={14} color="#10B981" />
              </div>
            </div>

            <div className="doc-item-row">
              <div className="doc-item-left">
                <FileText size={16} color="#10B981" />
                <span>Class XII Certificate</span>
              </div>
              <div className="doc-item-status">
                Uploaded <CheckCircle2 size={14} color="#10B981" />
              </div>
            </div>

            <div className="doc-item-row">
              <div className="doc-item-left">
                <ShieldCheck size={16} color="#10B981" />
                <span>Degree Marksheet (DigiLocker)</span>
              </div>
              <div className="doc-item-status">
                Fetched <CheckCircle2 size={14} color="#10B981" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Green Confirmation Banner */}
      <div className="wizard-alert alert-green" style={{ margin: '24px 0 0 0' }}>
        <CheckCircle2 size={20} className="flex-shrink-0" color="#10B981" />
        <div>
          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>Everything looks good!</strong>
          <span style={{ fontSize: '13px', color: '#047857' }}>You're all set to submit your registration.</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="wizard-footer-actions">
        <button type="button" className="btn-wizard-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button 
          type="button" 
          className="btn-wizard-primary"
          onClick={handleFinalSubmit}
        >
          <span>Submit Registration</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
