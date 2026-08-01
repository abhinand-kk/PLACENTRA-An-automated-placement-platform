import React from 'react';
import './PartnerUniversities.css';

export default function PartnerUniversities() {
  return (
    <section className="partners-section">
      <div className="container">
        <h2 className="section-title">Our Partner Universities</h2>

        <div className="partners-grid">
          {/* 1. Amal Jyothi */}
          <div className="partner-card">
            <div className="uni-logo-box">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="#991B1B" stroke="#B91C1C" strokeWidth="3"/>
                <path d="M50 20 L75 35 L75 60 L50 80 L25 60 L25 35 Z" fill="#FFFFFF"/>
                <circle cx="50" cy="45" r="12" fill="#991B1B"/>
                <path d="M50 35 L55 45 L50 55 L45 45 Z" fill="#FBBF24"/>
              </svg>
              <div className="uni-text-group">
                <span className="uni-brand-red">AMAL JYOTHI</span>
                <span className="uni-sub-text">COLLEGE OF ENGINEERING</span>
              </div>
            </div>
          </div>

          {/* 2. Rajagiri */}
          <div className="partner-card">
            <div className="uni-logo-box">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="#047857" strokeWidth="4" fill="#ECFDF5"/>
                <circle cx="50" cy="50" r="32" stroke="#059669" strokeWidth="2" strokeDasharray="4 2"/>
                <path d="M50 25 L65 40 L50 75 L35 40 Z" fill="#047857"/>
                <circle cx="50" cy="38" r="6" fill="#F59E0B"/>
              </svg>
              <div className="uni-text-group">
                <span className="uni-brand-green">Rajagiri</span>
                <span className="uni-sub-text">College of Social Sciences</span>
              </div>
            </div>
          </div>

          {/* 3. Saintgits */}
          <div className="partner-card">
            <div className="uni-logo-box">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" fill="#DC2626"/>
                <path d="M50 15 L55 35 L75 35 L60 48 L65 68 L50 55 L35 68 L40 48 L25 35 L45 35 Z" fill="#FFFFFF"/>
                <circle cx="50" cy="50" r="14" fill="#DC2626"/>
              </svg>
              <div className="uni-text-group">
                <span className="uni-brand-orange">SAINTGITS</span>
                <span className="uni-sub-text">College of Engineering</span>
              </div>
            </div>
          </div>

          {/* 4. Marian College */}
          <div className="partner-card">
            <div className="uni-logo-box">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <rect x="15" y="15" width="70" height="70" rx="12" fill="#1E40AF"/>
                <path d="M50 25 L75 75 L25 75 Z" fill="#FFFFFF"/>
                <circle cx="50" cy="55" r="10" fill="#1E40AF"/>
              </svg>
              <div className="uni-text-group">
                <span className="uni-brand-blue">Marian</span>
                <span className="uni-sub-text">College of Engineering<br/>KUTTIKKANAM</span>
              </div>
            </div>
          </div>

          {/* 5. CET */}
          <div className="partner-card">
            <div className="uni-logo-box">
              <div className="cet-logo-text">CET</div>
              <span className="uni-sub-text cet-sub">COLLEGE OF ENGINEERING TRIVANDRUM</span>
            </div>
          </div>

          {/* 6. + More Universities */}
          <div className="partner-card card-more">
            <span className="more-text">+ More<br />Universities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
