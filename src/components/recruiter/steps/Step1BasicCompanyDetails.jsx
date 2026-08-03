import React, { useState } from 'react';
import { Building2, ArrowRight, CheckCircle2, AlertCircle, Edit3, X, Mail, Phone, User, Briefcase, TrendingUp } from 'lucide-react';

export default function Step1BasicCompanyDetails({ state, onChange, onNext }) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [touched, setTouched] = useState({});

  const data = state.basicCompanyDetails || {};

  const handleChange = (field, value) => {
    onChange('basicCompanyDetails', { ...data, [field]: value });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation logic
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (phone) => /^\d{10}$/.test(phone);

  const isCompanyNameValid = Boolean(data.companyName?.trim());
  const isRecruiterNameValid = Boolean(data.recruiterFullName?.trim());
  const isDesignationValid = Boolean(data.designation?.trim());
  const isEmailValid = isValidEmail(data.workEmail || '');
  const isMobileValid = isValidMobile(data.mobileNumber || '');
  const isHiringVolumeValid = Boolean(data.hiringVolume);

  const isFormValid =
    isCompanyNameValid &&
    isRecruiterNameValid &&
    isDesignationValid &&
    isEmailValid &&
    isMobileValid &&
    isHiringVolumeValid;

  const handleProceedClick = (e) => {
    e.preventDefault();
    if (isFormValid) {
      setShowVerifyModal(true);
    }
  };

  const handleConfirmSave = () => {
    setShowVerifyModal(false);
    if (onNext) {
      onNext();
    }
  };

  const hiringVolumeOptions = [
    '1 - 10 Graduates / Year',
    '10 - 50 Graduates / Year',
    '50 - 200 Graduates / Year',
    '200+ Graduates / Year'
  ];

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <Building2 size={22} />
        </div>
        <div className="step-header-text">
          <h2>Basic Company Details</h2>
          <p>Provide key details about your organization and recruiter contact info.</p>
        </div>
      </div>

      <form onSubmit={handleProceedClick}>
        {/* Company Name */}
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label">Company Name <span className="req">*</span></label>
          <div className="input-with-icon">
            <input 
              type="text"
              className={`form-control ${touched.companyName && !isCompanyNameValid ? 'invalid' : ''}`}
              placeholder="e.g. Acme Corporation Pvt Ltd"
              value={data.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              onBlur={() => handleBlur('companyName')}
              required
            />
            {isCompanyNameValid && (
              <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
            )}
          </div>
          {touched.companyName && !isCompanyNameValid && (
            <span className="error-text">Company name is required</span>
          )}
        </div>

        {/* Recruiter Full Name & Designation */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Recruiter Full Name <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="text"
                className={`form-control ${touched.recruiterFullName && !isRecruiterNameValid ? 'invalid' : ''}`}
                placeholder="e.g. Vikram Sharma"
                value={data.recruiterFullName}
                onChange={(e) => handleChange('recruiterFullName', e.target.value)}
                onBlur={() => handleBlur('recruiterFullName')}
                required
              />
              {isRecruiterNameValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            {touched.recruiterFullName && !isRecruiterNameValid && (
              <span className="error-text">Recruiter full name is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Designation <span className="req">*</span></label>
            <input 
              type="text"
              className={`form-control ${touched.designation && !isDesignationValid ? 'invalid' : ''}`}
              placeholder="e.g. Senior Talent Acquisition Lead"
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

        {/* Official Work Email & Mobile Number */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Official Work Email <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="email"
                className={`form-control ${touched.workEmail && !isEmailValid ? 'invalid' : ''}`}
                placeholder="vikram@company.com"
                value={data.workEmail}
                onChange={(e) => handleChange('workEmail', e.target.value)}
                onBlur={() => handleBlur('workEmail')}
                required
              />
              {isEmailValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            <span className="form-hint">Please use your company domain email address.</span>
            {touched.workEmail && !isEmailValid && (
              <span className="error-text">Please enter a valid official work email</span>
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

        {/* Approx. Annual Campus Hiring Volume */}
        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label">Approx. Annual Campus Hiring Volume <span className="req">*</span></label>
          <select 
            className={`form-control ${touched.hiringVolume && !isHiringVolumeValid ? 'invalid' : ''}`}
            value={data.hiringVolume}
            onChange={(e) => handleChange('hiringVolume', e.target.value)}
            onBlur={() => handleBlur('hiringVolume')}
            required
          >
            <option value="">Select Annual Hiring Volume</option>
            {hiringVolumeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {touched.hiringVolume && !isHiringVolumeValid && (
            <span className="error-text">Hiring volume selection is required</span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <div></div>
          <button 
            type="submit" 
            className={`btn-wizard-primary ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            <span>Save and Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Confirmation Modal ("Please verify your company details") */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-card verify-modal-card">
            <div className="modal-header">
              <h3>Please verify your company details</h3>
              <button className="modal-close-btn" onClick={() => setShowVerifyModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Yellow Warning Banner */}
              <div className="wizard-alert alert-amber">
                <AlertCircle size={18} className="flex-shrink-0" />
                <div>
                  Please review the details entered for your organization. You can edit them now or proceed to the next step.
                </div>
              </div>

              {/* Read-Only Summary Key-Value List */}
              <div className="verify-summary-table">
                <div className="summary-row">
                  <span className="sum-key">Company Name</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.companyName}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Recruiter Full Name</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.recruiterFullName}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Designation</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.designation}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Official Work Email</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.workEmail}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Mobile Number</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">+91 {data.mobileNumber}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Annual Hiring Volume</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.hiringVolume}</span>
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
                Save and Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
