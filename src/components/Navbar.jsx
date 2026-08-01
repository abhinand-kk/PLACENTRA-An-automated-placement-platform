import React from 'react';
import { User, LogIn, UserPlus, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activeRole = 'officer', onRoleChange }) {
  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="navbar-logo" onClick={() => onRoleChange && onRoleChange('student')}>
          <div className="logo-icon-wrap">
            <Shield className="logo-shield" />
            <span className="logo-dot"></span>
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
          <button className="btn btn-outline-green btn-signup">
            <span>Sign Up</span>
            <UserPlus size={16} />
          </button>
          <button className="btn btn-dark btn-login">
            <span>Login</span>
            <LogIn size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
