import React from 'react';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Step3CurrentEducation({ state, onChange, onNext, onBack }) {
  const data = state.currentEducation;

  const handleChange = (field, val) => {
    onChange('currentEducation', { ...data, [field]: val });
  };

  return (
    <div className="step-container">
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

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        {/* Education Status Radio */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Education Status <span className="req">*</span></label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600 }}>
              <input 
                type="radio" 
                name="eduStatus" 
                value="pursuing"
                checked={data.status === 'pursuing'}
                onChange={() => handleChange('status', 'pursuing')}
                style={{ accentColor: '#4F46E5', width: '16px', height: '16px' }}
              />
              <span>I am currently pursuing this degree</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600 }}>
              <input 
                type="radio" 
                name="eduStatus" 
                value="completed"
                checked={data.status === 'completed'}
                onChange={() => handleChange('status', 'completed')}
                style={{ accentColor: '#4F46E5', width: '16px', height: '16px' }}
              />
              <span>I have completed this degree</span>
            </label>
          </div>
        </div>

        {/* Field of Study & Program */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Field of Study <span className="req">*</span></label>
            <select 
              className="form-control"
              value={data.fieldOfStudy}
              onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
              required
            >
              <option value="">Select Field of Study</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Program / Degree <span className="req">*</span></label>
            <select 
              className="form-control"
              value={data.program}
              onChange={(e) => handleChange('program', e.target.value)}
              required
            >
              <option value="">Select Program / Degree</option>
              <option value="MCA (Integrated)">MCA (Integrated)</option>
              <option value="MCA">MCA</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="BCA">BCA</option>
            </select>
          </div>
        </div>

        {/* Major / Branch */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Major / Branch / Specialization <span className="req">*</span></label>
          <input 
            type="text" 
            className="form-control"
            placeholder="e.g. Artificial Intelligence"
            value={data.major}
            onChange={(e) => handleChange('major', e.target.value)}
            required
          />
        </div>

        {/* Start Date & Expected End Date */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Course Start Date <span className="req">*</span></label>
            <input 
              type="month" 
              className="form-control"
              value={data.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected End Date <span className="req">*</span></label>
            <input 
              type="month" 
              className="form-control"
              value={data.expectedEndDate}
              onChange={(e) => handleChange('expectedEndDate', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Batch & Current Semester */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Batch <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. 2023 - 2028"
              value={data.batch}
              onChange={(e) => handleChange('batch', e.target.value)}
              required
            />
          </div>

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
        </div>

        {/* Percentage / CGPA & Total Backlogs */}
        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Percentage / CGPA (Till Now) <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-control"
                style={{ flex: 1 }}
                placeholder="e.g. 88.50"
                value={data.percentage}
                onChange={(e) => handleChange('percentage', e.target.value)}
                required
              />
              <select 
                className="form-control"
                style={{ width: '90px' }}
                value={data.scoreType}
                onChange={(e) => handleChange('scoreType', e.target.value)}
              >
                <option value="%">%</option>
                <option value="CGPA">CGPA</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Backlogs <span className="req">*</span></label>
            <input 
              type="number" 
              className="form-control"
              placeholder="0"
              value={data.totalBacklogs}
              onChange={(e) => handleChange('totalBacklogs', e.target.value)}
              min="0"
              required
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <button type="button" className="btn-wizard-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <button type="submit" className="btn-wizard-primary">
            <span>Save and Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
