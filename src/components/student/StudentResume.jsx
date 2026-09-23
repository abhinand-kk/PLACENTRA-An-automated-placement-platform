import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, AlertTriangle, ArrowRight, User, GraduationCap, Briefcase, Award } from 'lucide-react';
import api from '../../services/api';
import './StudentResume.css';

export default function StudentResume({ onNavigateTab }) {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/students/resume/');
      setResumeData(res.data);
    } catch (err) {
      console.error("Error fetching resume data:", err);
      setError("Failed to load resume details. Please ensure your student profile exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await api.get('/api/v1/students/resume/download/', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const firstName = resumeData?.profile?.first_name || 'Student';
      const lastName = resumeData?.profile?.last_name || 'Resume';
      link.setAttribute('download', `${firstName}_${lastName}_Resume.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download error:", err);
      alert("Failed to download PDF resume. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="resume-loading-container">
        <div className="spinner"></div>
        <p>Generating your resume preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-error-container">
        <AlertTriangle size={36} className="error-icon" />
        <h3>Resume Preview Unavailable</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchResumeData}>Retry Loading</button>
      </div>
    );
  }

  const { profile, contact, current_education, previous_educations, experiences, documents, completion_percentage, missing_sections } = resumeData || {};

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (photo.startsWith('/')) return `http://localhost:8000${photo}`;
    return `http://localhost:8000/media/${photo}`;
  };

  const fullName = [profile?.first_name, profile?.middle_name, profile?.last_name].filter(Boolean).join(' ');

  return (
    <div className="student-resume-wrapper">
      {/* Top Header & Actions */}
      <div className="resume-top-banner">
        <div className="resume-header-info">
          <h2>My Official Placement Resume</h2>
          <p>Generated dynamically from your verified institution database records.</p>
        </div>

        <div className="resume-header-actions">
          <div className="completion-badge-pill">
            <span className="completion-label">Completeness:</span>
            <div className="progress-bar-small">
              <div className="progress-fill" style={{ width: `${completion_percentage || 0}%` }}></div>
            </div>
            <span className="completion-val">{completion_percentage || 0}%</span>
          </div>

          <button 
            className="btn-download-pdf" 
            onClick={handleDownloadPDF} 
            disabled={downloading}
          >
            <Download size={18} />
            <span>{downloading ? 'Generating PDF...' : 'Download PDF Resume'}</span>
          </button>
        </div>
      </div>

      {/* Missing Sections Guidance Alert */}
      {missing_sections && missing_sections.length > 0 && (
        <div className="resume-guidance-card">
          <div className="guidance-title">
            <AlertTriangle size={20} className="guidance-icon" />
            <span>Complete your profile for a stronger resume:</span>
          </div>
          <div className="guidance-items">
            {missing_sections.map((item, idx) => (
              <div key={idx} className="guidance-item-chip">
                <span className="chip-sec">{item.section}:</span>
                <span className="chip-msg">{item.message}</span>
                {onNavigateTab && (
                  <button className="btn-chip-action" onClick={() => onNavigateTab('profile')}>
                    <span>Update Profile</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A4 Live Resume Preview Sheet */}
      <div className="resume-sheet-container">
        <div className="a4-resume-sheet">
          {/* Header Block */}
          <div className="sheet-header">
            <div className="header-text-block">
              <h1 className="candidate-name">{fullName || 'Student Candidate'}</h1>
              <p className="candidate-subtitle">
                <span>Reg No: <strong>{profile?.register_number || 'N/A'}</strong></span>
                <span className="bullet-sep">•</span>
                <span>Institution: <strong>{profile?.institution_detail?.institution_name || 'PLACEMENT INSTITUTION'}</strong></span>
              </p>

              {contact && (
                <div className="candidate-contact-line">
                  {contact.primary_email && <span>📧 {contact.primary_email}</span>}
                  {contact.mobile_number && <span>📱 {contact.mobile_number}</span>}
                  {(contact.city || contact.state) && (
                    <span>📍 {[contact.city, contact.district, contact.state, contact.country].filter(Boolean).join(', ')}</span>
                  )}
                </div>
              )}
            </div>

            {profile?.profile_photo && (
              <div className="header-photo-block">
                <img src={getPhotoUrl(profile.profile_photo)} alt="Profile" />
              </div>
            )}
          </div>

          <div className="sheet-divider-line primary-line"></div>

          {/* Personal Details */}
          <div className="sheet-section">
            <h3 className="section-title">
              <User size={16} />
              <span>Personal Details</span>
            </h3>
            <div className="details-grid-2col">
              <div className="detail-item">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-val">{profile?.date_of_birth || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender:</span>
                <span className="detail-val">{profile?.gender || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Blood Group:</span>
                <span className="detail-val">{profile?.blood_group || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Profile Completion:</span>
                <span className="detail-val">{completion_percentage}%</span>
              </div>
              {contact?.permanent_address && (
                <div className="detail-item full-width">
                  <span className="detail-label">Permanent Address:</span>
                  <span className="detail-val">{contact.permanent_address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="sheet-divider-line"></div>

          {/* Current Education */}
          <div className="sheet-section">
            <h3 className="section-title">
              <GraduationCap size={16} />
              <span>Current Education</span>
            </h3>
            {current_education ? (
              <div className="current-edu-card">
                <div className="edu-main-head">
                  <span className="program-title">
                    {current_education.program_detail?.name || 'Degree Program'} - {current_education.branch_detail?.name || 'Branch'}
                  </span>
                  <span className="cgpa-pill">CGPA: {current_education.cgpa} / 10.00</span>
                </div>
                <div className="edu-meta-row">
                  <span>Field of Study: <strong>{current_education.field_of_study || 'N/A'}</strong></span>
                  <span>Batch: <strong>{current_education.batch}</strong> (Sem {current_education.semester})</span>
                  <span>Active Backlogs: <strong>{current_education.active_backlogs}</strong></span>
                </div>
                <div className="edu-dates">
                  <span>Duration: {current_education.start_date} to {current_education.end_date}</span>
                </div>
              </div>
            ) : (
              <p className="no-data-text">Current education details not specified.</p>
            )}
          </div>

          <div className="sheet-divider-line"></div>

          {/* Previous Education Table */}
          <div className="sheet-section">
            <h3 className="section-title">
              <Award size={16} />
              <span>Previous Academic Qualifications</span>
            </h3>
            {previous_educations && previous_educations.length > 0 ? (
              <table className="resume-table">
                <thead>
                  <tr>
                    <th>Qualification</th>
                    <th>Institution / School</th>
                    <th>Board / University</th>
                    <th>Year</th>
                    <th>Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {previous_educations.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.qualification_type_detail?.name || 'Qualification'}</strong></td>
                      <td>{item.institution_name}</td>
                      <td>{item.board_or_university}</td>
                      <td>{item.year_of_passing}</td>
                      <td><strong>{item.percentage}%</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data-text">No previous academic qualifications recorded.</p>
            )}
          </div>

          <div className="sheet-divider-line"></div>

          {/* Experience */}
          <div className="sheet-section">
            <h3 className="section-title">
              <Briefcase size={16} />
              <span>Work & Internship Experience</span>
            </h3>
            {experiences && experiences.length > 0 ? (
              <div className="experience-list">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="experience-item">
                    <div className="exp-head">
                      <span className="exp-role">{exp.designation}</span>
                      <span className="exp-company">@ {exp.company_name}</span>
                      <span className="exp-type">({exp.employment_type_detail?.name || 'Job'})</span>
                    </div>
                    <div className="exp-sub">
                      <span>📍 {exp.location}</span>
                      <span className="bullet-sep">•</span>
                      <span>🗓️ {exp.start_date} to {exp.end_date || 'Present'}</span>
                    </div>
                    {exp.description && <p className="exp-desc">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-text">No work or internship experience recorded.</p>
            )}
          </div>

          <div className="sheet-divider-line"></div>

          {/* Verification Documents */}
          <div className="sheet-section">
            <h3 className="section-title">
              <CheckCircle2 size={16} />
              <span>Verified Documents Status</span>
            </h3>
            <div className="doc-status-pills">
              <div className={`doc-pill ${documents?.resume ? 'uploaded' : 'missing'}`}>
                <span>Resume PDF:</span> <strong>{documents?.resume ? 'Uploaded' : 'Pending'}</strong>
              </div>
              <div className={`doc-pill ${documents?.class10_certificate ? 'uploaded' : 'missing'}`}>
                <span>Class 10 Cert:</span> <strong>{documents?.class10_certificate ? 'Uploaded' : 'Pending'}</strong>
              </div>
              <div className={`doc-pill ${documents?.class12_certificate ? 'uploaded' : 'missing'}`}>
                <span>Class 12 Cert:</span> <strong>{documents?.class12_certificate ? 'Uploaded' : 'Pending'}</strong>
              </div>
              <div className={`doc-pill ${documents?.degree_marksheet ? 'uploaded' : 'missing'}`}>
                <span>Degree Marksheet:</span> <strong>{documents?.degree_marksheet ? 'Uploaded' : 'Pending'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
