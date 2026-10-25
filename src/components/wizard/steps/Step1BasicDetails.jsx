import React, { useState, useEffect, useRef } from 'react';
import { User, ArrowRight, CheckCircle2, AlertCircle, Edit3, X, Loader2 } from 'lucide-react';

import DobDatePicker from './DobDatePicker';
import api from '../../../services/api';
import {
  VERIFIED_COLLEGES,
  INSTITUTION_ALIASES,
  getAdmissionYearOptions,
  isValidAdmissionYear,
  getSpecializationsForCourse,
  validateCustomSpecialization,
  validateCustomInstitution,
  validateMobileNumber,
  validateEmail
} from '../../../constants/academicData';

export default function Step1BasicDetails({ state, onChange, onNext }) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [touched, setTouched] = useState({});
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [remoteColleges, setRemoteColleges] = useState([]);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [collegeError, setCollegeError] = useState('');
  const searchTimeoutRef = useRef(null);

  const data = state.basicDetails || {};
  const [collegeSearch, setCollegeSearch] = useState(data.college || '');

  // Keep collegeSearch in sync if parent state changes
  useEffect(() => {
    if (data.college && data.college !== collegeSearch && !showCollegeDropdown) {
      setCollegeSearch(data.college);
    }
  }, [data.college]);

  // Debounced search against backend institutions API
  useEffect(() => {
    const trimmedQuery = collegeSearch.trim();
    if (!trimmedQuery || trimmedQuery === 'Other institution / Not listed') {
      setRemoteColleges([]);
      setCollegeLoading(false);
      setCollegeError('');
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setCollegeLoading(true);
    setCollegeError('');

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/api/v1/institutions/?search=${encodeURIComponent(trimmedQuery)}`);
        if (res.data && Array.isArray(res.data.results)) {
          setRemoteColleges(res.data.results.map(r => r.institution_name));
        } else {
          setRemoteColleges([]);
        }
        setCollegeError('');
      } catch (err) {
        // Fall back gracefully to local verified colleges
        setRemoteColleges([]);
        setCollegeError('Unable to connect to the live institution directory. Searching offline verified colleges.');
      } finally {
        setCollegeLoading(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [collegeSearch]);

  // Compute combined search results (remote + verified local matching aliases and keywords)
  const searchLower = (collegeSearch || '').trim().toLowerCase();
  const matchedFromAliases = [];
  if (searchLower) {
    for (const [aliasKey, targetList] of Object.entries(INSTITUTION_ALIASES)) {
      if (searchLower === aliasKey || searchLower.includes(aliasKey) || aliasKey.includes(searchLower)) {
        matchedFromAliases.push(...targetList);
      }
    }
  }

  const localMatches = searchLower
    ? VERIFIED_COLLEGES.filter(c => c.toLowerCase().includes(searchLower))
    : VERIFIED_COLLEGES.slice(0, 10);

  const filteredColleges = Array.from(new Set([
    ...remoteColleges,
    ...matchedFromAliases,
    ...localMatches
  ]));

  const handleChange = (field, value) => {
    onChange('basicDetails', { ...data, [field]: value });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const calculateAge = (dobString) => {
    if (!dobString) return -1;
    const parts = dobString.split('-');
    if (parts.length !== 3) return -1;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let age = currentYear - birthYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    return age;
  };

  const getDobErrorMessage = (dobString) => {
    if (!dobString) return "Date of birth is required";

    const parts = dobString.split('-');
    if (parts.length !== 3) return "Date of birth is required";

    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);
    const birthDate = new Date(birthYear, birthMonth, birthDay);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      return "Date of birth cannot be in the future.";
    }

    const age = calculateAge(dobString);
    if (age < 18) {
      return "You must be at least 18 years old to register.";
    }

    return "";
  };

  // Validations
  const isFirstNameValid = Boolean(data.firstName?.trim());
  const isLastNameValid = Boolean(data.lastName?.trim());
  const dobErrorMessage = getDobErrorMessage(data.dob);
  const isDobValid = Boolean(data.dob) && dobErrorMessage === "";
  const isGenderValid = Boolean(data.gender);

  // College validation
  const isOtherCollegeSelected = data.college === 'Other institution / Not listed';
  const customCollegeRes = isOtherCollegeSelected
    ? validateCustomInstitution(data.customCollege)
    : { isValid: true, message: '' };
  const isCollegeValid = isOtherCollegeSelected
    ? customCollegeRes.isValid
    : Boolean(data.college?.trim());

  const isCourseValid = Boolean(data.course);

  // Branch & Custom Specialization validation
  const branchOptions = getSpecializationsForCourse(data.course);
  const isCustomBranch = data.branch === 'Others';
  const customBranchRes = isCustomBranch
    ? validateCustomSpecialization(data.customBranch)
    : { isValid: true, message: '' };
  const isBranchValid = isCustomBranch
    ? customBranchRes.isValid
    : Boolean(data.branch?.trim());

  const isRollNoValid = Boolean(data.rollNumber?.trim());
  const isSemesterValid = Boolean(data.currentSemester);

  // Dynamic Admission Year options and validation
  const admissionYearOptions = getAdmissionYearOptions(data.admissionYear);
  const isAdmissionYearValid = isValidAdmissionYear(data.admissionYear);

  // Email validation with subdomains support
  const emailRes = validateEmail(data.primaryEmail || '');
  const isEmailValid = emailRes.isValid;

  // Mobile number validation (India +91)
  const mobileRes = validateMobileNumber(data.mobileNumber || '', '+91');
  const isMobileValid = mobileRes.isValid;

  // Total form validity check
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
    if (!isFormValid) {
      setTouched({
        firstName: true,
        lastName: true,
        dob: true,
        gender: true,
        college: true,
        customCollege: true,
        course: true,
        branch: true,
        customBranch: true,
        rollNumber: true,
        currentSemester: true,
        admissionYear: true,
        primaryEmail: true,
        mobileNumber: true
      });
      return;
    }
    setShowVerifyModal(true);
  };

  const handleConfirmSave = () => {
    setShowVerifyModal(false);
    onNext();
  };

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
                placeholder="Enter first name"
                value={data.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => {
                  handleBlur('firstName');
                  if (data.firstName) handleChange('firstName', data.firstName.trim());
                }}
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
                placeholder="Enter middle name (optional)"
                value={data.middleName || ''}
                onChange={(e) => handleChange('middleName', e.target.value)}
                onBlur={() => {
                  if (data.middleName) handleChange('middleName', data.middleName.trim());
                }}
              />
              <span className="sub-caption">Middle Name</span>
            </div>

            <div>
              <input
                type="text"
                className={`form-control ${touched.lastName && !isLastNameValid ? 'invalid' : ''}`}
                placeholder="Enter last name"
                value={data.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => {
                  handleBlur('lastName');
                  if (data.lastName) handleChange('lastName', data.lastName.trim());
                }}
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
            <DobDatePicker
              value={data.dob || ''}
              onChange={(val) => handleChange('dob', val)}
              onBlur={() => handleBlur('dob')}
              invalid={touched.dob && !isDobValid}
              required
            />
            {touched.dob && !isDobValid && (
              <span className="error-text">{dobErrorMessage}</span>
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
              value={data.bloodGroup || ''}
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
                value={collegeSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setCollegeSearch(val);
                  handleChange('college', val);
                  setShowCollegeDropdown(true);
                }}
                onFocus={() => setShowCollegeDropdown(true)}
                onBlur={() => {
                  handleBlur('college');
                  setTimeout(() => setShowCollegeDropdown(false), 250);
                }}
                required
              />
              {isCollegeValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>

            {/* Dropdown Options List with Loading, Results, and 'Not Listed' Fallback */}
            {showCollegeDropdown && (
              <div className="searchable-dropdown-list">
                {collegeLoading && (
                  <div className="dropdown-item loading">
                    <Loader2 size={14} className="spin-icon" />
                    <span>Searching institutions...</span>
                  </div>
                )}

                {collegeError && (
                  <div className="dropdown-item error" style={{ fontSize: '12px' }}>
                    {collegeError}
                  </div>
                )}

                {filteredColleges.length > 0 ? (
                  filteredColleges.map((c, idx) => (
                    <div
                      key={idx}
                      className={`dropdown-item ${data.college === c ? 'selected' : ''}`}
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
                  !collegeLoading && (
                    <div className="dropdown-item empty">
                      No matching college found for "{collegeSearch}"
                    </div>
                  )
                )}

                {/* Option for Unlisted Institutions */}
                <div
                  className="dropdown-item not-listed"
                  onMouseDown={() => {
                    handleChange('college', 'Other institution / Not listed');
                    setCollegeSearch('Other institution / Not listed');
                    setShowCollegeDropdown(false);
                  }}
                >
                  + Other institution / Not listed
                </div>
              </div>
            )}

            {/* Custom Institution Input if 'Other' selected */}
            {isOtherCollegeSelected && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  className={`form-control ${touched.customCollege && !isCollegeValid ? 'invalid' : ''}`}
                  placeholder="Enter your college / university name"
                  value={data.customCollege || ''}
                  onChange={(e) => handleChange('customCollege', e.target.value)}
                  onBlur={() => handleBlur('customCollege')}
                  required
                />
                {touched.customCollege && !isCollegeValid && (
                  <span className="error-text">
                    {customCollegeRes.message || 'Please enter a valid institution name.'}
                  </span>
                )}
              </div>
            )}

            {touched.college && !isOtherCollegeSelected && !isCollegeValid && (
              <span className="error-text">College / University selection is required</span>
            )}
          </div>

          {/* Course / Program */}
          <div className="form-group">
            <label className="form-label">Course / Program <span className="req">*</span></label>
            <select
              className={`form-control ${touched.course && !isCourseValid ? 'invalid' : ''}`}
              value={data.course || ''}
              onChange={(e) => {
                const newCourse = e.target.value;
                handleChange('course', newCourse);
                // Clear branch if it no longer belongs to valid options
                const validSpecializations = getSpecializationsForCourse(newCourse);
                if (data.branch && !validSpecializations.includes(data.branch)) {
                  handleChange('branch', '');
                }
              }}
              onBlur={() => handleBlur('course')}
              required
            >
              <option value="">Select Course / Program</option>
              {[
                'MCA',
                'MCA (Integrated)',
                'MCA (Lateral Entry)',
                'MCA + MBA (Integrated)',
                'BCA',
                'BCA + MCA (Integrated)',
                'B.Tech Computer Science',
                'B.Tech Information Technology',
                'B.Tech Electronics & Communication',
                'B.Tech Electronics & Comm',
                'B.Tech Electrical & Electronics',
                'B.Tech Electrical Engineering',
                'B.Tech Mechanical Engineering',
                'B.Tech Mechanical',
                'B.Tech Civil Engineering',
                'B.Tech Artificial Intelligence',
                'B.Tech Artificial Intelligence & Data Science',
                'B.Tech Data Science',
                'B.Tech Cyber Security',
                'M.Tech',
                'M.Tech Computer Science',
                'M.Tech Artificial Intelligence',
                'M.Tech + MCA (Integrated)',
                'MCA + M.Tech (Integrated)',
                'MBA',
                'PGDM + MCA (Integrated)'
              ].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
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
              value={data.branch || ''}
              onChange={(e) => {
                handleChange('branch', e.target.value);
                if (e.target.value !== 'Others') {
                  handleChange('customBranch', '');
                }
              }}
              onBlur={() => handleBlur('branch')}
              required
            >
              <option value="">Select Branch / Specialization</option>
              {branchOptions.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Custom Specialization Input if 'Others' is selected */}
            {data.branch === 'Others' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  className={`form-control ${(touched.customBranch || touched.branch) && !isBranchValid ? 'invalid' : ''}`}
                  placeholder="Enter your specialization"
                  value={data.customBranch || ''}
                  onChange={(e) => handleChange('customBranch', e.target.value)}
                  onBlur={() => handleBlur('customBranch')}
                  required
                />
              </div>
            )}

            {(touched.branch || touched.customBranch) && !isBranchValid && (
              <span className="error-text">
                {data.branch === 'Others'
                  ? (customBranchRes.message || 'Please enter your specialization.')
                  : 'Branch / Specialization is required'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number / University ID <span className="req">*</span></label>
            <input
              type="text"
              className={`form-control ${touched.rollNumber && !isRollNoValid ? 'invalid' : ''}`}
              placeholder="e.g. AJC25MCA2002"
              value={data.rollNumber || ''}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              onBlur={() => handleBlur('rollNumber')}
              required
            />
            {touched.rollNumber && !isRollNoValid && (
              <span className="error-text">Roll number is required</span>
            )}
          </div>
        </div>

        {/* Current Semester & Dynamic Admission Year */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Current Semester <span className="req">*</span></label>
            <select
              className={`form-control ${touched.currentSemester && !isSemesterValid ? 'invalid' : ''}`}
              value={data.currentSemester || ''}
              onChange={(e) => handleChange('currentSemester', e.target.value)}
              onBlur={() => handleBlur('currentSemester')}
              required
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {touched.currentSemester && !isSemesterValid && (
              <span className="error-text">Semester selection is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Admission Year <span className="req">*</span></label>
            <select
              className={`form-control ${touched.admissionYear && !isAdmissionYearValid ? 'invalid' : ''}`}
              value={data.admissionYear || ''}
              onChange={(e) => handleChange('admissionYear', e.target.value)}
              onBlur={() => handleBlur('admissionYear')}
              required
            >
              <option value="">Select Admission Year</option>
              {admissionYearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {touched.admissionYear && !isAdmissionYearValid && (
              <span className="error-text">Please select a valid admission year</span>
            )}
          </div>
        </div>

        {/* Email Address & Mobile Number */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address <span className="req">*</span></label>
            <div className="input-with-icon">
              <input
                type="email"
                className={`form-control ${touched.primaryEmail && !isEmailValid ? 'invalid' : ''}`}
                placeholder="Enter lowercase email (e.g. name@college.edu)"
                value={data.primaryEmail || ''}
                onChange={(e) => handleChange('primaryEmail', e.target.value.toLowerCase())}
                onBlur={() => {
                  handleBlur('primaryEmail');
                  if (data.primaryEmail) handleChange('primaryEmail', data.primaryEmail.trim());
                }}
                required
              />
              {isEmailValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            <span className="form-hint">This email will be used for all communications and login identity.</span>
            {touched.primaryEmail && !isEmailValid && (
              <span className="error-text">Please enter a valid lowercase email address.</span>
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
                  placeholder="Enter 10-digit mobile number"
                  value={data.mobileNumber || ''}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange('mobileNumber', clean);
                  }}
                  onBlur={() => handleBlur('mobileNumber')}
                  required
                />
                {isMobileValid && (
                  <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
                )}
              </div>
            </div>
            {touched.mobileNumber && !isMobileValid && (
              <span className="error-text">{mobileRes.message || 'Enter a valid 10-digit Indian mobile number.'}</span>
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
                  <span className="sum-val">{isOtherCollegeSelected ? (data.customCollege || data.college) : data.college}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Course / Program</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.course}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-key">Branch / Specialization</span>
                  <span className="sum-sep">:</span>
                  <span className="sum-val">{data.branch === 'Others' ? data.customBranch : data.branch}</span>
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
                  <span className="sum-key">Email Address</span>
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
