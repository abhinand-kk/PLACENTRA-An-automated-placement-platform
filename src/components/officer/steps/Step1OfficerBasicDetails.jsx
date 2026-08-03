import React, { useState } from 'react';
import { User, ArrowRight, CheckCircle2, AlertCircle, Edit3, X } from 'lucide-react';

export default function Step1OfficerBasicDetails({ state, onChange, onNext }) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [touched, setTouched] = useState({});

  const data = state.basicDetails || {};

  const handleChange = (field, value) => {
    onChange('basicDetails', { ...data, [field]: value });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation logic
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (phone) => /^\d{10}$/.test(phone);

  const isFullNameValid = Boolean(data.fullName?.trim());
  const isDesignationValid = Boolean(data.designation?.trim());
  const isEmailValid = isValidEmail(data.collegeEmail || '');
  const isMobileValid = isValidMobile(data.mobileNumber || '');

  const isFormValid =
    isFullNameValid &&
    isDesignationValid &&
    isEmailValid &&
    isMobileValid;

  const handleProceedClick = (e) => {
    e.preventDefault();
    if (isFormValid) {
      setShowVerifyModal(true);
    }
  };

  const handleConfirmSave = () => {
    setShowVerifyModal(false);
    onChange('basicDetails', data);
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <User size={22} />
        </div>
        <div className="step-header-text">
          <h2>Basic Details</h2>
          <p>Provide your personal details and official contact information as a Placement Officer.</p>
        </div>
      </div>

      <form onSubmit={handleProceedClick}>
        {/* Full Name & Designation */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="text"
                className={`form-control ${touched.fullName && !isFullNameValid ? 'invalid' : ''}`}
                placeholder="e.g. Dr. Rajesh Kumar"
                value={data.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                required
              />
              {isFullNameValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            {touched.fullName && !isFullNameValid && (
              <span className="error-text">Full name is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Designation <span className="req">*</span></label>
            <input 
              type="text"
              className={`form-control ${touched.designation && !isDesignationValid ? 'invalid' : ''}`}
              placeholder="e.g. Head of Training & Placements"
              value={data.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              onBlur={() => handleBlur('designation')}
              required
            />
            {touched.designation && !isDesignationValid && (
              <span className="error-text">Designation is required</span>
            )}
          </div>
        </div>

        {/* Official College Email & Mobile Number */}
        <div className="form-grid-2" style={{ marginBottom: '28px' }}>
          <div className="form-group">
            <label className="form-label">Official College Email <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="email"
                className={`form-control ${touched.collegeEmail && !isEmailValid ? 'invalid' : ''}`}
                placeholder="rajesh.kumar@university.edu.in"
                value={data.collegeEmail}
                onChange={(e) => handleChange('collegeEmail', e.target.value)}
                onBlur={() => handleBlur('collegeEmail')}
                required
              />
              {isEmailValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            <span className="form-hint">Please use your official university/college domain email.</span>
            {touched.collegeEmail && !isEmailValid && (
              <span className="error-text">Please enter a valid official college email</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number <span className="req">*</span></label>
            <div className="phone-input-group">
              <div className="country-selector">
                <span className="flag-icon">🇮🇳</span>
                <span className="code-text">+91</span>
              </div>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <input 
                  type="text"
                  className={`form-control ${touched.mobileNumber && !isMobileValid ? 'invalid' : ''}`}
                  placeholder="9876543210"
                  value={data.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => handleBlur('mobileNumber')}
                  required
                />
                {isMobileValid && (
                  <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
                )}
              </div>
            </div>
            {touched.mobileNumber && !isMobileValid && (
              <span className="error-text">Please enter a valid 10-digit mobile number</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <div></div>
          <button 
            type="submit" 
            className={`btn-wizard-primary ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            <span>Save & Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Confirmation Modal ("Please verify your details") */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-card verify-modal-card">
            <div className="modal-header">
              <h3>Please verify your details</h3>
              <button className="modal-close-btn" onClick={() => setShowVerifyModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Yellow Warning Banner */}
              <div className="wizard-alert alert-amber">
                <AlertCircle size={18} className="flex-shrink-0" />
                <div>
                  Please review your personal information. You can edit them now or proceed to the next step.
                </div>
              </div>

              {/* Read-Only Summary Key-Value List */}
              <div className="verify-summary-table">
                <div className="summary-row">
                  <span className="sum-key">Full Name</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.fullName}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Designation</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.designation}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Official College Email</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.collegeEmail}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Mobile Number</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">+91 {data.mobileNumber}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn-wizard-secondary"
                onClick={() => setShowVerifyModal(false)}
              >
                <Edit3 size={14} />
                <span>Go Back and Edit</span>
              </button>
              <button 
                type="button"
                className="btn-wizard-primary"
                onClick={handleConfirmSave}
              >
                Save & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
