import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Step2ContactVerification({ state, onChange, onNext, onBack }) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);

  const data = state.contactVerification;
  const basic = state.basicDetails;

  const handleAddressChange = (field, val) => {
    onChange('contactVerification', {
      ...data,
      address: { ...data.address, [field]: val }
    });
  };

  const handleVerifyOtpSubmit = () => {
    setShowOtpModal(false);
    onChange('contactVerification', { ...data, primaryEmailVerified: true });
  };

  const hasAddress = data.address.addressLine || data.address.city;

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <Mail size={22} />
        </div>
        <div className="step-header-text">
          <h2>Contact Verification</h2>
          <p>Let's verify your contact details to keep your account secure.</p>
        </div>
      </div>

      {/* Primary Email Card */}
      <div className="verify-card">
        <div className="verify-info">
          <span className="verify-label">Verify Primary Email Address</span>
          <div className="verify-val-row">
            <span className="verify-val">{basic.primaryEmail || 'No email provided'}</span>
            {data.primaryEmailVerified && (
              <span className="badge-verified">Verified ✓</span>
            )}
          </div>
        </div>
        <button className="btn-sm-action" onClick={() => setShowOtpModal(true)}>
          {data.primaryEmailVerified ? 'Change Email' : 'Verify Email'}
        </button>
      </div>

      {/* Personal Email Card */}
      <div className="verify-card">
        <div className="verify-info">
          <span className="verify-label">Verify Personal Email Address [Optional]</span>
          <div className="verify-val-row">
            <span className="verify-val">{data.personalEmail || 'Enter personal email'}</span>
            {data.personalEmailVerified && (
              <span className="badge-verified">Verified ✓</span>
            )}
          </div>
        </div>
        <button className="btn-sm-action" onClick={() => setShowOtpModal(true)}>
          {data.personalEmail ? 'Change Email' : 'Add Email'}
        </button>
      </div>

      {/* Mobile Verification Card */}
      <div className="verify-card">
        <div className="verify-info">
          <span className="verify-label">Verify Mobile Number</span>
          <div className="verify-val-row">
            <span className="verify-val">{basic.mobileNumber ? `+91 ${basic.mobileNumber}` : 'No mobile number provided'}</span>
            {data.mobileVerified && (
              <span className="badge-verified">Verified ✓</span>
            )}
          </div>
        </div>
        <button className="btn-sm-action" onClick={() => setShowOtpModal(true)}>
          {data.mobileVerified ? 'Change Number' : 'Verify Mobile'}
        </button>
      </div>

      {/* Permanent Address Card */}
      <div className="verify-card" style={{ alignItems: 'flex-start' }}>
        <div className="verify-info">
          <span className="verify-label">Permanent Address</span>
          <div className="verify-val-row" style={{ marginTop: '8px' }}>
            <span className="verify-val" style={{ lineHeight: 1.5 }}>
              {hasAddress ? (
                `${data.address.addressLine}, ${data.address.city}, ${data.address.district}, ${data.address.state} - ${data.address.pincode}, ${data.address.country}`
              ) : (
                'No address added yet.'
              )}
            </span>
          </div>
        </div>
        <button className="btn-sm-action" onClick={() => setShowAddressModal(true)}>
          {hasAddress ? 'Edit Address' : 'Add Address'}
        </button>
      </div>

      {/* Checkbox: Same as Permanent Address */}
      <div style={{ margin: '16px 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          type="checkbox" 
          id="sameAddress"
          checked={data.sameAsPermanent}
          onChange={(e) => onChange('contactVerification', { ...data, sameAsPermanent: e.target.checked })}
          style={{ width: '16px', height: '16px', accentColor: '#4F46E5' }}
        />
        <label htmlFor="sameAddress" style={{ fontSize: '13.5px', color: '#0F172A', fontWeight: 600 }}>
          Same as Permanent Address
        </label>
      </div>

      {/* Footer Actions */}
      <div className="wizard-footer-actions">
        <button className="btn-wizard-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button className="btn-wizard-primary" onClick={onNext}>
          <span>Save and Proceed</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Modal 1: Verify Email OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Verify email OTP</h3>
              <button className="modal-close-btn" onClick={() => setShowOtpModal(false)}>✕</button>
            </div>
            <div className="modal-body text-center">
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                An OTP has been sent to <strong>{basic.primaryEmail || 'your email'}</strong>. Please check your inbox.
              </p>

              <div className="wizard-alert alert-amber" style={{ fontSize: '12px', padding: '10px' }}>
                <AlertCircle size={16} />
                <span>During heavy traffic the OTP might be delayed by 5 minutes.</span>
              </div>

              <p style={{ fontSize: '12.5px', fontWeight: 700, margin: '16px 0 8px 0' }}>
                Enter the OTP from the email below:
              </p>

              <div className="otp-input-group">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    className="otp-box"
                    placeholder="•"
                    value={val}
                    onChange={(e) => {
                      const newArr = [...otpValues];
                      newArr[idx] = e.target.value;
                      setOtpValues(newArr);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-wizard-secondary" onClick={() => setShowOtpModal(false)}>
                Cancel
              </button>
              <button className="btn-wizard-primary" onClick={handleVerifyOtpSubmit}>
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Permanent Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Edit Permanent Address</h3>
              <button className="modal-close-btn" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Country <span className="req">*</span></label>
                  <select 
                    className="form-control"
                    value={data.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  >
                    <option value="India">India</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. 686518"
                    value={data.address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">State <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Kerala"
                    value={data.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Kottayam"
                    value={data.address.district}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">City <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Kanjirappally"
                    value={data.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Line <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="House/Street/Building details"
                    value={data.address.addressLine}
                    onChange={(e) => handleAddressChange('addressLine', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="checkbox" id="setCurrent" defaultChecked />
                <label htmlFor="setCurrent" style={{ fontSize: '13px', fontWeight: 600 }}>Set as current address</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-wizard-secondary" onClick={() => setShowAddressModal(false)}>
                Cancel
              </button>
              <button className="btn-wizard-primary" onClick={() => setShowAddressModal(false)}>
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
