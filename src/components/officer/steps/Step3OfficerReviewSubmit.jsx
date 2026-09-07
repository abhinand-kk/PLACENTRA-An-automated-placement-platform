import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Edit3, User, Building2, AlertCircle } from 'lucide-react';
import OfficerProcessingScreen from '../OfficerProcessingScreen';
import AccountPasswordCard from '../../common/AccountPasswordCard';
import api from '../../../services/api';

export default function Step3OfficerReviewSubmit({ state, onJumpToStep, onBack, onCompleteDashboard }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { basicDetails, institutionDetails } = state;

  const basic = basicDetails || {};
  const inst = institutionDetails || {};

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
      const email = (basic.collegeEmail || 'officer@university.edu.in').trim().toLowerCase();
      const username = (email.split('@')[0] || 'officer').toLowerCase();

      const payload = {
        username: username,
        email: email,
        password: password,
        full_name: basic.fullName || 'Placement Officer',
        designation: basic.designation || 'Head of Placements',
        official_email: email,
        mobile_number: basic.mobileNumber || '9876543210',
        institution_name: inst.collegeName || 'Model Engineering College'
      };

      const res = await api.post('/api/v1/auth/placement-officer/register/', payload);
      if (res.data && res.data.tokens) {
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        localStorage.setItem('user_role', 'placement_officer');
        localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      }
      setIsSubmitting(true);
    } catch (err) {
      console.error("API officer registration error:", err?.response?.data || err.message);
      const backendError = err?.response?.data;
      let errorStr = 'Registration failed. Please try again.';
      if (backendError) {
        if (typeof backendError === 'string') {
          errorStr = backendError;
        } else if (backendError.email) {
          errorStr = Array.isArray(backendError.email) ? backendError.email[0] : backendError.email;
        } else if (backendError.error) {
          errorStr = backendError.error;
        } else if (backendError.detail) {
          errorStr = backendError.detail;
        } else if (backendError.non_field_errors) {
          errorStr = Array.isArray(backendError.non_field_errors) ? backendError.non_field_errors[0] : backendError.non_field_errors;
        }
      }
      setErrorMessage(errorStr);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <OfficerProcessingScreen 
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
          <p>Please review your information and institution details carefully before final submission.</p>
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
          <span>Please verify all the officer and institution details below. After clicking 'Submit Registration', you will not be able to edit any information.</span>
        </div>
        <div style={{ fontWeight: 700, marginLeft: '26px' }}>
          Make sure all details are accurate before submitting.
        </div>
      </div>

      {/* 2 Summary Cards Grid */}
      <div className="form-grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
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
              <span className="kv-key">Placement Officer Full Name</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.fullName || 'Dr. Rajesh Kumar'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Designation</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.designation || 'Head of Training & Placements'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Official Email</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{basic.collegeEmail || 'rajesh.kumar@university.edu.in'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Mobile Number</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">+91 {basic.mobileNumber || '9876543210'}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Institution Details */}
        <div className="review-summary-card">
          <div className="review-card-header">
            <div className="review-title-group">
              <Building2 size={18} color="#4F46E5" />
              <span className="review-card-title">Institution Details</span>
            </div>
            <button type="button" className="btn-edit-link" onClick={() => onJumpToStep(2)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div className="review-kv-table">
            <div className="kv-row">
              <span className="kv-key">College / University Name</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.collegeName || 'Model Engineering College'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Institution Type</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.institutionType || 'Engineering College'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Affiliated University</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.affiliatedUniversity || 'APJ Abdul Kalam Technological University'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">State</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.stateName || 'Kerala'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">District</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.districtName || 'Ernakulam'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">College Address</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.collegeAddress || 'Thrikkakara, Kochi, Kerala'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Pincode</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.pincode || '682021'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Placement Cell Email</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.placementEmail || 'placement@college.edu.in'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Placement Cell Contact Number</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">+91 {inst.placementContactNumber || '9876543210'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Eligible Final Year Students</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.eligibleStudentsCount || '350'} Students</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">College Website</span>
              <span className="kv-sep">:</span>
              <span className="kv-val">{inst.collegeWebsite || 'https://www.college.edu.in'}</span>
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
