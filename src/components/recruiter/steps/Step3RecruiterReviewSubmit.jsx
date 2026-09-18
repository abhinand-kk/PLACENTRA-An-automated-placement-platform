import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Edit3, Building2, Sliders, AlertCircle } from 'lucide-react';
import RecruiterProcessingScreen from '../RecruiterProcessingScreen';
import AccountPasswordCard from '../../common/AccountPasswordCard';
import api from '../../../services/api';

export default function Step3RecruiterReviewSubmit({ state, onJumpToStep, onBack, onCompleteDashboard }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { basicCompanyDetails, hiringPreferences } = state;

  const company = basicCompanyDetails || {};
  const pref = hiringPreferences || {};

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
    setErrorMessage('');
    if (!validatePassword()) {
      return;
    }

    try {
      const email = (company.workEmail || 'recruiter@company.com').trim().toLowerCase();
      const username = (email.split('@')[0] || 'recruiter').toLowerCase();

      const payload = {
        username: username,
        email: email,
        password: password,
        company_name: company.companyName || 'Acme Corporation Pvt Ltd',
        recruiter_name: company.recruiterFullName || 'Recruiter User',
        designation: company.designation || 'Hiring Manager',
        official_email: email,
        mobile_number: company.mobileNumber || '9876543210',
        hiring_volume: company.hiringVolume || '1-10'
      };

      const res = await api.post('/api/v1/auth/recruiter/register/', payload);
      if (res.data && res.data.tokens) {
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        localStorage.setItem('user_role', 'recruiter');
        localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      }
      setIsSubmitting(true);
    } catch (err) {
      console.error("API recruiter registration error:", err?.response?.data || err.message);
      const backendError = err?.response?.data;
      let errorStr = 'Registration failed. Please try again.';
      if (backendError) {
        if (typeof backendError === 'string') {
          errorStr = backendError;
        } else if (backendError.official_email) {
          errorStr = Array.isArray(backendError.official_email) ? backendError.official_email[0] : backendError.official_email;
        } else if (backendError.email) {
          errorStr = Array.isArray(backendError.email) ? backendError.email[0] : backendError.email;
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
            errorStr = Array.isArray(val) ? val[0] : String(val);
          }
        }
      }
      setErrorMessage(errorStr);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <RecruiterProcessingScreen 
        onComplete={onCompleteDashboard} 
      />
    );
  }

  // Format array helpers
  const formatList = (arr, fallback = 'Not specified') => {
    if (!arr || arr.length === 0) return fallback;
    return arr.join(', ');
  };

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <CheckCircle2 size={22} />
        </div>
        <div className="step-header-text">
          <h2>Review and Submit</h2>
          <p>Please review all your company details carefully before final submission.</p>
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
          <span>Please verify all the company information below. After clicking 'Submit Registration', you will not be able to edit any information.</span>
        </div>
        <div style={{ fontWeight: 700, marginLeft: '26px' }}>
          Make sure all details are accurate before submitting.
        </div>
      </div>

      {/* 2 Summary Cards Grid */}
      <div className="form-grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* CARD 1: Company Details */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Building2 size={18} color="#4F46E5" />
              <span className="review-card-title">Company Details</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(1)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Company Name</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{company.companyName || 'Acme Corporation Pvt Ltd'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Recruiter Full Name</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{company.recruiterFullName || 'Vikram Sharma'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Designation</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{company.designation || 'Senior Talent Acquisition Lead'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Official Work Email</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{company.workEmail || 'vikram@company.com'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Mobile Number</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">+91 {company.mobileNumber || '9876543210'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Annual Hiring Volume</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{company.hiringVolume || '10 - 50 Graduates / Year'}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Hiring Preferences */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Sliders size={18} color="#4F46E5" />
              <span className="review-card-title">Hiring Preferences</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(2)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">Target Job Roles</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{formatList(pref.targetRoles, 'Software Engineer, Full Stack Developer')}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Hiring Type</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.hiringType || 'Full-Time'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Eligible Courses</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{formatList(pref.eligibleCourses, 'B.Tech, MCA')}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Eligible Branches</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{formatList(pref.eligibleBranches, 'Computer Science, Artificial Intelligence')}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Minimum CGPA</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.minCgpa || '7.5'} / 10.0</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Max Active Backlogs</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.maxBacklogs || '0'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Expected Hiring Month</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.expectedHiringMonth || 'Sep 2026'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Expected Students</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.expectedStudents || '15'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Package Offered (LPA)</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.packageOffered || '8.5'} LPA</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Work Mode</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.workMode || 'On-site'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Campus Visit Required</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{pref.campusVisit || 'Yes'}</span>
            </div>
            <div className="kv-row" style={{ alignItems: 'flex-start' }}>
              <span className="kv-key">Additional Requirements</span>
              <span className="kv-sep">:</span>
              <span className="kv-val" style={{ lineHeight: 1.5 }}>
                {pref.additionalRequirements || 'Candidates should have strong problem-solving skills and knowledge of data structures.'}
              </span>
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

      {/* Green Success Box */}
      <div className="wizard-alert alert-green" style={{ margin: '20px 0 0 0' }}>
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
