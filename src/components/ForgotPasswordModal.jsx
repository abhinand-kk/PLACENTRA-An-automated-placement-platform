import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw,
  X
} from 'lucide-react';
import api from '../services/api';
import './ForgotPasswordModal.css';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Dev mode helper OTP display
  const [devOtp, setDevOtp] = useState('');

  // Handle countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setError('');
      setInfoMessage('');
      setDevOtp('');
      setCooldown(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/password-reset/send-otp/', { email: cleanEmail });
      setInfoMessage(res.data.message || 'If an account exists, a verification OTP has been sent.');
      if (res.data.otp) {
        setDevOtp(res.data.otp);
      }
      setCooldown(60);
      setStep(2);
    } catch (err) {
      console.error("Send OTP error:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/password-reset/verify-otp/', {
        email: email.trim().toLowerCase(),
        otp: cleanOtp
      });
      setResetToken(res.data.reset_token);
      setInfoMessage('OTP verified successfully! Please set your new password.');
      setStep(3);
    } catch (err) {
      console.error("Verify OTP error:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Confirm Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/password-reset/confirm/', {
        email: email.trim().toLowerCase(),
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setInfoMessage(res.data.message || 'Your password has been reset successfully.');
      setStep(4);
    } catch (err) {
      console.error("Reset Password error:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Password reset failed. Please restart the verification process.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/v1/auth/password-reset/send-otp/', {
        email: email.trim().toLowerCase()
      });
      setInfoMessage('A new verification OTP has been sent to your email.');
      if (res.data.otp) {
        setDevOtp(res.data.otp);
      }
      setCooldown(60);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-modal-overlay" onClick={onClose}>
      <div className="reset-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Icon */}
        <button type="button" className="reset-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="reset-modal-header">
          <div className="reset-welcome-badge">
            <Shield size={14} />
            <span>Account Security</span>
          </div>
          
          {step === 1 && <h2 className="reset-title">Forgot Password?</h2>}
          {step === 2 && <h2 className="reset-title">Verify OTP Code</h2>}
          {step === 3 && <h2 className="reset-title">Create New Password</h2>}
          {step === 4 && <h2 className="reset-title">Reset Complete</h2>}

          {step === 1 && (
            <p className="reset-subtitle">
              Enter your registered email address to receive a verification OTP.
            </p>
          )}
          {step === 2 && (
            <p className="reset-subtitle">
              Enter the 6-digit OTP code sent to <strong>{email}</strong>
            </p>
          )}
          {step === 3 && (
            <p className="reset-subtitle">
              Enter and confirm your new security password.
            </p>
          )}
          {step === 4 && (
            <p className="reset-subtitle">
              Your password has been updated. You can now log in with your new password.
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="reset-error-banner">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && step !== 4 && (
          <div className="reset-info-banner">
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Development Helper OTP Badge */}
        {devOtp && step === 2 && (
          <div className="reset-dev-otp-badge">
            <span>[DEV TESTING] Verification OTP: <strong>{devOtp}</strong></span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="reset-form-group">
            <div className="reset-field-wrap">
              <label htmlFor="reset-email" className="reset-label">
                Registered Email Address <span className="reset-label-req">*</span>
              </label>
              <div className="reset-input-box">
                <Mail size={18} className="reset-input-icon" />
                <input
                  id="reset-email"
                  type="email"
                  className="reset-input"
                  placeholder="name@institution.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="reset-submit-btn" disabled={loading}>
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
            </button>

            <button type="button" className="reset-back-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="reset-form-group">
            <div className="reset-field-wrap">
              <label htmlFor="reset-otp" className="reset-label">
                6-Digit OTP Code <span className="reset-label-req">*</span>
              </label>
              <div className="reset-input-box">
                <KeyRound size={18} className="reset-input-icon" />
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  className="reset-input code-text-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="reset-resend-row">
              <span className="reset-resend-text">Didn't receive the code?</span>
              <button
                type="button"
                className={`reset-resend-btn ${cooldown > 0 ? 'disabled' : ''}`}
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
              >
                <RotateCw size={14} className={loading ? 'spin-icon' : ''} />
                <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}</span>
              </button>
            </div>

            <button type="submit" className="reset-submit-btn" disabled={loading}>
              <span>{loading ? 'Verifying...' : 'Verify OTP & Proceed'}</span>
            </button>

            <button type="button" className="reset-back-btn" onClick={() => setStep(1)}>
              <ArrowLeft size={16} />
              <span>Change Email</span>
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="reset-form-group">
            <div className="reset-field-wrap">
              <label htmlFor="reset-new-password" className="reset-label">
                New Password <span className="reset-label-req">*</span>
              </label>
              <div className="reset-input-box">
                <Lock size={18} className="reset-input-icon" />
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className="reset-input"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="reset-toggle-eye-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="reset-field-wrap">
              <label htmlFor="reset-confirm-password" className="reset-label">
                Confirm New Password <span className="reset-label-req">*</span>
              </label>
              <div className="reset-input-box">
                <Lock size={18} className="reset-input-icon" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="reset-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="reset-toggle-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="reset-submit-btn" disabled={loading}>
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="reset-success-box">
            <div className="reset-success-icon-wrap">
              <CheckCircle2 size={48} className="reset-success-icon" />
            </div>
            <p className="reset-success-msg">
              Your account password has been updated successfully.
            </p>
            <button type="button" className="reset-submit-btn" onClick={onClose}>
              <span>Return to Login Page</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
