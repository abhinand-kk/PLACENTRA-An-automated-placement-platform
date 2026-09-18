import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Shield } from 'lucide-react';
import api from '../../services/api';

export default function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Requirement checks for new password strength
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const reqScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!newPassword) return { text: '', color: '#CBD5E1', width: '0%' };
    if (reqScore <= 2) return { text: 'Weak', color: '#EF4444', width: '33%' };
    if (reqScore <= 4) return { text: 'Medium', color: '#F59E0B', width: '66%' };
    return { text: 'Strong', color: '#10B981', width: '100%' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    if (!oldPassword) {
      setError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      setSuccessMsg(res.data?.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Password change error:", err);
      const serverErr = err.response?.data?.error || 
                        err.response?.data?.old_password?.[0] || 
                        err.response?.data?.new_password?.[0] || 
                        'Failed to change password. Please check your credentials.';
      setError(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card-panel" style={{ marginTop: '24px', padding: '24px' }}>
      <div className="panel-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <KeyRound size={20} color="#10B981" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
            Account Password & Security
          </h3>
        </div>
        <span className="status-pill pill-completed">
          <Shield size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          Protected
        </span>
      </div>

      <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '20px', marginTop: '-4px' }}>
        Update your account password. Ensure your new password contains letters, numbers, and special characters.
      </p>

      {successMsg && (
        <div className="modal-success-banner" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="modal-error-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Current Password */}
        <div className="form-group">
          <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Current Password <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showOldPassword ? 'text' : 'password'}
              required
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (error) setError(null);
              }}
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              title={showOldPassword ? "Hide password" : "Show password"}
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password & Confirm Password Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          {/* New Password */}
          <div className="form-group">
            <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              New Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Bar */}
            {newPassword && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Password Strength:</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>{strength.text}</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="form-group">
            <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                Passwords do not match.
              </span>
            )}
          </div>
        </div>

        {/* Requirements Indicator */}
        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
            Security Requirements:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasMinLength ? '#059669' : '#64748B' }}>
              <CheckCircle2 size={13} color={hasMinLength ? '#10B981' : '#94A3B8'} />
              <span>Min 8 characters</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasUppercase ? '#059669' : '#64748B' }}>
              <CheckCircle2 size={13} color={hasUppercase ? '#10B981' : '#94A3B8'} />
              <span>Uppercase letter (A-Z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLowercase ? '#059669' : '#64748B' }}>
              <CheckCircle2 size={13} color={hasLowercase ? '#10B981' : '#94A3B8'} />
              <span>Lowercase letter (a-z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasNumber ? '#059669' : '#64748B' }}>
              <CheckCircle2 size={13} color={hasNumber ? '#10B981' : '#94A3B8'} />
              <span>Number (0-9)</span>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Lock size={16} />
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
