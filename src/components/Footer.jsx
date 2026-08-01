import React from 'react';
import { Shield, Mail, Phone } from 'lucide-react';
import './Footer.css';

// SVG Social Icons to guarantee compatibility
const LinkedinIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & Tagline */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="logo-icon-wrap">
                <Shield className="logo-shield" />
              </div>
              <span className="logo-text">PLACENTRA</span>
            </div>
            <p className="footer-brand-desc">
              AI-powered platform connecting students, recruiters, and placement officers for smarter placements and brighter futures.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><a href="#students">For Students</a></li>
              <li><a href="#recruiters">For Recruiters</a></li>
              <li><a href="#officers">For Placement Officers</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>

          {/* Col 3: Resources Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links">
              <li><a href="#blog">Blog</a></li>
              <li><a href="#guide">Placement Guide</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#faqs">FAQs</a></li>
            </ul>
          </div>

          {/* Col 4: Company Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Col 5: Contact Us */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="contact-info-list">
              <div className="contact-item">
                <Mail size={16} className="contact-icon" />
                <span>support@placentra.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} className="contact-icon" />
                <span>+91 12345 67890</span>
              </div>
            </div>

            {/* Social Icons Row */}
            <div className="social-icons-row">
              <a href="#linkedin" className="social-icon-btn" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
              <a href="#instagram" className="social-icon-btn" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#youtube" className="social-icon-btn" aria-label="YouTube">
                <YoutubeIcon />
              </a>
              <a href="#twitter" className="social-icon-btn" aria-label="Twitter">
                <TwitterIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar Copyright */}
        <div className="footer-bottom-bar">
          <p>© 2025 PLACENTRA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
