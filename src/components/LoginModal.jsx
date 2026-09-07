import React, { useState } from 'react';
import { X, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(emailOrUsername, password);
      onClose();
      if (data.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (data.role === 'placement_officer') {
        navigate('/placement-officer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.errors?.non_field_errors?.[0] || err?.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-card">
        <button className="btn-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="login-modal-header">
          <div className="modal-icon-badge"><LogIn size={20} color="#6366F1" /></div>
          <h3>Login to PLACENTRA</h3>
          <p>Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email or Username</label>
            <div className="input-with-icon">
              <Mail size={16} color="#64748B" />
              <input 
                type="text" 
                placeholder="Enter email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} color="#64748B" />
              <input 
                type="password" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
