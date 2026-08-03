import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function RecruiterDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#ECFDF5',
        color: '#10B981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <CheckCircle2 size={36} />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
        Recruiter Registration Successful!
      </h1>
      <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '520px', marginBottom: '32px', lineHeight: 1.6 }}>
        Welcome to the PLACENTRA Employer Portal. Your company profile has been created.
      </p>

      <button 
        onClick={() => navigate('/')} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#4F46E5',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 700,
          padding: '12px 28px',
          borderRadius: '30px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Home</span>
      </button>
    </div>
  );
}
