import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, User, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, X } from 'lucide-react';

export default function Step2ContactVerification({ state, onChange, onNext, onBack }) {
  // Modal states
  const [activeOtpTarget, setActiveOtpTarget] = useState(null); // 'primaryEmail' | 'personalEmail' | 'mobile'
  const [showAddressModal, setShowAddressModal] = useState(false);

  // OTP State & Refs
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(28);

  const otpBoxRef0 = useRef(null);
  const otpBoxRef1 = useRef(null);
  const otpBoxRef2 = useRef(null);
  const otpBoxRef3 = useRef(null);
  const otpRefs = [otpBoxRef0, otpBoxRef1, otpBoxRef2, otpBoxRef3];

  const data = state.contactVerification || {};
  const basic = state.basicDetails || {};

  // Form fields for Address popup
  const [addressForm, setAddressForm] = useState({
    country: data.address?.country || 'India',
    pincode: data.address?.pincode || '',
    state: data.address?.state || '',
    district: data.address?.district || '',
    city: data.address?.city || '',
    addressLine: data.address?.addressLine || '',
    setCurrent: true
  });

  // Keep addressForm updated when state changes
  useEffect(() => {
    if (data.address) {
      setAddressForm(prev => ({
        ...prev,
        country: data.address.country || 'India',
        pincode: data.address.pincode || '',
        state: data.address.state || '',
        district: data.address.district || '',
        city: data.address.city || '',
        addressLine: data.address.addressLine || ''
      }));
    }
  }, [data.address]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (activeOtpTarget && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeOtpTarget, resendTimer]);

  const handleOpenOtpModal = (target) => {
    setActiveOtpTarget(target);
    setOtpDigits(['', '', '', '']);
    setResendTimer(28);
    setTimeout(() => {
      if (otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
    }, 100);
  };

  const handleOtpChange = (index, value) => {
    const numericVal = value.replace(/\D/g, '');
    if (!numericVal && value !== '') return;

    const newDigits = [...otpDigits];

    if (numericVal.length > 1) {
      // Pasted or entered multiple digits
      const pasted = numericVal.slice(0, 4).split('');
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 3);
      if (otpRefs[focusIndex].current) {
        otpRefs[focusIndex].current.focus();
      }
      return;
    }

    newDigits[index] = numericVal;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (numericVal && index < 3 && otpRefs[index + 1].current) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && otpRefs[index - 1].current) {
        otpRefs[index - 1].current.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const newDigits = ['', '', '', ''];
    pastedData.split('').forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setOtpDigits(newDigits);

    const nextFocus = Math.min(pastedData.length, 3);
    if (otpRefs[nextFocus].current) {
      otpRefs[nextFocus].current.focus();
    }
  };

  const handleVerifyOtpSubmit = () => {
    if (activeOtpTarget === 'primaryEmail') {
      onChange('contactVerification', { ...data, primaryEmailVerified: true });
    } else if (activeOtpTarget === 'personalEmail') {
      onChange('contactVerification', { ...data, personalEmailVerified: true });
    } else if (activeOtpTarget === 'mobile') {
      onChange('contactVerification', { ...data, mobileVerified: true });
    }
    setActiveOtpTarget(null);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    onChange('contactVerification', {
      ...data,
      address: {
        country: addressForm.country,
        pincode: addressForm.pincode,
        state: addressForm.state,
        district: addressForm.district,
        city: addressForm.city,
        addressLine: addressForm.addressLine
      }
    });
    setShowAddressModal(false);
  };

  // Validation rules for Save & Proceed button
  const hasAddress = Boolean(data.address?.addressLine?.trim() && data.address?.pincode?.trim());
  const isPrimaryEmailVerified = Boolean(data.primaryEmailVerified);
  const isPersonalEmailVerified = Boolean(data.personalEmailVerified || data.personalEmail);
  const isMobileVerified = Boolean(data.mobileVerified);

  const isFormValid = isPrimaryEmailVerified && isMobileVerified && hasAddress;

  const handleProceedClick = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

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

      <form onSubmit={handleProceedClick}>
        {/* Verification Cards Stack */}
        <div className="verify-cards-stack">
          {/* Card 1: Primary Email Address */}
          <div className="verify-card-item">
            <div className="card-left-group">
              <div className="card-icon-tile">
                <Mail size={20} />
              </div>
              <div className="card-info-wrap">
                <label className="card-label">Verify Primary Email Address <span className="req">*</span></label>
                <div className="card-value">{basic.primaryEmail || 'kkabhinand05@gmail.com'}</div>
              </div>
            </div>

            <div className="card-right-group">
              {data.primaryEmailVerified ? (
                <span className="badge-verified">
                  Verified <CheckCircle2 size={14} />
                </span>
              ) : (
                <button 
                  type="button" 
                  className="btn-card-verify"
                  onClick={() => handleOpenOtpModal('primaryEmail')}
                >
                  Verify Email
                </button>
              )}
              <button 
                type="button" 
                className="btn-card-action"
                onClick={() => handleOpenOtpModal('primaryEmail')}
              >
                Change Email
              </button>
            </div>
          </div>

          {/* Card 2: Personal Email Address */}
          <div className="verify-card-item">
            <div className="card-left-group">
              <div className="card-icon-tile">
                <User size={20} />
              </div>
              <div className="card-info-wrap">
                <label className="card-label">Verify Personal Email Address <span className="req">*</span></label>
                <div className="card-value">{data.personalEmail || basic.primaryEmail || 'kkabhinand05@gmail.com'}</div>
              </div>
            </div>

            <div className="card-right-group">
              {data.personalEmailVerified ? (
                <span className="badge-verified">
                  Verified <CheckCircle2 size={14} />
                </span>
              ) : (
                <button 
                  type="button" 
                  className="btn-card-verify"
                  onClick={() => handleOpenOtpModal('personalEmail')}
                >
                  Verify Email
                </button>
              )}
              <button 
                type="button" 
                className="btn-card-action"
                onClick={() => handleOpenOtpModal('personalEmail')}
              >
                Change Email
              </button>
            </div>
          </div>

          {/* Card 3: Verify Mobile Number */}
          <div className="verify-card-item">
            <div className="card-left-group">
              <div className="card-icon-tile">
                <Phone size={20} />
              </div>
              <div className="card-info-wrap">
                <label className="card-label">Verify Mobile Number <span className="req">*</span></label>
                <div className="card-value">+91 {basic.mobileNumber || '916235407730'}</div>
              </div>
            </div>

            <div className="card-right-group">
              {data.mobileVerified ? (
                <span className="badge-verified">
                  Verified <CheckCircle2 size={14} />
                </span>
              ) : (
                <button 
                  type="button" 
                  className="btn-card-verify"
                  onClick={() => handleOpenOtpModal('mobile')}
                >
                  Verify Mobile
                </button>
              )}
              <button 
                type="button" 
                className="btn-card-action"
                onClick={() => handleOpenOtpModal('mobile')}
              >
                Change Number
              </button>
            </div>
          </div>

          {/* Card 4: Permanent Address */}
          <div className="verify-card-item address-card-item">
            <div className="card-left-group" style={{ alignItems: 'flex-start' }}>
              <div className="card-icon-tile" style={{ marginTop: '2px' }}>
                <MapPin size={20} />
              </div>
              <div className="card-info-wrap">
                <label className="card-label">Permanent Address <span className="req">*</span></label>
                {hasAddress ? (
                  <div className="address-display-box">
                    <div className="address-line1" style={{ fontWeight: 700, color: '#0F172A' }}>{data.address.addressLine}</div>
                    <div className="address-line2" style={{ fontSize: '13px', color: '#64748B' }}>
                      {data.address.city}, {data.address.district}, {data.address.state} - {data.address.pincode}, {data.address.country}
                    </div>
                  </div>
                ) : (
                  <div className="card-value empty">No permanent address added yet.</div>
                )}
              </div>
            </div>

            <div className="card-right-group">
              <button 
                type="button" 
                className="btn-card-action"
                onClick={() => setShowAddressModal(true)}
              >
                {hasAddress ? 'Edit Address' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>

        {/* Checkbox: Same as Permanent Address */}
        <div className="same-address-checkbox-row">
          <input 
            type="checkbox" 
            id="sameAddressCheck"
            checked={data.sameAsPermanent}
            onChange={(e) => onChange('contactVerification', { ...data, sameAsPermanent: e.target.checked })}
          />
          <label htmlFor="sameAddressCheck">Same as Permanent Address</label>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <button type="button" className="btn-wizard-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
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

      {/* Dialog 1: Verify Email OTP Modal */}
      {activeOtpTarget && (
        <div className="modal-overlay">
          <div className="modal-card otp-modal-card">
            <div className="modal-header">
              <h3>Verify Email OTP</h3>
              <button className="modal-close-btn" onClick={() => setActiveOtpTarget(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body text-center">
              <p className="otp-modal-desc">
                An OTP has been sent to <span className="highlight-email">{basic.primaryEmail || 'kkabhinand05@gmail.com'}</span>. Please check your inbox. If the OTP is not in your inbox, please check your <strong>spam and updates folder</strong> as well!
              </p>

              <div className="wizard-alert alert-amber otp-warning-banner">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>During busy hours the OTP might be delayed by 5 minutes.</span>
              </div>

              <div className="otp-prompt-label">
                Enter the OTP from the email below.
              </div>

              <div className="resend-timer-text">
                You can re-send the OTP in <span className="timer-sec">{resendTimer}</span>
              </div>

              {/* 4-Digit OTP Box Grid */}
              <div className="otp-4digit-grid" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="otp-single-box"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  />
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-wizard-secondary"
                onClick={() => setActiveOtpTarget(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-wizard-primary"
                onClick={handleVerifyOtpSubmit}
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog 2: Add / Edit Permanent Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-card address-modal-card">
            <div className="modal-header">
              <h3>{hasAddress ? 'Edit Permanent Address' : 'Add Permanent Address'}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddressModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Country <span className="req">*</span></label>
                    <select 
                      className="form-control"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      required
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode <span className="req">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="686518"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">State <span className="req">*</span></label>
                    <select 
                      className="form-control"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    >
                      <option value="">Select State</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">District <span className="req">*</span></label>
                    <select 
                      className="form-control"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      required
                    >
                      <option value="">Select District</option>
                      <option value="Kottayam">Kottayam</option>
                      <option value="Ernakulam">Ernakulam</option>
                      <option value="Trivandrum">Trivandrum</option>
                      <option value="Idukki">Idukki</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">City <span className="req">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Kanjirapally"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address Line <span className="req">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Amal Jyothi College of Engineering"
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="set-current-checkbox-row">
                  <input 
                    type="checkbox" 
                    id="setCurrentCheck"
                    checked={addressForm.setCurrent}
                    onChange={(e) => setAddressForm({ ...addressForm, setCurrent: e.target.checked })}
                  />
                  <label htmlFor="setCurrentCheck">Set as current address</label>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-wizard-secondary" 
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wizard-primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
