import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  ArrowLeft, 
  ChevronRight, 
  UserCheck, 
  Building2, 
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form & UI States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call POST /api/v1/auth/login/ via login handler
      const data = await login(email, password);

      // 2. Read role from backend response
      const userRole = data?.role || data?.user?.role || localStorage.getItem('user_role');

      // 3. Automatic Redirect based on user role
      if (userRole === 'recruiter' || userRole === 'Recruiter') {
        navigate('/recruiter/dashboard');
      } else if (userRole === 'placement_officer' || userRole === 'Placement Officer') {
        navigate('/placement-officer/dashboard');
      } else if (userRole === 'student' || userRole === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      // 4. Display error ONLY when backend returns non-200 response
      console.warn("Backend Login Error (Non-200):", err?.response?.data || err?.message);

      const errResponse = err?.response?.data;
      let errMsg = 'Invalid email or password.';

      if (!err?.response) {
        errMsg = 'Unable to connect to the backend server. Please try again in a moment.';
      } else if (errResponse) {
        if (typeof errResponse.detail === 'string') {
          errMsg = errResponse.detail;
        } else if (typeof errResponse.message === 'string') {
          errMsg = errResponse.message;
        } else if (Array.isArray(errResponse.non_field_errors) && errResponse.non_field_errors[0]) {
          errMsg = errResponse.non_field_errors[0];
        } else if (errResponse.errors && Array.isArray(errResponse.errors.non_field_errors) && errResponse.errors.non_field_errors[0]) {
          errMsg = errResponse.errors.non_field_errors[0];
        } else if (typeof errResponse.errors === 'string') {
          errMsg = errResponse.errors;
        }
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top Header Navbar */}
      <header className="login-top-navbar">
        <Link to="/" className="login-brand-logo">
          <div className="login-logo-shield-wrap" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/placentra-logo.png" alt="PLACENTRA Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <span className="login-logo-text">PLACENTRA</span>
        </Link>

        <Link to="/" className="login-back-home-btn">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Center Login Container */}
      <main className="login-main-container">
        <div className="login-card">
          {/* Card Header */}
          <div className="login-card-header">
            <div className="login-welcome-badge">
              <Shield size={14} />
              <span>Campus Placement Platform</span>
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to access your PLACENTRA account and placement portal
            </p>
          </div>

          {/* Error Banner Alert */}
          {error && (
            <div className="login-error-banner" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13.5px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form-group">
            {/* Email Address Field */}
            <div className="login-field-wrap">
              <label htmlFor="login-email" className="login-label">
                Email Address <span className="login-label-req">*</span>
              </label>
              <div className="login-input-box">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="name@institution.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-wrap">
              <label htmlFor="login-password" className="login-label">
                Password <span className="login-label-req">*</span>
              </label>
              <div className="login-input-box">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="login-options-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  className="login-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>

              <a
                href="#forgot-password"
                className="login-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact your placement administrator to reset your password.");
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Login Button */}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <LogIn size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line"></div>
            <span className="login-divider-text">Don't have an account?</span>
            <div className="login-divider-line"></div>
          </div>

          {/* Registration Role Options */}
          <div className="login-register-section">
            <p className="login-register-prompt">Select your role to register:</p>

            {/* 1. Student Registration Button */}
            <button
              type="button"
              className="login-reg-btn login-reg-btn-student"
              onClick={() => navigate('/student/register')}
            >
              <div className="login-reg-btn-left">
                <div className="login-reg-icon-badge badge-student">
                  <UserCheck size={16} />
                </div>
                <span>Student Registration</span>
              </div>
              <ChevronRight size={16} color="#64748B" />
            </button>

            {/* 2. Recruiter Registration Button */}
            <button
              type="button"
              className="login-reg-btn login-reg-btn-recruiter"
              onClick={() => navigate('/recruiter/register')}
            >
              <div className="login-reg-btn-left">
                <div className="login-reg-icon-badge badge-recruiter">
                  <Building2 size={16} />
                </div>
                <span>Recruiter Registration</span>
              </div>
              <ChevronRight size={16} color="#64748B" />
            </button>

            {/* 3. Placement Officer Registration Button */}
            <button
              type="button"
              className="login-reg-btn login-reg-btn-officer"
              onClick={() => navigate('/placement-officer/register')}
            >
              <div className="login-reg-btn-left">
                <div className="login-reg-icon-badge badge-officer">
                  <GraduationCap size={16} />
                </div>
                <span>Placement Officer Registration</span>
              </div>
              <ChevronRight size={16} color="#64748B" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="login-footer-copyright">
        © {new Date().getFullYear()} PLACENTRA. All rights reserved. Intelligent Candidate & Campus Placement Platform.
      </footer>
    </div>
  );
}
