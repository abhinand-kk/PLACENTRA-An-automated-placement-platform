import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Server,
  Database,
  Key,
  AlertCircle,
  UserCheck,
  Clock,
  Send,
  Building,
  GraduationCap,
  Globe
} from 'lucide-react';
import Footer from '../components/Footer';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  // Ensure the page scrolls to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page-wrapper">
      {/* Top Header / Navigation Bar */}
      <header className="privacy-header">
        <div className="container privacy-header-container">
          <Link to="/" className="privacy-brand-logo" aria-label="PLACENTRA Home">
            <img
              src="/placentra-logo.png"
              alt="PLACENTRA Logo"
              className="privacy-logo-img"
            />
            <span className="privacy-brand-name">PLACENTRA</span>
          </Link>

          <div className="privacy-header-actions">
            <Link to="/" className="privacy-back-link">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <Link to="/login" className="btn btn-dark privacy-header-login-btn">
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="privacy-hero-section">
        <div className="container">
          <div className="privacy-hero-badge">
            <Shield size={16} className="badge-icon" />
            <span>Platform Data Transparency &amp; Protection</span>
          </div>
          <h1 className="privacy-hero-title">Privacy Policy</h1>
          <p className="privacy-hero-subtitle">
            This policy outlines how PLACENTRA handles information, delivers transactional application emails,
            utilizes the Google Gmail API for official notifications, and maintains technical safeguards across our campus placement services.
          </p>

          <div className="privacy-metadata-row">
            <div className="meta-pill">
              <Clock size={14} />
              <span><strong>Effective Date:</strong> October 20, 2026</span>
            </div>
            <div className="meta-pill">
              <Globe size={14} />
              <span><strong>Website:</strong> placentra.abhinandkk.in</span>
            </div>
            <div className="meta-pill">
              <Mail size={14} />
              <span><strong>Sender Account:</strong> placentraeducation@gmail.com</span>
            </div>
            <div className="meta-pill">
              <Key size={14} />
              <span><strong>Google API Scope:</strong> gmail.send (Outgoing Only)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="privacy-content-section">
        <div className="container privacy-layout-grid">
          {/* Table of Contents Sticky Sidebar */}
          <aside className="privacy-toc-sidebar">
            <div className="toc-card">
              <h3 className="toc-title">Policy Sections</h3>
              <nav className="toc-nav">
                <a href="#overview" className="toc-link">1. Overview &amp; Purpose</a>
                <a href="#information-handled" className="toc-link">2. Information Handled</a>
                <a href="#email-delivery" className="toc-link">3. Transactional Email Delivery</a>
                <a href="#google-api-disclosure" className="toc-link active-toc-link">
                  4. Google Gmail API &amp; Limited Use
                </a>
                <a href="#service-providers" className="toc-link">5. Infrastructure &amp; Providers</a>
                <a href="#data-security" className="toc-link">6. Access Controls &amp; Security</a>
                <a href="#retention-deletion" className="toc-link">7. Retention &amp; Manual Deletion</a>
                <a href="#user-rights-contact" className="toc-link">8. User Rights &amp; Contact</a>
              </nav>

              <div className="toc-help-box">
                <AlertCircle size={16} className="help-icon" />
                <p>Have questions regarding your placement data or notifications?</p>
                <a href="mailto:placentraeducation@gmail.com" className="help-email-link">
                  placentraeducation@gmail.com
                </a>
              </div>
            </div>
          </aside>

          {/* Legal / Policy Content Articles */}
          <article className="privacy-articles-body">

            {/* Section 1: Overview */}
            <section id="overview" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">01</span>
                <h2>Overview &amp; Purpose</h2>
              </div>
              <p>
                <strong>PLACENTRA</strong> (accessible at <a href="https://placentra.abhinandkk.in/" target="_blank" rel="noopener noreferrer">https://placentra.abhinandkk.in/</a>)
                is an AI-powered campus placement and recruitment coordination platform engineered to streamline interactions between
                students, institutional placement offices, and prospective recruiting organizations.
              </p>
              <p>
                This Privacy Policy provides clear, genuine disclosure of how data is processed within PLACENTRA.
                PLACENTRA is designed exclusively for educational campus recruitment workflows.
                <strong> We do not sell, rent, trade, or commercialize student or recruiter personal data to third-party advertising brokers or external marketing networks.</strong>
              </p>
              <p>
                Platform data is processed strictly by our essential hosting, database, and email infrastructure providers
                (Vercel, Render, Supabase, Google Cloud, and Resend) solely to provide the services described in this policy.
                Information received from Google APIs is subject to additional strict restrictions detailed in Section 4.
              </p>
            </section>

            {/* Section 2: Information Handled */}
            <section id="information-handled" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">02</span>
                <h2>Information Handled by PLACENTRA</h2>
              </div>
              <p>
                PLACENTRA handles only the information necessary to fulfill candidate registration, job applications,
                eligibility screening, interview scheduling, and official offer letter delivery:
              </p>

              <div className="info-categories-grid">
                <div className="info-cat-box">
                  <div className="cat-header">
                    <UserCheck size={18} className="cat-icon" />
                    <h4>Account Details</h4>
                  </div>
                  <ul>
                    <li>Registered login email address</li>
                    <li>Cryptographically hashed password (never stored in plaintext)</li>
                    <li>Assigned platform role (Student, Recruiter, or Placement Officer)</li>
                    <li>Account creation and last login timestamps</li>
                  </ul>
                </div>

                <div className="info-cat-box">
                  <div className="cat-header">
                    <Mail size={18} className="cat-icon" />
                    <h4>Contact Information</h4>
                  </div>
                  <ul>
                    <li>Full legal name (first and last name)</li>
                    <li>Primary institutional email &amp; optional personal email</li>
                    <li>Candidate contact phone / mobile number</li>
                    <li>Residential address (city, district, state, pincode)</li>
                  </ul>
                </div>

                <div className="info-cat-box">
                  <div className="cat-header">
                    <GraduationCap size={18} className="cat-icon" />
                    <h4>Academic &amp; Profile Details</h4>
                  </div>
                  <ul>
                    <li>Affiliated educational institution &amp; campus</li>
                    <li>Institutional register number / roll identifier</li>
                    <li>Degree program, branch, batch year, and current semester</li>
                    <li>Cumulative Grade Point Average (CGPA) and active backlogs</li>
                    <li>Date of birth, gender, and blood group</li>
                    <li>Optional profile photograph</li>
                  </ul>
                </div>

                <div className="info-cat-box">
                  <div className="cat-header">
                    <FileText size={18} className="cat-icon" />
                    <h4>Resumes, Jobs &amp; Selection Records</h4>
                  </div>
                  <ul>
                    <li>Candidate resumes, marksheet PDFs, and certificates</li>
                    <li>Recruiter job descriptions, salary CTC packages, and criteria</li>
                    <li>Job applications submitted and application status history</li>
                    <li>Interview schedules, time slots, and virtual meeting links</li>
                    <li>Generated provisional selection offer letters (PDF format)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Transactional Email Delivery */}
            <section id="email-delivery" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">03</span>
                <h2>Transactional Email Delivery</h2>
              </div>
              <p>
                PLACENTRA delivers automated transactional emails strictly required for platform security,
                identity verification, and placement progress. These messages include:
              </p>

              <div className="email-workflows-list">
                <div className="email-workflow-item">
                  <div className="workflow-badge">Security</div>
                  <div className="workflow-content">
                    <strong>Numeric One-Time Passwords (OTPs):</strong> Cryptographically generated 6-digit numeric codes
                    sent to candidate or officer email addresses for email verification during account registration (valid for 10 minutes).
                  </div>
                </div>

                <div className="email-workflow-item">
                  <div className="workflow-badge">Authentication</div>
                  <div className="workflow-content">
                    <strong>Password Reset Codes:</strong> Secure 6-digit verification OTPs delivered to authorized users requesting
                    password recovery.
                  </div>
                </div>

                <div className="email-workflow-item">
                  <div className="workflow-badge">Application</div>
                  <div className="workflow-content">
                    <strong>Shortlist Notifications:</strong> Official notifications informing candidates that their profile has been
                    evaluated and shortlisted by a recruiter for a specific campus job posting.
                  </div>
                </div>

                <div className="email-workflow-item">
                  <div className="workflow-badge">Interview</div>
                  <div className="workflow-content">
                    <strong>Interview Invitations:</strong> Formal invitations for scheduled Technical or HR interviews detailing date,
                    time, duration, mode (Online/Offline), instructions, and an attached official Interview Invitation Letter (PDF).
                  </div>
                </div>

                <div className="email-workflow-item">
                  <div className="workflow-badge">Selection</div>
                  <div className="workflow-content">
                    <strong>Candidate Selection &amp; Offer Letters:</strong> Official placement confirmation emails notifying selected
                    students with job title, company name, offered CTC package, joining timeline, and an attached provisional Selection &amp; Offer Letter (PDF).
                  </div>
                </div>

                <div className="email-workflow-item">
                  <div className="workflow-badge">Administration</div>
                  <div className="workflow-content">
                    <strong>Placement Officer Registration Confirmations:</strong> Welcome and administrative onboarding notices sent upon
                    creation of institutional Placement Officer profiles.
                  </div>
                </div>
              </div>

              <div className="current-transport-notice">
                <AlertCircle size={18} className="transport-notice-icon" />
                <div className="transport-notice-text">
                  <strong>Current &amp; Planned Email Delivery Configuration:</strong>
                  <p>
                    In the currently deployed live production environment on Render, outgoing transactional emails are delivered via <strong>Resend</strong>.
                    A verified direct HTTPS integration with the official <strong>Google Gmail REST API</strong> using our authorized administrative mailbox <code>placentraeducation@gmail.com</code> and
                    the narrow <code>https://www.googleapis.com/auth/gmail.send</code> scope is planned for activation and takes effect once explicitly enabled in deployment settings.
                  </p>
                  <p>
                    PLACENTRA uses the Gmail API scope exclusively for outgoing transmission and does not read, access, scan, or process inbox messages.
                    Resend remains available only as an explicitly configured provider and does not act as an automatic or silent fallback if the Gmail API is enabled but misconfigured.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Google Gmail API Integration & Limited Use Disclosure */}
            <section id="google-api-disclosure" className="policy-card google-highlight-card">
              <div className="policy-section-header">
                <span className="section-number">04</span>
                <h2>Google Gmail API Integration &amp; Limited Use Disclosure</h2>
              </div>

              <div className="google-callout-box">
                <div className="google-callout-header">
                  <Send size={20} className="google-icon" />
                  <h3>Official Google Gmail REST API Transport</h3>
                </div>
                <p>
                  PLACENTRA integrates with the Google Gmail REST API over HTTPS using OAuth 2.0 authorization
                  to deliver outgoing platform emails from our designated administrative account:
                </p>
                <div className="account-pill">
                  <strong>Authorized Account:</strong> <code>placentraeducation@gmail.com</code>
                </div>
              </div>

              <h4 className="sub-title">1. Exact Scope of Authorization</h4>
              <p>
                PLACENTRA requests only the minimum narrow sending scope required for outgoing email transmission:
              </p>
              <div className="scope-box">
                <code>https://www.googleapis.com/auth/gmail.send</code>
              </div>
              <p>
                <strong>No Inbox or Email Reading Access:</strong> PLACENTRA uses this scope exclusively to send transactional
                messages (OTPs, interview schedules, and offer letters). <strong>PLACENTRA does not read, access, scan, index,
                search, or process incoming emails or the inbox of <code>placentraeducation@gmail.com</code> or any candidate.</strong>
              </p>

              <h4 className="sub-title">2. Google API Services User Data Policy — Limited Use Statement</h4>
              <p>
                In strict compliance with Google's requirements for developers utilizing Google APIs:
              </p>

              <blockquote className="limited-use-quote">
                &ldquo;PLACENTRA's use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.&rdquo;
              </blockquote>

              <p>
                For complete details regarding Google's policies, review the official policy document:
              </p>
              <div className="policy-link-container">
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-policy-link"
                >
                  <span>Google API Services User Data Policy</span>
                  <ExternalLink size={15} />
                </a>
              </div>

              <h4 className="sub-title">3. Data Handling Guarantees Under Google Limited Use</h4>
              <ul className="limited-use-list">
                <li>
                  <CheckCircle2 size={16} className="check-icon" />
                  <span><strong>No Third-Party Transfers:</strong> Information received through Google APIs is never transferred to any external third parties, other than Google's own API infrastructure required to transmit outgoing messages over HTTPS.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="check-icon" />
                  <span><strong>No Advertising Usage:</strong> Information received through Google APIs is never used for serving advertisements, retargeting campaigns, or broker monetization.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="check-icon" />
                  <span><strong>No AI/ML Model Training:</strong> Data obtained via Google APIs is never utilized to train generalized artificial intelligence or machine learning models.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="check-icon" />
                  <span><strong>No Human Inspection:</strong> Content sent via the Gmail API is processed programmatically without human inspection, unless required for system security or legal compliance.</span>
                </li>
              </ul>
            </section>

            {/* Section 5: Hosting & Service Providers */}
            <section id="service-providers" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">05</span>
                <h2>Hosting &amp; Third-Party Service Providers</h2>
              </div>
              <p>
                To provide high availability, data security, and seamless platform performance, PLACENTRA relies
                on trusted infrastructure service providers. Each provider processes application data solely for the designated purpose:
              </p>

              <div className="providers-grid">
                <div className="provider-box">
                  <div className="provider-header">
                    <Server size={18} className="provider-icon" />
                    <h4>Vercel Inc.</h4>
                  </div>
                  <div className="provider-role">Frontend Static &amp; Single-Page Application Hosting</div>
                  <p>
                    Hosts the compiled React and Vite user interface. Vercel serves static web assets (HTML, CSS, JS) over HTTPS
                    and routes browser requests to PLACENTRA's backend API.
                  </p>
                </div>

                <div className="provider-box">
                  <div className="provider-header">
                    <Server size={18} className="provider-icon" />
                    <h4>Render Services, Inc.</h4>
                  </div>
                  <div className="provider-role">Backend REST API Web Service Hosting</div>
                  <p>
                    Executes the Python 3.12 and Django REST Framework application server. Render processes authentication,
                    application logic, ReportLab PDF generation, and communicates with database and storage systems.
                  </p>
                </div>

                <div className="provider-box">
                  <div className="provider-header">
                    <Database size={18} className="provider-icon" />
                    <h4>Supabase Inc.</h4>
                  </div>
                  <div className="provider-role">Managed PostgreSQL Database &amp; S3 Storage</div>
                  <p>
                    Hosts the PostgreSQL database storing encrypted user records, academic information, job postings, and application statuses.
                    Also provides private S3-compatible object storage for uploaded student resumes and verification documents.
                  </p>
                </div>

                <div className="provider-box">
                  <div className="provider-header">
                    <Send size={18} className="provider-icon" />
                    <h4>Google Cloud Platform (Gmail API)</h4>
                  </div>
                  <div className="provider-role">Planned Gmail REST API Email Delivery</div>
                  <p>
                    Provides the HTTPS endpoint through which PLACENTRA's backend sends transactional email notifications
                    once Gmail API delivery is explicitly enabled in deployment settings, using the authorized account <code>placentraeducation@gmail.com</code>.
                  </p>
                </div>

                <div className="provider-box">
                  <div className="provider-header">
                    <Mail size={18} className="provider-icon" />
                    <h4>Resend Inc. (Transactional Email)</h4>
                  </div>
                  <div className="provider-role">Current Live Email Delivery &amp; Explicit Provider</div>
                  <p>
                    Provides transactional email delivery in the current live Render deployment, and remains available only when explicitly configured in deployment settings without acting as a silent fallback when Gmail API is enabled.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Data Security & Access Controls */}
            <section id="data-security" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">06</span>
                <h2>Access Controls &amp; Data Security Safeguards</h2>
              </div>
              <p>
                PLACENTRA implements appropriate technical and organizational security controls designed to safeguard
                candidate and institutional placement data:
              </p>

              <div className="security-safeguards-list">
                <div className="safeguard-item">
                  <Lock size={18} className="safeguard-icon" />
                  <div>
                    <strong>Cryptographic Password Hashing:</strong> User passwords are never stored in plaintext. They are protected
                    using salted PBKDF2 with SHA-256 (or Argon2) cryptographic hashing algorithms in Django.
                  </div>
                </div>

                <div className="safeguard-item">
                  <Key size={18} className="safeguard-icon" />
                  <div>
                    <strong>JSON Web Token (JWT) Authentication:</strong> Authenticated sessions utilize signed JSON Web Tokens (access and refresh tokens).
                    Protected routes enforce strict role-based access control (Student, Recruiter, Placement Officer permissions).
                  </div>
                </div>

                <div className="safeguard-item">
                  <Shield size={18} className="safeguard-icon" />
                  <div>
                    <strong>Transport Layer Security (TLS/HTTPS):</strong> All data in transit between web browsers, Vercel frontend,
                    Render backend, and external APIs is encrypted using modern TLS/HTTPS encryption.
                  </div>
                </div>

                <div className="safeguard-item">
                  <Database size={18} className="safeguard-icon" />
                  <div>
                    <strong>Private Document Storage:</strong> Student resumes, marksheets, and qualification certificates are stored in
                    access-controlled private object storage buckets and are never made publicly browsable on the open web.
                  </div>
                </div>

                <div className="safeguard-item">
                  <Key size={18} className="safeguard-icon" />
                  <div>
                    <strong>Strict Secret Isolation:</strong> OAuth client secrets, refresh tokens, and database credentials are held strictly
                    in protected backend environment variables and are excluded from frontend client bundles and Git version control.
                  </div>
                </div>
              </div>

              <div className="security-notice-callout">
                <AlertCircle size={18} className="notice-icon" />
                <p>
                  <strong>Security Acknowledgment:</strong> While PLACENTRA adheres to robust industry practices to protect personal information,
                  no internet transmission or electronic storage method can guarantee absolute, impenetrable security.
                </p>
              </div>
            </section>

            {/* Section 7: Retention & Manual Deletion */}
            <section id="retention-deletion" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">07</span>
                <h2>Data Retention &amp; Manual Deletion Policy</h2>
              </div>
              <p>
                <strong>Retention Period:</strong> Candidate profiles, job applications, interview logs, and selection offer records
                are retained for the duration of the institution's active campus placement cycle and subsequent academic audit periods
                to ensure compliance with institutional placement verification requirements.
              </p>
              <p>
                <strong>Manual Deletion &amp; Correction Requests:</strong> PLACENTRA does not provide an automated self-deletion button,
                as campus recruitment records must be coordinated with institutional placement cells to avoid invalidating verified selection records.
                Users may request assistance, profile updates, or account deletion by emailing our support desk:
              </p>
              <div className="deletion-contact-box">
                <Mail size={18} className="contact-icon" />
                <span>Submit requests to: </span>
                <a href="mailto:placentraeducation@gmail.com" className="email-highlight">
                  placentraeducation@gmail.com
                </a>
              </div>
              <p className="deletion-note">
                Requests are verified manually against institutional records and processed in consultation with the relevant college placement office.
              </p>
            </section>

            {/* Section 8: User Rights & Contact */}
            <section id="user-rights-contact" className="policy-card">
              <div className="policy-section-header">
                <span className="section-number">08</span>
                <h2>User Rights &amp; Contact Information</h2>
              </div>
              <p>
                Depending on your jurisdiction and institutional guidelines, candidates and users have rights regarding their personal data:
              </p>
              <ul className="user-rights-list">
                <li>The right to inspect and review information associated with your PLACENTRA account.</li>
                <li>The right to request rectification of inaccurate academic, contact, or profile information.</li>
                <li>The right to inquire about automated transactional email notifications sent to your registered address.</li>
                <li>The right to request manual deletion of your candidate profile upon completion of campus recruitment requirements.</li>
              </ul>

              <div className="contact-details-card">
                <h3>Contact &amp; Privacy Desk</h3>
                <p>
                  For any inquiries regarding this Privacy Policy, data handling practices, or Google API Limited Use compliance, please contact:
                </p>
                <div className="contact-item-row">
                  <Globe size={16} className="contact-icon" />
                  <span><strong>Platform Website:</strong> <a href="https://placentra.abhinandkk.in/" target="_blank" rel="noopener noreferrer">https://placentra.abhinandkk.in/</a></span>
                </div>
                <div className="contact-item-row">
                  <FileText size={16} className="contact-icon" />
                  <span><strong>Public Policy URL:</strong> <a href="https://placentra.abhinandkk.in/privacy-policy" target="_blank" rel="noopener noreferrer">https://placentra.abhinandkk.in/privacy-policy</a></span>
                </div>
                <div className="contact-item-row">
                  <Mail size={16} className="contact-icon" />
                  <span><strong>Contact Email:</strong> <a href="mailto:placentraeducation@gmail.com">placentraeducation@gmail.com</a></span>
                </div>
                <div className="contact-item-row">
                  <Building size={16} className="contact-icon" />
                  <span><strong>Platform:</strong> PLACENTRA Campus Placement &amp; Intelligent Candidate Coordination Platform</span>
                </div>
                <div className="contact-item-row">
                  <Clock size={16} className="contact-icon" />
                  <span><strong>Effective Date:</strong> October 20, 2026</span>
                </div>
              </div>
            </section>

          </article>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
