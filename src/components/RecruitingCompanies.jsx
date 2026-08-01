import React from 'react';
import './RecruitingCompanies.css';

export default function RecruitingCompanies() {
  return (
    <section className="companies-section">
      <div className="container">
        <h2 className="section-title">Top Recruiting Companies</h2>

        <div className="companies-grid">
          {/* 1. TCS */}
          <div className="company-card">
            <div className="logo-tcs-wrap">
              <span className="tcs-main">tcs</span>
              <span className="tcs-sub">TATA CONSULTANCY SERVICES</span>
            </div>
          </div>

          {/* 2. Infosys */}
          <div className="company-card">
            <span className="logo-infosys">Infosys</span>
          </div>

          {/* 3. Accenture */}
          <div className="company-card">
            <div className="logo-accenture-wrap">
              <span className="accenture-text">accenture</span>
              <span className="accenture-caret">&gt;</span>
            </div>
          </div>

          {/* 4. Wipro */}
          <div className="company-card">
            <div className="logo-wipro-wrap">
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none" className="wipro-dots">
                <circle cx="50" cy="20" r="10" fill="#E11D48"/>
                <circle cx="78" cy="35" r="10" fill="#0284C7"/>
                <circle cx="78" cy="65" r="10" fill="#10B981"/>
                <circle cx="50" cy="80" r="10" fill="#F59E0B"/>
                <circle cx="22" cy="65" r="10" fill="#8B5CF6"/>
                <circle cx="22" cy="35" r="10" fill="#EC4899"/>
              </svg>
              <span className="wipro-text">wipro</span>
            </div>
          </div>

          {/* 5. Deloitte */}
          <div className="company-card">
            <span className="logo-deloitte">
              Deloitte<span className="deloitte-dot">.</span>
            </span>
          </div>

          {/* 6. IBM */}
          <div className="company-card">
            <span className="logo-ibm">IBM</span>
          </div>

          {/* 7. Cognizant */}
          <div className="company-card">
            <span className="logo-cognizant">Cognizant</span>
          </div>

          {/* 8. + More Companies */}
          <div className="company-card card-more">
            <span className="more-text">+ More<br />Companies</span>
          </div>
        </div>
      </div>
    </section>
  );
}
