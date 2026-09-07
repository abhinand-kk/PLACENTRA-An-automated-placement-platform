import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, User, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, X } from 'lucide-react';
import api from '../../../services/api';

export default function Step2ContactVerification({ state, onChange, onNext, onBack }) {
  // Target type: 'primary_email' | 'personal_email' | 'mobile'
  const [activeOtpTarget, setActiveOtpTarget] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(null); // 'primary_email' | 'personal_email' | 'mobile'

  // Form input state for Change Contact modal
  const [changeInputValue, setChangeInputValue] = useState('');
  const [changeError, setChangeError] = useState('');

  // OTP State & Refs (6 digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const otpBoxRef0 = useRef(null);
  const otpBoxRef1 = useRef(null);
  const otpBoxRef2 = useRef(null);
  const otpBoxRef3 = useRef(null);
  const otpBoxRef4 = useRef(null);
  const otpBoxRef5 = useRef(null);
  const otpRefs = [otpBoxRef0, otpBoxRef1, otpBoxRef2, otpBoxRef3, otpBoxRef4, otpBoxRef5];

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

  // Countdown timer for OTP resend (60 seconds)
  useEffect(() => {
    let timer;
    if (activeOtpTarget && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeOtpTarget, resendTimer]);

  // Get contact value based on target
  const getContactValue = (target) => {
    if (target === 'primary_email') return basic.primaryEmail || 'student@placentra.edu';
    if (target === 'personal_email') return data.personalEmail || basic.primaryEmail || 'student@placentra.edu';
    if (target === 'mobile') return basic.mobileNumber || '9876543210';
    return '';
  };

  // 1. Send OTP Request to Backend
  const handleOpenOtpModal = async (target) => {
    const contactValue = getContactValue(target);
    setActiveOtpTarget(target);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setOtpSuccessMsg('');
    setResendTimer(60);
    setIsSendingOtp(true);

    try {
      const res = await api.post('/api/v1/auth/otp/send/', {
        target_type: target,
        contact_value: contactValue
      });

      setOtpSuccessMsg(`OTP sent to ${contactValue}`);
      if (res.data?.otp) {
        console.log(`[DEV OTP] Generated OTP for ${contactValue}: ${res.data.otp}`);
        const digits = String(res.data.otp).split('').slice(0, 6);
        setOtpDigits(digits);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to send OTP via SMS/Email service. You may verify later from your profile.';
      setOtpError(errMsg);
    } finally {
      setIsSendingOtp(false);
      setTimeout(() => {
        if (otpRefs[0].current) otpRefs[0].current.focus();
      }, 100);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0 || !activeOtpTarget) return;
    await handleOpenOtpModal(activeOtpTarget);
  };

  // OTP Input change handlers
  const handleOtpChange = (index, value) => {
    const numericVal = value.replace(/\D/g, '');
    if (!numericVal && value !== '') return;

    const newDigits = [...otpDigits];

    if (numericVal.length > 1) {
      const pasted = numericVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 5);
      if (otpRefs[focusIndex].current) {
        otpRefs[focusIndex].current.focus();
      }
      return;
    }

    newDigits[index] = numericVal;
    setOtpDigits(newDigits);

    if (numericVal && index < 5 && otpRefs[index + 1].current) {
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
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setOtpDigits(newDigits);

    const nextFocus = Math.min(pastedData.length, 5);
    if (otpRefs[nextFocus].current) {
      otpRefs[nextFocus].current.focus();
    }
  };

  // 2. Verify OTP Submit to Backend
  const handleVerifyOtpSubmit = async () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please enter the complete 6-digit OTP.');
      return;
    }

    const contactValue = getContactValue(activeOtpTarget);
    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const res = await api.post('/api/v1/auth/otp/verify/', {
        target_type: activeOtpTarget,
        contact_value: contactValue,
        otp: enteredOtp
      });

      if (res.data?.is_verified) {
        if (activeOtpTarget === 'primary_email') {
          onChange('contactVerification', { ...data, primaryEmailVerified: true });
        } else if (activeOtpTarget === 'personal_email') {
          onChange('contactVerification', { ...data, personalEmailVerified: true });
        } else if (activeOtpTarget === 'mobile') {
          onChange('contactVerification', { ...data, mobileVerified: true });
        }
        setActiveOtpTarget(null);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Invalid OTP. Please check and try again.';
      setOtpError(errMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3. Change Contact Handler (Primary Email, Personal Email, Mobile)
  const handleOpenChangeModal = (target) => {
    setShowChangeModal(target);
    setChangeError('');
    if (target === 'primary_email') setChangeInputValue(basic.primaryEmail || '');
    else if (target === 'personal_email') setChangeInputValue(data.personalEmail || basic.primaryEmail || '');
    else if (target === 'mobile') setChangeInputValue(basic.mobileNumber || '');
  };

  const handleSaveChangeContact = async (e) => {
    e.preventDefault();
    setChangeError('');

    const value = changeInputValue.trim();

    if (showChangeModal.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setChangeError('Please enter a valid email address.');
        return;
      }
    } else if (showChangeModal === 'mobile') {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(value.replace(/\D/g, ''))) {
        setChangeError('Please enter a valid 10-digit Indian mobile number.');
        return;
      }
    }

    try {
      // Check duplicate contact via API
      const res = await api.post('/api/v1/auth/otp/check-contact/', {
        target_type: showChangeModal,
        contact_value: value
      });

      if (res.data?.available) {
        if (showChangeModal === 'primary_email') {
          onChange('basicDetails', { ...basic, primaryEmail: value });
          onChange('contactVerification', { ...data, primaryEmailVerified: false });
        } else if (showChangeModal === 'personal_email') {
          onChange('contactVerification', { ...data, personalEmail: value, personalEmailVerified: false });
        } else if (showChangeModal === 'mobile') {
          onChange('basicDetails', { ...basic, mobileNumber: value });
          onChange('contactVerification', { ...data, mobileVerified: false });
        }

        const target = showChangeModal;
        setShowChangeModal(null);

        // Trigger OTP modal for newly changed contact
        setTimeout(() => {
          handleOpenOtpModal(target);
        }, 150);
      }
    } catch (err) {
      setChangeError(err?.response?.data?.error || 'This contact detail is unavailable or already registered.');
    }
  };

  // Address Save Handler
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
  const isMobileVerified = Boolean(data.mobileVerified);

  // In development mode, verification is not mandatory for completing registration
  const isFormValid = hasAddress;

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

      {/* Notice Banner for Pending Verifications */}
      {(!isPrimaryEmailVerified || !isMobileVerified) && (
        <div className="wizard-alert alert-amber" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>You can verify your email and mobile later from your profile.</span>
        </div>
      )}

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
                <div className="card-value">{basic.primaryEmail || 'student@placentra.edu'}</div>
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
                  onClick={() => handleOpenOtpModal('primary_email')}
                >
                  Verify Email
                </button>
              )}
              <button 
                type="button" 
                className="btn-card-action"
                onClick={() => handleOpenChangeModal('primary_email')}
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
                <div className="card-value">{data.personalEmail || basic.primaryEmail || 'student@placentra.edu'}</div>
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
                  onClick={() => handleOpenOtpModal('personal_email')}
                >
                  Verify Email
                </button>
              )}
              <button 
                type="button" 
                className="btn-card-action"
                onClick={() => handleOpenChangeModal('personal_email')}
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
                <div className="card-value">+91 {basic.mobileNumber || '9876543210'}</div>
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
                onClick={() => handleOpenChangeModal('mobile')}
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
            checked={Boolean(data.sameAsPermanent)}
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

      {/* Dialog 1: OTP Modal (Email & Mobile) */}
      {activeOtpTarget && (
        <div className="modal-overlay">
          <div className="modal-card otp-modal-card">
            <div className="modal-header">
              <h3>
                Verify {activeOtpTarget === 'mobile' ? 'Mobile Number' : 'Email'} OTP
              </h3>
              <button className="modal-close-btn" onClick={() => setActiveOtpTarget(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body text-center">
              <p className="otp-modal-desc">
                An OTP has been sent to <span className="highlight-email">{getContactValue(activeOtpTarget)}</span>. 
                Please check your inbox or mobile messages!
              </p>

              {otpError && (
                <div className="wizard-alert alert-amber otp-warning-banner" style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccessMsg && !otpError && (
                <div className="wizard-alert alert-green otp-warning-banner" style={{ color: '#047857', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              <div className="otp-prompt-label">
                Enter the 6-digit OTP code below.
              </div>

              <div className="resend-timer-text">
                {resendTimer > 0 ? (
                  <>You can re-send the OTP in <span className="timer-sec">{resendTimer}s</span></>
                ) : (
                  <button 
                    type="button" 
                    className="btn-card-action"
                    style={{ fontSize: '13px', textDecoration: 'underline' }}
                    onClick={handleResendOtp}
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>

              {/* 6-Digit OTP Input Grid */}
              <div className="otp-4digit-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }} onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="otp-single-box"
                    style={{ width: '42px', height: '48px', fontSize: '18px', textAlign: 'center' }}
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
                disabled={isVerifyingOtp || isSendingOtp}
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog 2: Change Contact Modal (Email / Phone) */}
      {showChangeModal && (
        <div className="modal-overlay">
          <div className="modal-card address-modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>
                Change {showChangeModal === 'mobile' ? 'Mobile Number' : 'Email Address'}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowChangeModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveChangeContact}>
              <div className="modal-body">
                {changeError && (
                  <div className="wizard-alert alert-amber" style={{ color: '#EF4444', marginBottom: '16px' }}>
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{changeError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    New {showChangeModal === 'mobile' ? 'Mobile Number' : 'Email Address'} <span className="req">*</span>
                  </label>
                  <input 
                    type={showChangeModal === 'mobile' ? 'tel' : 'email'} 
                    className="form-control"
                    placeholder={showChangeModal === 'mobile' ? '9876543210' : 'name@example.com'}
                    value={changeInputValue}
                    onChange={(e) => setChangeInputValue(e.target.value)}
                    required
                  />
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '8px', lineHeight: 1.4 }}>
                  Note: Updating this contact detail will reset your verification status and require a new OTP verification.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-wizard-secondary"
                  onClick={() => setShowChangeModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wizard-primary">
                  Save & Request OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog 3: Add / Edit Permanent Address Modal */}
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
                    checked={Boolean(addressForm.setCurrent)}
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
