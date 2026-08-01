import React, { useState, useEffect } from 'react';
import { User, ArrowRight, CheckCircle2, AlertCircle, Calendar, ChevronDown, Edit3, X } from 'lucide-react';

export default function Step1BasicDetails({ state, onChange, onNext }) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [touched, setTouched] = useState({});
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  const data = state.basicDetails;

  const collegeOptions = [
    'Amal Jyothi College of Engineering, Kottayam',
    'Rajagiri College of Social Sciences, Kochi',
    'Saintgits College of Engineering, Kottayam',
    'Marian College Kuttikkanam, Idukki',
    'College of Engineering Trivandrum (CET)',
    'Government Engineering College, Thrissur',
    'TKM College of Engineering, Kollam'
  ];

  const filteredColleges = collegeOptions.filter(c => 
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleChange = (field, value) => {
    onChange('basicDetails', { ...data, [field]: value });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Field validation functions
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (phone) => /^\d{10}$/.test(phone);

  const isFirstNameValid = Boolean(data.firstName?.trim());
  const isLastNameValid = Boolean(data.lastName?.trim());
  const isDobValid = Boolean(data.dob);
  const isGenderValid = Boolean(data.gender);
  const isCollegeValid = Boolean(data.college?.trim());
  const isCourseValid = Boolean(data.course);
  const isBranchValid = Boolean(data.branch?.trim());
  const isRollNoValid = Boolean(data.rollNumber?.trim());
  const isSemesterValid = Boolean(data.currentSemester);
  const isAdmissionYearValid = Boolean(data.admissionYear);
  const isEmailValid = isValidEmail(data.primaryEmail || '');
  const isMobileValid = isValidMobile(data.mobileNumber || '');

  // Form validity check
  const isFormValid = 
    isFirstNameValid &&
    isLastNameValid &&
    isDobValid &&
    isGenderValid &&
    isCollegeValid &&
    isCourseValid &&
    isBranchValid &&
    isRollNoValid &&
    isSemesterValid &&
    isAdmissionYearValid &&
    isEmailValid &&
    isMobileValid;

  const handleProceedClick = (e) => {
    e.preventDefault();
    if (isFormValid) {
      setShowVerifyModal(true);
    }
  };

  const handleConfirmSave = () => {
    setShowVerifyModal(false);
    onNext();
  };

  // Format DOB as DD/MM/YYYY for modal summary
  const formatDob = (dobStr) => {
    if (!dobStr) return '';
    const [y, m, d] = dobStr.split('-');
    return `${d}/${m}/${y}`;
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
        {/* Full Name Section */}
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label">Full Name <span className="req">*</span></label>
          <div className="form-grid-3">
            <div>
              <input 
                type="text" 
                className={`form-control ${touched.firstName && !isFirstNameValid ? 'invalid' : ''}`} 
                placeholder="Abhinand"
                value={data.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                required
              />
              <span className="sub-caption">First Name</span>
              {touched.firstName && !isFirstNameValid && (
                <span className="error-text">First name is required</span>
              )}
            </div>

            <div>
              <input 
                type="text" 
                className="form-control" 
                placeholder="K K"
                value={data.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
              />
              <span className="sub-caption">Middle Name</span>
            </div>

            <div>
              <input 
                type="text" 
                className={`form-control ${touched.lastName && !isLastNameValid ? 'invalid' : ''}`} 
                placeholder="K K"
                value={data.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                required
              />
              <span className="sub-caption">Last Name</span>
              {touched.lastName && !isLastNameValid && (
                <span className="error-text">Last name is required</span>
              )}
            </div>
          </div>
        </div>

        {/* Date of Birth & Gender & Blood Group */}
        <div className="form-grid-3" style={{ marginBottom: '22px' }}>
          {/* DOB */}
          <div className="form-group">
            <label className="form-label">Date of Birth <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="date" 
                className={`form-control ${touched.dob && !isDobValid ? 'invalid' : ''}`} 
                value={data.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
                required
              />
            </div>
            {touched.dob && !isDobValid && (
              <span className="error-text">Date of birth is required</span>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender <span className="req">*</span></label>
            <div className="gender-tile-group">
              {['Male', 'Female', 'Other'].map((g) => (
                <div 
                  key={g} 
                  className={`gender-tile ${data.gender === g ? 'selected' : ''}`}
                  onClick={() => handleChange('gender', g)}
                >
                  <span className="radio-dot"></span>
                  <span>{g}</span>
                </div>
              ))}
            </div>
            {touched.gender && !isGenderValid && (
              <span className="error-text">Gender selection is required</span>
            )}
          </div>

          {/* Blood Group */}
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select 
              className="form-control" 
              value={data.bloodGroup}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
            >
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* College & Course Row */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          {/* College / University (Searchable Dropdown) */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">College / University <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="text" 
                className={`form-control ${touched.college && !isCollegeValid ? 'invalid' : ''}`}
                placeholder="Search or select College / University"
                value={data.college || collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  handleChange('college', e.target.value);
                  setShowCollegeDropdown(true);
                }}
                onFocus={() => setShowCollegeDropdown(true)}
                onBlur={() => {
                  handleBlur('college');
                  setTimeout(() => setShowCollegeDropdown(false), 200);
                }}
                required
              />
              {isCollegeValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>

            {/* Dropdown Options List */}
            {showCollegeDropdown && (
              <div className="searchable-dropdown-list">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((c, idx) => (
                    <div 
                      key={idx}
                      className="dropdown-item"
                      onMouseDown={() => {
                        handleChange('college', c);
                        setCollegeSearch(c);
                        setShowCollegeDropdown(false);
                      }}
                    >
                      {c}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item empty">No matching college found</div>
                )}
              </div>
            )}

            <div className="college-links-row">
              <span className="college-link">Can't find your college?</span>
              <span className="college-link">Search using PINCODE</span>
            </div>
          </div>

          {/* Course / Program */}
          <div className="form-group">
            <label className="form-label">Course / Program <span className="req">*</span></label>
            <select 
              className={`form-control ${touched.course && !isCourseValid ? 'invalid' : ''}`} 
              value={data.course}
              onChange={(e) => handleChange('course', e.target.value)}
              onBlur={() => handleBlur('course')}
              required
            >
              <option value="">Select Course / Program</option>
              <option value="MCA (Integrated)">MCA (Integrated)</option>
              <option value="B.Tech Computer Science">B.Tech Computer Science</option>
              <option value="B.Tech Electronics & Comm">B.Tech Electronics & Comm</option>
              <option value="M.Tech Artificial Intelligence">M.Tech Artificial Intelligence</option>
              <option value="MBA">MBA</option>
            </select>
            {touched.course && !isCourseValid && (
              <span className="error-text">Course selection is required</span>
            )}
          </div>
        </div>

        {/* Branch / Specialization & Roll Number */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Branch / Specialization <span className="req">*</span></label>
            <select 
              className={`form-control ${touched.branch && !isBranchValid ? 'invalid' : ''}`}
              value={data.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              onBlur={() => handleBlur('branch')}
              required
            >
              <option value="">Select Branch / Specialization</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number / University ID <span className="req">*</span></label>
            <input 
              type="text" 
              className={`form-control ${touched.rollNumber && !isRollNoValid ? 'invalid' : ''}`} 
              placeholder="AJC25MCA2002"
              value={data.rollNumber}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              onBlur={() => handleBlur('rollNumber')}
              required
            />
            {touched.rollNumber && !isRollNoValid && (
              <span className="error-text">Roll number is required</span>
            )}
          </div>
        </div>

        {/* Current Semester & Admission Year */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Current Semester <span className="req">*</span></label>
            <select 
              className={`form-control ${touched.currentSemester && !isSemesterValid ? 'invalid' : ''}`} 
              value={data.currentSemester}
              onChange={(e) => handleChange('currentSemester', e.target.value)}
              onBlur={() => handleBlur('currentSemester')}
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
              className={`form-control ${touched.admissionYear && !isAdmissionYearValid ? 'invalid' : ''}`} 
              value={data.admissionYear}
              onChange={(e) => handleChange('admissionYear', e.target.value)}
              onBlur={() => handleBlur('admissionYear')}
              required
            >
              <option value="">Select Admission Year</option>
              {['2021', '2022', '2023', '2024', '2025'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Email Address & Mobile Number */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          {/* Primary Email */}
          <div className="form-group">
            <label className="form-label">Primary Email Address <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="email" 
                className={`form-control ${touched.primaryEmail && !isEmailValid ? 'invalid' : ''}`} 
                placeholder="kkabhinand05@gmail.com"
                value={data.primaryEmail}
                onChange={(e) => handleChange('primaryEmail', e.target.value)}
                onBlur={() => handleBlur('primaryEmail')}
                required
              />
              {isEmailValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            <span className="form-hint">This email will be used for all communications.</span>
            {touched.primaryEmail && !isEmailValid && (
              <span className="error-text">Please enter a valid email address</span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label">Mobile Number <span className="req">*</span></label>
            <div className="phone-input-group">
              <div className="country-selector">
                <span className="flag-icon">🇮🇳</span>
                <span className="code-text">+91</span>
              </div>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <input 
                  type="text" 
                  className={`form-control ${touched.mobileNumber && !isMobileValid ? 'invalid' : ''}`} 
                  placeholder="916235407730"
                  value={data.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => handleBlur('mobileNumber')}
                  required
                />
                {isMobileValid && (
                  <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
                )}
              </div>
            </div>
            {touched.mobileNumber && !isMobileValid && (
              <span className="error-text">Please enter a valid 10-digit mobile number</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <div></div>
          <button 
            type="submit" 
            className={`btn-wizard-primary ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            <span>Save and Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Confirmation Modal ("Please verify your details") */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-card verify-modal-card">
            <div className="modal-header">
              <h3>Please verify your details</h3>
              <button className="modal-close-btn" onClick={() => setShowVerifyModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Yellow Warning Banner */}
              <div className="wizard-alert alert-amber">
                <AlertCircle size={18} className="flex-shrink-0" />
                <div>
                  Please check the details you have entered in this section again, once you click on <strong>'Save and Proceed'</strong> you will not be allowed to visit this section again.
                </div>
              </div>

              {/* Read-Only Summary Key-Value List */}
              <div className="verify-summary-table">
                <div className="summary-row">
                  <span className="sum-key">Full Name</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.firstName} {data.middleName} {data.lastName}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Date of Birth</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{formatDob(data.dob)}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Gender</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.gender}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Blood Group</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.bloodGroup || 'Not specified'}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">College / University</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.college}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Course / Program</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.course}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Branch / Specialization</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.branch}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Roll Number / University ID</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.rollNumber}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Current Semester</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.currentSemester}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Admission Year</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.admissionYear}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Primary Email</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.primaryEmail}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Mobile Number</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">+91 {data.mobileNumber}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn-wizard-secondary"
                onClick={() => setShowVerifyModal(false)}
              >
                <Edit3 size={14} />
                <span>Go back and Edit</span>
              </button>
              <button 
                type="button"
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
