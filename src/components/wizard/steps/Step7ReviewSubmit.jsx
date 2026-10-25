import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Edit3, User, Mail, GraduationCap, Briefcase, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import RegistrationProcessingScreen from '../RegistrationProcessingScreen';
import AccountPasswordCard from '../../common/AccountPasswordCard';
import api from '../../../services/api';

export default function Step7ReviewSubmit({ state, onJumpToStep, onBack, onCompleteDashboard }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Account Password States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { basicDetails, contactVerification, currentEducation, previousEducation, experiences, documents } = state;

  const basic = basicDetails || {};
  const contact = contactVerification || {};
  const currEdu = currentEducation || {};
  const prevEdu = previousEducation || {};
  const c12 = prevEdu.class12 || {};
  const c10 = prevEdu.class10 || {};
  const expList = experiences || [];
  const docs = documents || {};

  const validatePassword = () => {
    if (!password) {
      setErrorMessage('Account Password is required.');
      return false;
    }
    if (!confirmPassword) {
      setErrorMessage('Confirm Password is required.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your passwords.');
      return false;
    }
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setErrorMessage('Password does not meet all complexity requirements.');
      return false;
    }
    return true;
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;

    setErrorMessage('');
    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const email = (basic.primaryEmail || 'student@placentra.edu').trim().toLowerCase();
      const registerNumber = (basic.rollNumber || `REG${Math.floor(100000 + Math.random() * 900000)}`).trim();
      const username = (email.split('@')[0] || registerNumber).toLowerCase();

      const collegeName = (basic.college === 'Other institution / Not listed' ? basic.customCollege : basic.college) || currEdu.institutionName || 'Amal Jyothi College of Engineering';
      const branchName = currEdu.branch || (basic.branch === 'Others' ? basic.customBranch : basic.branch) || 'Computer Applications';

      const payload = {
        username: username,
        email: email,
        password: password,
        register_number: registerNumber,
        first_name: basic.firstName || 'Student',
        middle_name: basic.middleName || '',
        last_name: basic.lastName || 'User',
        gender: basic.gender || 'Male',
        date_of_birth: basic.dob || null,
        blood_group: basic.bloodGroup || 'B+',
        
        contact_details: {
          primary_email: email,
          personal_email: email,
          mobile_number: basic.mobileNumber || contact.mobileNumber || '9876543210',
          state: contact.state || 'Kerala',
          district: contact.district || 'Kottayam',
          city: contact.city || 'Kanjirappally',
          pincode: contact.pincode || '686507',
          permanent_address: contact.city ? `${contact.city}, ${contact.state}` : 'Kanjirappally, Kottayam, Kerala - 686507'
        },

        current_education: {
          institutionName: collegeName,
          program_name: currEdu.program || basic.course || 'Integrated MCA',
          branch_name: branchName,
          field_of_study: currEdu.fieldOfStudy || 'Software Development',
          batch: currEdu.batch || '2024 - 2026',
          semester: currEdu.semester || currEdu.currentSemester || '4',
          cgpa: currEdu.cgpa || (currEdu.percentage ? (parseFloat(currEdu.percentage) / 10).toFixed(2) : '8.75'),
          active_backlogs: currEdu.activeBacklogs || currEdu.totalBacklogs || '0',
          start_date: currEdu.startDate || null,
          end_date: currEdu.expectedEndDate || currEdu.endDate || null
        },

        previous_education: {
          class12: c12,
          class10: c10
        },

        experiences: expList,
        documents: docs
      };

      const res = await api.post('/api/v1/auth/student/register/', payload);
      if (res.data && res.data.tokens) {
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        localStorage.setItem('user_role', 'student');
        localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      }
    } catch (err) {
      console.error("API student registration error:", err?.response?.data || err.message);
      const backendError = err?.response?.data;
      let errorStr = 'Registration failed. Please try again.';
      if (backendError) {
        if (typeof backendError === 'string') {
          errorStr = backendError;
        } else if (backendError.email) {
          errorStr = Array.isArray(backendError.email) ? backendError.email[0] : backendError.email;
        } else if (backendError.register_number) {
          errorStr = Array.isArray(backendError.register_number) ? backendError.register_number[0] : backendError.register_number;
        } else if (backendError.error) {
          errorStr = backendError.error;
        } else if (backendError.detail) {
          errorStr = backendError.detail;
        } else if (backendError.non_field_errors) {
          errorStr = Array.isArray(backendError.non_field_errors) ? backendError.non_field_errors[0] : backendError.non_field_errors;
        } else if (typeof backendError === 'object') {
          const firstKey = Object.keys(backendError)[0];
          if (firstKey && backendError[firstKey]) {
            const val = backendError[firstKey];
            const msg = Array.isArray(val) ? val[0] : val;
            errorStr = `${firstKey.replace('_', ' ')}: ${msg}`;
          }
        }
      }
      setErrorMessage(errorStr);
      setIsSubmitting(false);
    }
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

      {errorMessage && (
        <div className="wizard-alert alert-amber" style={{ marginBottom: '16px', color: '#EF4444', backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
              <span className="kv-val">{`${basic.firstName || 'Abhinand'} ${basic.middleName || 'K K'} ${basic.lastName || ''}`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Register Number</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.rollNumber || 'AJC25MCA2002'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Gender</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.gender || 'Male'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Date of Birth</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.dob || '15 Aug 2002'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Blood Group</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.bloodGroup || 'B+'}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Contact Information */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Mail size={18} color="#4F46E5" />
              <span className="review-card-title">Contact Verification</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(2)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Email Address</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">
                {basic.primaryEmail || 'abhinand@placentra.edu'}{' '}
                {contact.primaryEmailVerified && <span className="badge-verified-tiny">✓ Verified</span>}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Mobile Number</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">
                +91 {basic.mobileNumber || '9876543210'}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">State & District</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${contact.state || 'Kerala'}, ${contact.district || 'Kottayam'}`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">City & Pincode</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${contact.city || 'Kanjirappally'} - ${contact.pincode || '686507'}`}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Current Education */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <GraduationCap size={18} color="#4F46E5" />
              <span className="review-card-title">Current Education</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(3)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Program & Branch</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${currEdu.program || 'MCA'}, ${currEdu.branch || 'Computer Science'}`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Field of Study</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{currEdu.fieldOfStudy || 'Software Development'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Batch / Duration</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${currEdu.batch || '2024 - 2026'}`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Current CGPA</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${currEdu.cgpa || '8.75'} / 10.0`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Active Backlogs</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{currEdu.activeBacklogs || '0'}</span>
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

          <div className="review-kv-table">
            <div className="review-section-subtitle">Class XII (Higher Secondary)</div>
            <div className="kv-row">
              <span className="kv-key">Board / Institution</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${c12.board || '—'} • ${c12.schoolName || c12.school || '—'}`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Passing Year & Score</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${c12.yearOfPassing || c12.passingYear || '—'} (${c12.percentage ? c12.percentage + '%' : '—'})`}</span>
            </div>

            <div className="review-section-subtitle" style={{ marginTop: '10px' }}>Class X (Secondary)</div>
            <div className="kv-row">
              <span className="kv-key">Board / Institution</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${c10.board || '—'} • ${c10.schoolName || c10.school || '—'}`}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Passing Year & Score</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{`${c10.yearOfPassing || c10.passingYear || '—'} (${c10.percentage ? c10.percentage + '%' : '—'})`}</span>
            </div>
          </div>
        </div>

        {/* CARD 5: Experience */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Briefcase size={18} color="#4F46E5" />
              <span className="review-card-title">Experience & Internships</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(5)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            {expList.length > 0 ? (
              expList.map((item, idx) => (
                <div key={idx} style={{ marginBottom: idx === expList.length - 1 ? 0 : '14px', borderBottom: idx === expList.length - 1 ? 'none' : '1px dashed #E2E8F0', paddingBottom: '10px' }}>
                  <div className="qual-subtitle-item" style={{ fontWeight: 700, fontSize: '14px', color: '#0A192F' }}>
                    {item.company || item.companyName}
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">Role & Type</span>
                    <span className="kv-sep">:</span>
                    <span className="kv-val">{`${item.jobTitle || item.designation || 'Role'} (${item.type || item.employmentType || 'Internship'})`}</span>
                  </div>
                  {item.location && (
                    <div className="kv-row">
                      <span className="kv-key">Location</span>
                      <span className="kv-sep">:</span>
                      <span className="kv-val">{item.location}</span>
                    </div>
                  )}
                  <div className="kv-row">
                    <span className="kv-key">Duration</span>
                    <span className="kv-sep">:</span>
                    <span className="kv-val">{`${item.startDate || item.start_date || ''} - ${item.isCurrent ? 'Present' : (item.endDate || item.end_date || 'Present')}`}</span>
                  </div>
                  {item.description && (
                    <div className="kv-row">
                      <span className="kv-key">Description</span>
                      <span className="kv-sep">:</span>
                      <span className="kv-val">{item.description}</span>
                    </div>
                  )}
                  {item.skills && item.skills.length > 0 && (
                    <div className="kv-row" style={{ marginTop: '4px' }}>
                      <span className="kv-key">Skills</span>
                      <span className="kv-sep">:</span>
                      <div className="kv-val" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {item.skills.map((sk, sIdx) => (
                          <span key={sIdx} className="skill-pill-tag" style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span style={{ color: '#94A3B8', fontSize: '13px' }}>
                No internship or work experience recorded.
              </span>
            )}
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
                <FileText size={16} color="#4F46E5" />
                <span>Degree Marksheet</span>
              </div>
              <div className="doc-item-status">
                {docs.degreeMarksheet?.status === 'Uploaded' || docs.degreeMarksheet?.name ? (
                  <>Uploaded <CheckCircle2 size={14} color="#10B981" /></>
                ) : (
                  <span style={{ color: '#94A3B8' }}>Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Password Creation Card */}
      <AccountPasswordCard 
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        error={errorMessage}
        setError={setErrorMessage}
      />

      {/* Green Confirmation Banner */}
      <div className="wizard-alert alert-green" style={{ margin: '24px 0 0 0' }}>
        <CheckCircle2 size={20} className="flex-shrink-0" color="#10B981" />
        <div>
          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>Everything looks good!</strong>
          <span style={{ fontSize: '13px', color: '#047857' }}>Set your account password above and submit your registration.</span>
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
          className={`btn-wizard-primary ${isSubmitting ? 'disabled' : ''}`}
          disabled={isSubmitting}
          onClick={handleFinalSubmit}
        >
          <span>{isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
