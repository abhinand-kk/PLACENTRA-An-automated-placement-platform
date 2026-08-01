import React from 'react';
import { Rocket, ArrowRight, User, Building2 } from 'lucide-react';
import './CTABanner.css';

export default function CTABanner({ role = 'officer' }) {
  const isRecruiter = role === 'recruiter';
  const isOfficer = role === 'officer';

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box">
          {/* Decorative Dot Matrix Pattern on the Right */}
          <div className="dot-matrix-pattern"></div>

          <div className="cta-content-left">
            <div className="cta-rocket-badge">
              {isOfficer ? (
                <Building2 size={24} className="rocket-icon" />
              ) : (
                <Rocket size={24} className="rocket-icon" />
              )}
            </div>

            <div className="cta-text-group">
              <h2 className="cta-title">
                {isOfficer 
                  ? 'Ready to Simplify Campus Placements?'
                  : isRecruiter 
                  ? 'Ready to Hire Top Campus Talent?' 
                  : 'Ready to Transform Campus Placements?'
                }
              </h2>
              <p className="cta-desc">
                {isOfficer
                  ? 'Join thousands of placement officers using PLACENTRA to manage drives, connect recruiters, and empower students.'
                  : isRecruiter 
                  ? 'Join hundreds of recruiters who trust PLACENTRA to find, screen, and hire the best talent faster.'
                  : 'Join thousands of students, recruiters, and placement officers building successful careers and organizations.'
                }
              </p>
            </div>
          </div>

          <div className="cta-buttons-right">
            <button className="btn btn-white cta-btn-start">
              <span>{isOfficer ? 'Manage Placements' : isRecruiter ? 'Start Hiring Now' : 'Get Started Now'}</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline-white cta-btn-contact">
              <span>Contact Us</span>
              <User size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
