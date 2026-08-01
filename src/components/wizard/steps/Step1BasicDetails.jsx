import React, { useState } from 'react';
import { User, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Step1BasicDetails({ state, onChange, onNext }) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const data = state.basicDetails;

  const handleChange = (field, value) => {
    onChange('basicDetails', { ...data, [field]: value });
  };

  const handleProceedClick = (e) => {
    e.preventDefault();
    setShowVerifyModal(true);
  };

  const handleConfirmSave = () => {
    setShowVerifyModal(false);
    onNext();
  };

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <User size={22} />
        </div>
        <div className="step-header-text">
          <h2>Basic Details</h2>
          <p>Let's start with some basic information about you.</p>
        </div>
      </div>

      <form onSubmit={handleProceedClick}>
        {/* Full Name Row */}
        <div className="form-grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">First Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. John"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Middle Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Middle name"
              value={data.middleName}
              onChange={(e) => handleChange('middleName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Doe"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
            />
          </div>
        </div>

        {/* DOB, Gender & Blood Group Row */}
        <div className="form-grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Date of Birth <span className="req">*</span></label>
            <input 
              type="date" 
              className="form-control" 
              value={data.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender <span className="req">*</span></label>
            <div className="gender-tile-group">
              {['Male', 'Female', 'Other'].map((g) => (
                <div 
                  key={g} 
                  className={`gender-tile ${data.gender === g ? 'selected' : ''}`}
                  onClick={() => handleChange('gender', g)}
                >
                  <span>{g === 'Male' ? '♂' : g === 'Female' ? '♀' : '⚪'}</span>
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group <span className="req">*</span></label>
            <select 
              className="form-control" 
              value={data.bloodGroup}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
              required
            >
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* College & Course Row */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">College / University <span className="req">*</span></label>
            <select 
              className="form-control" 
              value={data.college}
              onChange={(e) => handleChange('college', e.target.value)}
              required
            >
              <option value="">Select College / University</option>
              <option value="Amal Jyothi College of Engineering, Kanjirappally">Amal Jyothi College of Engineering, Kanjirappally</option>
              <option value="Rajagiri College of Social Sciences">Rajagiri College of Social Sciences</option>
              <option value="Saintgits College of Engineering">Saintgits College of Engineering</option>
              <option value="Marian College Kuttikkanam">Marian College Kuttikkanam</option>
              <option value="CET College of Engineering Trivandrum">CET College of Engineering Trivandrum</option>
            </select>
            <span className="form-hint" style={{ color: '#4F46E5', cursor: 'pointer', marginTop: '4px' }}>
              Can't find your college? Search using PINCODE
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Course / Program <span className="req">*</span></label>
            <select 
              className="form-control" 
              value={data.course}
              onChange={(e) => handleChange('course', e.target.value)}
              required
            >
              <option value="">Select Course / Program</option>
              <option value="MCA (Integrated)">MCA (Integrated)</option>
              <option value="B.Tech Computer Science">B.Tech Computer Science</option>
              <option value="B.Tech Electronics & Comm">B.Tech Electronics & Comm</option>
              <option value="M.Tech Artificial Intelligence">M.Tech Artificial Intelligence</option>
              <option value="MBA">MBA</option>
            </select>
          </div>
        </div>

        {/* Branch, Roll No, Sem, Adm Year */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Branch / Specialization <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Computer Applications"
              value={data.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number / University ID <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. AJC20MCA0502"
              value={data.rollNumber}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Current Semester <span className="req">*</span></label>
            <select 
              className="form-control" 
              value={data.currentSemester}
              onChange={(e) => handleChange('currentSemester', e.target.value)}
              required
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Admission Year <span className="req">*</span></label>
            <select 
              className="form-control" 
              value={data.admissionYear}
              onChange={(e) => handleChange('admissionYear', e.target.value)}
              required
            >
              <option value="">Select Admission Year</option>
              {['2021', '2022', '2023', '2024', '2025'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Primary Email Address <span className="req">*</span></label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@example.com"
              value={data.primaryEmail}
              onChange={(e) => handleChange('primaryEmail', e.target.value)}
              required
            />
            <span className="form-hint">This email will be used for all communications.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="form-control" style={{ width: '90px' }}>
                <option>🇮🇳 +91</option>
              </select>
              <input 
                type="text" 
                className="form-control" 
                style={{ flex: 1 }}
                placeholder="10-digit mobile number"
                value={data.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <div></div>
          <button type="submit" className="btn-wizard-primary">
            <span>Save and Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Verify Details Modal Overlay */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Please verify your details</h3>
            </div>
            <div className="modal-body">
              <div className="wizard-alert alert-amber">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <div>
                  Please check the details you have entered in this section again, since once you click on <strong>"Save and Proceed"</strong> you will not be allowed to visit this section again.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px', fontSize: '13px' }}>
                <div><strong>Full Name:</strong> {data.firstName} {data.middleName} {data.lastName}</div>
                <div><strong>DOB:</strong> {data.dob}</div>
                <div><strong>Gender:</strong> {data.gender || 'Not specified'}</div>
                <div><strong>Blood Group:</strong> {data.bloodGroup || 'Not specified'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>College:</strong> {data.college || 'Not specified'}</div>
                <div><strong>Course:</strong> {data.course || 'Not specified'}</div>
                <div><strong>Branch:</strong> {data.branch || 'Not specified'}</div>
                <div><strong>Roll Number:</strong> {data.rollNumber || 'Not specified'}</div>
                <div><strong>Admission Year:</strong> {data.admissionYear || 'Not specified'}</div>
                <div><strong>Primary Email:</strong> {data.primaryEmail || 'Not specified'}</div>
                <div><strong>Mobile:</strong> +91 {data.mobileNumber || 'Not specified'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-wizard-secondary"
                onClick={() => setShowVerifyModal(false)}
              >
                Go back and Edit
              </button>
              <button 
                className="btn-wizard-primary"
                onClick={handleConfirmSave}
              >
                Save and Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
