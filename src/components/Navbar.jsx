import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, UserPlus, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './Navbar.css';

export default function Navbar({ activeRole = 'officer', onRoleChange, onOpenWizard }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon-wrap" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/placentra-logo.png" alt="PLACENTRA Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <span className="logo-text">PLACENTRA</span>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-menu">
          <button 
            className={`nav-link-btn ${activeRole === 'student' ? 'active-role' : ''}`}
            onClick={() => onRoleChange && onRoleChange('student')}
          >
            Student
          </button>
          <button 
            className={`nav-link-btn ${activeRole === 'recruiter' ? 'active-role' : ''}`}
            onClick={() => onRoleChange && onRoleChange('recruiter')}
          >
            Recruiter
          </button>
          <button 
            className={`nav-link-btn ${activeRole === 'officer' ? 'active-role' : ''}`}
            onClick={() => onRoleChange && onRoleChange('officer')}
          >
            Placement Officer
          </button>
          <a href="#about" className="nav-link">About Us</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button className="btn btn-outline-green btn-signup" onClick={onOpenWizard}>
            <span>Student Registration Wizard</span>
            <UserPlus size={16} />
          </button>
          {token ? (
            <button className="btn btn-dark btn-login" onClick={logout}>
              <span>Logout ({user?.username || 'User'})</span>
              <LogOut size={16} />
            </button>
          ) : (
            <button className="btn btn-dark btn-login" onClick={() => navigate('/login')}>
              <span>Login</span>
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
}
