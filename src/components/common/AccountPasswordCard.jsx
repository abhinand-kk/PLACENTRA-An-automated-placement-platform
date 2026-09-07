import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AccountPasswordCard({ 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  error, 
  setError 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Requirement checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const reqScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!password) return { text: '', color: '#CBD5E1', width: '0%' };
    if (reqScore <= 2) return { text: 'Weak', color: '#EF4444', width: '33%' };
    if (reqScore <= 4) return { text: 'Medium', color: '#F59E0B', width: '66%' };
    return { text: 'Strong', color: '#10B981', width: '100%' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="review-summary-card" style={{ marginTop: '24px', padding: '24px' }}>
      <div className="review-card-header" style={{ marginBottom: '18px' }}>
        <div className="review-title-group">
          <Lock size={18} color="#4F46E5" />
          <span className="review-card-title">Create Account Password</span>
        </div>
        <span className="badge-editable-anytime">Security</span>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px', marginTop: '-6px' }}>
        Set a secure password for your account. You will use your email address and this password to log in.
      </p>

      {error && (
        <div className="wizard-alert alert-amber" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#EF4444', marginBottom: '16px', fontSize: '13px' }}>
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="form-grid-2" style={{ gap: '20px' }}>
        {/* Password Field */}
        <div className="form-group">
          <label className="form-label">
            Account Password <span className="req">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${error && !password ? 'invalid' : ''}`}
              placeholder="Create strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              style={{ paddingRight: '42px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength Bar */}
          {password && (
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

        {/* Confirm Password Field */}
        <div className="form-group">
          <label className="form-label">
            Confirm Password <span className="req">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={`form-control ${error && (!confirmPassword || password !== confirmPassword) ? 'invalid' : ''}`}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              style={{ paddingRight: '42px' }}
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
          {confirmPassword && password !== confirmPassword && (
            <span style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
              Passwords do not match.
            </span>
          )}
        </div>
      </div>

      {/* Password Requirements Checklist Helper */}
      <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
          Password Requirements:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '11.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasMinLength ? '#059669' : '#64748B' }}>
            <CheckCircle2 size={13} color={hasMinLength ? '#10B981' : '#94A3B8'} />
            <span>Minimum 8 characters</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasUppercase ? '#059669' : '#64748B' }}>
            <CheckCircle2 size={13} color={hasUppercase ? '#10B981' : '#94A3B8'} />
            <span>At least 1 uppercase letter (A-Z)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLowercase ? '#059669' : '#64748B' }}>
            <CheckCircle2 size={13} color={hasLowercase ? '#10B981' : '#94A3B8'} />
            <span>At least 1 lowercase letter (a-z)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasNumber ? '#059669' : '#64748B' }}>
            <CheckCircle2 size={13} color={hasNumber ? '#10B981' : '#94A3B8'} />
            <span>At least 1 number (0-9)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasSpecial ? '#059669' : '#64748B' }}>
            <CheckCircle2 size={13} color={hasSpecial ? '#10B981' : '#94A3B8'} />
            <span>At least 1 special character (!@#$)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
