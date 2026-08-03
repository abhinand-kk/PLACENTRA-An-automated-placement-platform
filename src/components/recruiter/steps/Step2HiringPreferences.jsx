import React, { useState } from 'react';
import { Sliders, ArrowRight, ArrowLeft, X, Search, Check, Info } from 'lucide-react';

export default function Step2HiringPreferences({ state, onChange, onNext, onBack }) {
  const data = state.hiringPreferences || {};

  // Local open dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'roles' | 'courses' | 'branches' | null
  const [roleSearch, setRoleSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');

  // Values with fallbacks
  const targetRoles = data.targetRoles || ['Software Engineer', 'Full Stack Developer'];
  const hiringType = data.hiringType || 'Full-Time';
  const eligibleCourses = data.eligibleCourses || ['B.Tech', 'MCA'];
  const eligibleBranches = data.eligibleBranches || ['Computer Science', 'Artificial Intelligence'];
  const minCgpa = data.minCgpa || '7.5';
  const maxBacklogs = data.maxBacklogs || '0';
  const expectedHiringMonth = data.expectedHiringMonth || '2026-09';
  const expectedStudents = data.expectedStudents || '15';
  const packageOffered = data.packageOffered || '8.5';
  const workMode = data.workMode || 'On-site';
  const campusVisit = data.campusVisit || 'Yes';
  const additionalRequirements = data.additionalRequirements || '';

  // Options Data
  const roleOptions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'AI/ML Engineer',
    'QA Engineer',
    'DevOps Engineer',
    'UI/UX Designer'
  ];

  const courseOptions = ['B.Tech', 'MCA', 'BCA', 'M.Tech', 'MBA', 'B.Sc', 'M.Sc'];

  const branchOptions = [
    'Computer Science',
    'Information Technology',
    'Artificial Intelligence',
    'Data Science',
    'Electronics',
    'Electrical',
    'Mechanical',
    'Civil'
  ];

  const filteredRoles = roleOptions.filter(r =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredBranches = branchOptions.filter(b =>
    b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const handleChange = (field, val) => {
    onChange('hiringPreferences', {
      targetRoles,
      hiringType,
      eligibleCourses,
      eligibleBranches,
      minCgpa,
      maxBacklogs,
      expectedHiringMonth,
      expectedStudents,
      packageOffered,
      workMode,
      campusVisit,
      additionalRequirements,
      ...data,
      [field]: val
    });
  };

  const handleToggleRole = (roleItem) => {
    let updated;
    if (targetRoles.includes(roleItem)) {
      updated = targetRoles.filter(r => r !== roleItem);
    } else {
      updated = [...targetRoles, roleItem];
    }
    handleChange('targetRoles', updated);
  };

  const handleToggleCourse = (courseItem) => {
    let updated;
    if (eligibleCourses.includes(courseItem)) {
      updated = eligibleCourses.filter(c => c !== courseItem);
    } else {
      updated = [...eligibleCourses, courseItem];
    }
    handleChange('eligibleCourses', updated);
  };

  const handleToggleBranch = (branchItem) => {
    let updated;
    if (eligibleBranches.includes(branchItem)) {
      updated = eligibleBranches.filter(b => b !== branchItem);
    } else {
      updated = [...eligibleBranches, branchItem];
    }
    handleChange('eligibleBranches', updated);
  };

  // Validation
  const isFormValid =
    targetRoles.length > 0 &&
    Boolean(hiringType) &&
    eligibleCourses.length > 0 &&
    eligibleBranches.length > 0 &&
    Boolean(minCgpa) &&
    Boolean(maxBacklogs) &&
    Boolean(expectedHiringMonth) &&
    Boolean(expectedStudents) &&
    Boolean(packageOffered) &&
    Boolean(workMode) &&
    Boolean(campusVisit);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange('hiringPreferences', {
      targetRoles,
      hiringType,
      eligibleCourses,
      eligibleBranches,
      minCgpa,
      maxBacklogs,
      expectedHiringMonth,
      expectedStudents,
      packageOffered,
      workMode,
      campusVisit,
      additionalRequirements
    });
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="step-container" onClick={() => setOpenDropdown(null)}>
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <Sliders size={22} />
        </div>
        <div className="step-header-text">
          <h2>Hiring Preferences</h2>
          <p>Define your target candidate profiles, package details, and drive logistics.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Target Job Roles (Searchable Multi-select) */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <label className="form-label">Target Job Roles <span className="req">*</span></label>
          <div 
            className="subject-tags-container"
            onClick={() => setOpenDropdown(openDropdown === 'roles' ? null : 'roles')}
            style={{ cursor: 'pointer' }}
          >
            {targetRoles.map((r, idx) => (
              <span key={idx} className="subject-tag-pill">
                <span>{r}</span>
                <button 
                  type="button" 
                  className="tag-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleRole(r);
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
            <span style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>
              Select Roles ▼
            </span>
          </div>

          {/* Popup Dropdown for Target Roles */}
          {openDropdown === 'roles' && (
            <div className="searchable-popup-card">
              <div className="popup-search-box">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search job roles..." 
                  value={roleSearch} 
                  onChange={(e) => setRoleSearch(e.target.value)} 
                  autoFocus 
                />
              </div>
              <div className="popup-options-list">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((r, idx) => {
                    const isSelected = targetRoles.includes(r);
                    return (
                      <div 
                        key={idx} 
                        className={`popup-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleRole(r)}
                      >
                        <span>{r}</span>
                        {isSelected && <Check size={16} color="#4F46E5" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="popup-item empty">No matching roles found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Hiring Type Radio */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Hiring Type <span className="req">*</span></label>
          <div className="gender-tile-group">
            {['Internship', 'Full-Time', 'Both'].map((type) => (
              <div 
                key={type} 
                className={`gender-tile ${hiringType === type ? 'selected' : ''}`}
                onClick={() => handleChange('hiringType', type)}
              >
                <span className="radio-dot"></span>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Eligible Courses (Multi-select) */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <label className="form-label">Eligible Courses <span className="req">*</span></label>
          <div className="field-chips-row">
            {courseOptions.map((c) => {
              const isSelected = eligibleCourses.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  className={`field-chip-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleCourse(c)}
                >
                  {c} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Eligible Branches (Searchable Multi-select) */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <label className="form-label">Eligible Branches <span className="req">*</span></label>
          <div 
            className="subject-tags-container"
            onClick={() => setOpenDropdown(openDropdown === 'branches' ? null : 'branches')}
            style={{ cursor: 'pointer' }}
          >
            {eligibleBranches.map((b, idx) => (
              <span key={idx} className="subject-tag-pill">
                <span>{b}</span>
                <button 
                  type="button" 
                  className="tag-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBranch(b);
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
            <span style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>
              Select Branches ▼
            </span>
          </div>

          {/* Popup Dropdown for Branches */}
          {openDropdown === 'branches' && (
            <div className="searchable-popup-card">
              <div className="popup-search-box">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search branches..." 
                  value={branchSearch} 
                  onChange={(e) => setBranchSearch(e.target.value)} 
                  autoFocus 
                />
              </div>
              <div className="popup-options-list">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((b, idx) => {
                    const isSelected = eligibleBranches.includes(b);
                    return (
                      <div 
                        key={idx} 
                        className={`popup-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleBranch(b)}
                      >
                        <span>{b}</span>
                        {isSelected && <Check size={16} color="#4F46E5" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="popup-item empty">No matching branches found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row: Minimum CGPA & Maximum Active Backlogs */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Minimum CGPA <span className="req">*</span></label>
            <input 
              type="number"
              className="form-control"
              placeholder="7.5"
              step="0.1"
              min="0"
              max="10"
              value={minCgpa}
              onChange={(e) => handleChange('minCgpa', e.target.value)}
              required
            />
            <span className="sub-caption">On a scale of 10.0</span>
          </div>

          <div className="form-group">
            <label className="form-label">Maximum Active Backlogs <span className="req">*</span></label>
            <select 
              className="form-control"
              value={maxBacklogs}
              onChange={(e) => handleChange('maxBacklogs', e.target.value)}
              required
            >
              <option value="0">0 (No Active Backlogs)</option>
              <option value="1">1 Active Backlog</option>
              <option value="2">2 Active Backlogs</option>
              <option value="3">3 Active Backlogs</option>
              <option value="No Restriction">No Restriction</option>
            </select>
          </div>
        </div>

        {/* Row: Expected Hiring Month & Expected Students */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Expected Hiring Month <span className="req">*</span></label>
            <input 
              type="month"
              className="form-control"
              value={expectedHiringMonth}
              onChange={(e) => handleChange('expectedHiringMonth', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Number of Students <span className="req">*</span></label>
            <input 
              type="number"
              className="form-control"
              placeholder="15"
              min="1"
              value={expectedStudents}
              onChange={(e) => handleChange('expectedStudents', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row: Package Offered & Work Mode */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Package Offered (LPA) <span className="req">*</span></label>
            <div className="percentage-input-group">
              <input 
                type="number"
                className="form-control"
                placeholder="8.5"
                step="0.1"
                min="0"
                value={packageOffered}
                onChange={(e) => handleChange('packageOffered', e.target.value)}
                required
              />
              <span className="percent-suffix">LPA</span>
            </div>
            <span className="sub-caption">Annual CTC in Lakhs Per Annum</span>
          </div>

          <div className="form-group">
            <label className="form-label">Work Mode <span className="req">*</span></label>
            <div className="gender-tile-group">
              {['On-site', 'Hybrid', 'Remote'].map((mode) => (
                <div 
                  key={mode} 
                  className={`gender-tile ${workMode === mode ? 'selected' : ''}`}
                  onClick={() => handleChange('workMode', mode)}
                >
                  <span className="radio-dot"></span>
                  <span>{mode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campus Visit Required Toggle */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Campus Visit Required? <span className="req">*</span></label>
          <div className="gender-tile-group" style={{ maxWidth: '280px' }}>
            {['Yes', 'No'].map((vis) => (
              <div 
                key={vis} 
                className={`gender-tile ${campusVisit === vis ? 'selected' : ''}`}
                onClick={() => handleChange('campusVisit', vis)}
              >
                <span className="radio-dot"></span>
                <span>{vis}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Requirements Textarea */}
        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label">Additional Requirements</label>
          <textarea 
            className="form-control"
            rows="3"
            placeholder="Specify any skill prerequisites, bond terms, or interview process notes..."
            value={additionalRequirements}
            onChange={(e) => handleChange('additionalRequirements', e.target.value)}
            maxLength="500"
          />
          <span className="char-count-text">
            {(additionalRequirements || '').length}/500
          </span>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <button type="button" className="btn-wizard-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
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
    </div>
  );
}
