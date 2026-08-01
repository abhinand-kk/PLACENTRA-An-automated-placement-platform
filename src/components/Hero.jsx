import React from 'react';
import { ArrowRight, Play, Sparkles, Users, Building2, GraduationCap, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import './Hero.css';

export default function Hero({ role = 'officer' }) {
  const isRecruiter = role === 'recruiter';
  const isOfficer = role === 'officer';

  const getBgImg = () => {
    if (isOfficer) return '/hero-officer.jpg';
    if (isRecruiter) return '/hero-recruiter.png';
    return '/hero-campus.png';
  };

  const getBadgeText = () => {
    if (isOfficer) return 'AI-Driven Placement Management Platform';
    if (isRecruiter) return 'AI-Powered Recruitment Platform';
    return 'AI-Powered Campus Placement Platform';
  };

  return (
    <section className="hero-section">
      {/* Background Image Container */}
      <div className="hero-bg-overlay">
        <img 
          src={getBgImg()} 
          alt="Campus Placement Platform Background" 
          className="hero-bg-img" 
        />
        <div className="hero-gradient-overlay"></div>
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* AI Badge */}
          <div className="hero-badge">
            <Sparkles size={16} className="badge-sparkle" />
            <span>{getBadgeText()}</span>
          </div>

          {/* Main Headline */}
          {isOfficer ? (
            <h1 className="hero-title">
              Manage Placements<br />
              with <span className="text-green-gradient">Confidence.</span>
            </h1>
          ) : isRecruiter ? (
            <h1 className="hero-title">
              Find Exceptional<br />
              Talent. <span className="text-green-gradient">Faster.</span>
            </h1>
          ) : (
            <h1 className="hero-title">
              Connecting Talent.<br />
              <span className="text-green-gradient">Creating Futures.</span>
            </h1>
          )}

          {/* Subtitle */}
          <p className="hero-subtitle">
            {isOfficer
              ? 'Simplify placement drives, verify students, track recruitment activities, and analyze performance - all in one intelligent dashboard.'
              : isRecruiter 
              ? 'Discover AI-ranked candidates, streamline campus hiring, and recruit top talent from leading universities through one intelligent platform.'
              : 'Empowering students, recruiters, and placement officers through intelligent matching, verified opportunities, and seamless placement experiences.'
            }
          </p>

          {/* Action Buttons */}
          <div className="hero-buttons">
            <button className="btn btn-primary hero-btn-main">
              <span>{isOfficer ? 'Manage Placements' : isRecruiter ? 'Start Hiring' : 'Get Started'}</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline-white hero-btn-demo">
              <div className="play-icon-circle">
                <Play size={14} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span>{isOfficer ? 'Explore Features' : isRecruiter ? 'Book a Demo' : 'Watch Demo'}</span>
            </button>
          </div>
        </div>

        {/* Right Side Visual Overlay */}
        {isOfficer ? (
          <div className="hero-dashboard-visual">
            <div className="dashboard-card-window officer-dashboard">
              <div className="dashboard-header-bar">
                <span className="dashboard-title">Placement Overview</span>
                <div className="window-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
              </div>

              {/* Placement Stats Grid */}
              <div className="officer-metrics-grid">
                <div className="metric-box">
                  <span className="m-label">Drives Conducted</span>
                  <span className="m-val">25</span>
                  <span className="m-sub">320 Total</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">Offers Made</span>
                  <span className="m-val">320</span>
                  <span className="m-sub">90% Rate</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">Students Placed</span>
                  <span className="m-val">305</span>
                  <span className="m-sub">95% Success</span>
                </div>
              </div>

              {/* Placement Trend */}
              <div className="dashboard-chart-preview">
                <div className="chart-title">Placement Trend & Top Recruiters</div>
                <div className="chart-bars">
                  <div className="bar bar-1"></div>
                  <div className="bar bar-4"></div>
                  <div className="bar bar-2"></div>
                  <div className="bar bar-5"></div>
                  <div className="bar bar-3"></div>
                </div>
              </div>
            </div>
          </div>
        ) : isRecruiter ? (
          <div className="hero-dashboard-visual">
            <div className="dashboard-card-window">
              <div className="dashboard-header-bar">
                <span className="dashboard-title">Top Matched Candidates</span>
                <div className="window-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
              </div>

              <div className="dashboard-candidate-list">
                <div className="candidate-item">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80" alt="Candidate" className="cand-avatar" />
                  <div className="cand-info">
                    <span className="cand-name">Rohan Sharma</span>
                    <span className="cand-role">B.Tech CSE • 9.4 CGPA</span>
                  </div>
                  <div className="cand-match-badge">98% Match</div>
                </div>

                <div className="candidate-item">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80" alt="Candidate" className="cand-avatar" />
                  <div className="cand-info">
                    <span className="cand-name">Ananya Roy</span>
                    <span className="cand-role">Data Science • 9.2 CGPA</span>
                  </div>
                  <div className="cand-match-badge">95% Match</div>
                </div>

                <div className="candidate-item">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="Candidate" className="cand-avatar" />
                  <div className="cand-info">
                    <span className="cand-name">Vikram Seth</span>
                    <span className="cand-role">AI & ML • 9.1 CGPA</span>
                  </div>
                  <div className="cand-match-badge">92% Match</div>
                </div>
              </div>

              {/* Chart Mini Graphic */}
              <div className="dashboard-chart-preview">
                <div className="chart-title">Shortlist Overview</div>
                <div className="chart-bars">
                  <div className="bar bar-1"></div>
                  <div className="bar bar-2"></div>
                  <div className="bar bar-3"></div>
                  <div className="bar bar-4"></div>
                  <div className="bar bar-5"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-banner-visual">
            <div className="hanging-banner">
              <div className="banner-logo-wrap">
                <Shield size={28} className="banner-logo-icon" />
                <div className="banner-logo-title">PLACENTRA</div>
              </div>
              <div className="banner-motto">
                Building Connections.<br />
                Building Careers.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hero Stat Cards Bar (Bottom Overlaid Grid) */}
      <div className="container hero-stats-container">
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <div className="stat-icon-box">
              <Users size={22} className="stat-icon" />
            </div>
            <div className="stat-text-wrap">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Students Registered</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="stat-icon-box">
              <Building2 size={22} className="stat-icon" />
            </div>
            <div className="stat-text-wrap">
              <div className="stat-number">500+</div>
              <div className="stat-label">Recruiting Companies</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="stat-icon-box">
              <GraduationCap size={22} className="stat-icon" />
            </div>
            <div className="stat-text-wrap">
              <div className="stat-number">100+</div>
              <div className="stat-label">Partner Universities</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="stat-icon-box">
              <TrendingUp size={22} className="stat-icon" />
            </div>
            <div className="stat-text-wrap">
              <div className="stat-number">95%</div>
              <div className="stat-label">Placement Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
