import React, { useState } from 'react';
import { GraduationCap, ArrowRight, ArrowLeft, AlertCircle, Search, X, Check, Info } from 'lucide-react';

export default function Step3CurrentEducation({ state, onChange, onNext, onBack }) {
  const data = state.currentEducation || {};

  // Dropdown open & search state
  const [openDropdown, setOpenDropdown] = useState(null); // 'field' | 'program' | 'major' | null
  const [programSearch, setProgramSearch] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');

  // Values with defaults matching visual display
  const status = data.status || 'pursuing';
  const fieldOfStudy = data.fieldOfStudy || 'Computer Applications';
  const program = data.program || 'MCA (Integrated)';
  const major = data.major || 'UI Design';
  const startDate = data.startDate || '2026-06-18';
  const expectedEndDate = data.expectedEndDate || '2028-07-27';
  const batch = data.batch || '2026 Passout Batch';
  const currentSemester = data.currentSemester || '3';
  const percentage = data.percentage || '88';
  const totalBacklogs = data.totalBacklogs ?? '0';

  // Field Options Data
  const fieldOptions = [
    'Engineering & Technology',
    'Computer Applications',
    'Management',
    'Commerce',
    'Science',
    'Arts & Humanities',
    'Law'
  ];

  const programOptions = [
    'MCA (Integrated)',
    'MCA',
    'MCA (Lateral Entry)',
    'MCA + MBA (Integrated)',
    'BCA + MCA (Integrated)',
    'M.Tech + MCA (Integrated)',
    'MCA + M.Tech (Integrated)',
    'PGDM + MCA (Integrated)',
    'B.Tech Computer Science',
    'B.Tech Electronics & Comm',
    'B.Tech Mechanical',
    'M.Tech Artificial Intelligence',
    'MBA'
  ];

  const majorOptions = [
    'UI Design',
    'User Experience Design',
    'Human Computer Interaction',
    'UI/UX Design',
    'User Interface Development',
    'Visual Interface Design',
    'Artificial Intelligence',
    'Machine Learning',
    'Cyber Security',
    'Data Science',
    'Cloud Computing',
    'Software Engineering'
  ];

  const filteredPrograms = programOptions.filter(p =>
    p.toLowerCase().includes(programSearch.toLowerCase())
  );

  const filteredMajors = majorOptions.filter(m =>
    m.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const filteredFields = fieldOptions.filter(f =>
    f.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const handleChange = (field, val) => {
    onChange('currentEducation', { 
      status,
      fieldOfStudy,
      program,
      major,
      startDate,
      expectedEndDate,
      batch,
      currentSemester,
      percentage,
      totalBacklogs,
      ...data, 
      [field]: val 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange('currentEducation', {
      status,
      fieldOfStudy,
      program,
      major,
      startDate,
      expectedEndDate,
      batch,
      currentSemester,
      percentage,
      totalBacklogs
    });
    onNext();
  };

  return (
    <div className="step-container" onClick={() => setOpenDropdown(null)}>
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <GraduationCap size={22} />
        </div>
        <div className="step-header-text">
          <h2>Current / Most Recent Education</h2>
          <p>Tell us about your highest level of education or your current degree.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Education Status Radio */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Choose an option <span className="req">*</span></label>
          <div className="radio-options-stack" style={{ marginTop: '6px' }}>
            <label className="radio-option-row">
              <input 
                type="radio" 
                name="eduStatusChoice" 
                value="pursuing"
                checked={status === 'pursuing'}
                onChange={() => handleChange('status', 'pursuing')}
              />
              <span className="radio-label-text">
                I am currently pursuing an education and have not received my degree.
              </span>
            </label>

            <label className="radio-option-row" style={{ marginTop: '8px' }}>
              <input 
                type="radio" 
                name="eduStatusChoice" 
                value="completed"
                checked={status === 'completed'}
                onChange={() => handleChange('status', 'completed')}
              />
              <span className="radio-label-text">
                I have completed my education.
              </span>
            </label>
          </div>
        </div>

        {/* Yellow Warning Notice */}
        <div className="wizard-alert alert-amber" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>Choose your program and major carefully. You won't be able to change these later.</span>
        </div>

        {/* Field of Study Category Pills */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <label className="form-label">Field of Study <span className="req">*</span></label>
          <div className="field-chips-row">
            {fieldOptions.slice(0, 5).map((f) => (
              <button
                key={f}
                type="button"
                className={`field-chip-btn ${fieldOfStudy === f ? 'selected' : ''}`}
                onClick={() => handleChange('fieldOfStudy', f)}
              >
                {f}
              </button>
            ))}
            <button 
              type="button" 
              className="field-chip-showall"
              onClick={() => setOpenDropdown(openDropdown === 'field' ? null : 'field')}
            >
              Show all
            </button>
          </div>

          {/* Field of Study Searchable Popup */}
          {openDropdown === 'field' && (
            <div className="searchable-popup-card field-popup">
              <div className="popup-options-list">
                {filteredFields.map((f, idx) => (
                  <div
                    key={idx}
                    className={`popup-item ${fieldOfStudy === f ? 'selected' : ''}`}
                    onClick={() => {
                      handleChange('fieldOfStudy', f);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{f}</span>
                    {fieldOfStudy === f && <Check size={16} color="#4F46E5" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Program / Degree Searchable Dropdown */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <label className="form-label">Program / Degree <span className="req">*</span></label>
          <div 
            className="searchable-input-trigger"
            onClick={() => setOpenDropdown(openDropdown === 'program' ? null : 'program')}
          >
            <span className={program ? 'trigger-val' : 'trigger-placeholder'}>
              {program || 'Select Program / Degree'}
            </span>
            <div className="trigger-actions">
              {program && (
                <button 
                  type="button" 
                  className="clear-val-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChange('program', '');
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <span className="dropdown-arrow-icon">▼</span>
            </div>
          </div>

          <div className="sub-links-row">
            <span className="sub-link">Can't find your program?</span>
            <span className="sub-link">Add Manually</span>
          </div>

          {/* Program Searchable Popup List */}
          {openDropdown === 'program' && (
            <div className="searchable-popup-card">
              <div className="popup-search-box">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="mca" 
                  value={programSearch} 
                  onChange={(e) => setProgramSearch(e.target.value)} 
                  autoFocus 
                />
              </div>
              <div className="popup-options-list">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((p, idx) => (
                    <div 
                      key={idx} 
                      className={`popup-item ${program === p ? 'selected' : ''}`}
                      onClick={() => {
                        handleChange('program', p);
                        setOpenDropdown(null);
                      }}
                    >
                      <span>{p}</span>
                      {program === p && <Check size={16} color="#4F46E5" />}
                    </div>
                  ))
                ) : (
                  <div className="popup-item empty">No matching programs found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Major / Branch / Specialization Searchable Dropdown */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <label className="form-label">Major / Branch / Specialization <span className="req">*</span></label>
          <div 
            className="searchable-input-trigger"
            onClick={() => setOpenDropdown(openDropdown === 'major' ? null : 'major')}
          >
            <span className={major ? 'trigger-val' : 'trigger-placeholder'}>
              {major || 'Select Specialization'}
            </span>
            <div className="trigger-actions">
              {major && (
                <button 
                  type="button" 
                  className="clear-val-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChange('major', '');
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <span className="dropdown-arrow-icon">▼</span>
            </div>
          </div>

          <div className="sub-links-row">
            <span className="sub-link">Can't find your specialization?</span>
            <span className="sub-link">Add Manually</span>
          </div>

          {/* Major Searchable Popup List */}
          {openDropdown === 'major' && (
            <div className="searchable-popup-card">
              <div className="popup-search-box">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="ui" 
                  value={majorSearch} 
                  onChange={(e) => setMajorSearch(e.target.value)} 
                  autoFocus 
                />
              </div>
              <div className="popup-options-list">
                {filteredMajors.length > 0 ? (
                  filteredMajors.map((m, idx) => (
                    <div 
                      key={idx} 
                      className={`popup-item ${major === m ? 'selected' : ''}`}
                      onClick={() => {
                        handleChange('major', m);
                        setOpenDropdown(null);
                      }}
                    >
                      <span>{m}</span>
                      {major === m && <Check size={16} color="#4F46E5" />}
                    </div>
                  ))
                ) : (
                  <div className="popup-item empty">No matching specializations found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 1: Course Start Date, Course End Date, Batch */}
        <div className="form-grid-3" style={{ marginBottom: '22px' }}>
          {/* Start Date */}
          <div className="form-group">
            <label className="form-label">Course Start Date <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="date" 
                className="form-control"
                value={startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div className="form-group">
            <label className="form-label">Course End Date <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="date" 
                className="form-control"
                value={expectedEndDate}
                onChange={(e) => handleChange('expectedEndDate', e.target.value)}
                required
              />
            </div>
            <span className="sub-caption">Expected course graduation date</span>
          </div>

          {/* Batch */}
          <div className="form-group">
            <label className="form-label">Batch <span className="req">*</span></label>
            <select 
              className="form-control"
              value={batch}
              onChange={(e) => handleChange('batch', e.target.value)}
              required
            >
              <option value="">Select Batch</option>
              <option value="2024 Passout Batch">2024 Passout Batch</option>
              <option value="2025 Passout Batch">2025 Passout Batch</option>
              <option value="2026 Passout Batch">2026 Passout Batch</option>
              <option value="2027 Passout Batch">2027 Passout Batch</option>
              <option value="2028 Passout Batch">2028 Passout Batch</option>
            </select>
          </div>
        </div>

        {/* Row 2: Current Semester, Percentage, Total Backlogs */}
        <div className="form-grid-3" style={{ marginBottom: '22px' }}>
          {/* Current Semester */}
          <div className="form-group">
            <label className="form-label">Current Semester <span className="req">*</span></label>
            <select 
              className="form-control"
              value={currentSemester}
              onChange={(e) => handleChange('currentSemester', e.target.value)}
              required
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                <option key={s} value={String(s)}>{s}</option>
              ))}
            </select>
          </div>

          {/* Percentage / CGPA */}
          <div className="form-group">
            <label className="form-label">Enter your Percentage <span className="req">*</span></label>
            <div className="percentage-input-group">
              <input 
                type="text" 
                className="form-control"
                placeholder="88"
                value={percentage}
                onChange={(e) => handleChange('percentage', e.target.value)}
                required
              />
              <span className="percent-suffix">%</span>
            </div>
            <span className="sub-caption">Enter CGPA if your institute follows CGPA system</span>
          </div>

          {/* Total Backlogs */}
          <div className="form-group">
            <label className="form-label">
              Total Backlogs <Info size={13} style={{ color: '#94A3B8', verticalAlign: 'middle', marginLeft: '2px' }} />
            </label>
            <input 
              type="number" 
              className="form-control"
              placeholder="0"
              value={totalBacklogs}
              onChange={(e) => handleChange('totalBacklogs', e.target.value)}
              min="0"
            />
            <span className="sub-caption">Cleared or ongoing</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <button type="button" className="btn-wizard-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <button 
            type="submit" 
            className="btn-wizard-primary"
          >
            <span>Save and Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
