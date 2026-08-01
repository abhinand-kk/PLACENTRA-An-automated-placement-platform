import React, { useState } from 'react';
import { School, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function Step4PreviousEducation({ state, onChange, onNext, onBack }) {
  const [showAddQualModal, setShowAddQualModal] = useState(false);
  const [qualData, setQualData] = useState({ type: 'Diploma', institution: '', year: '', score: '' });

  const data = state.previousEducation;

  const handleClass12Change = (field, val) => {
    onChange('previousEducation', {
      ...data,
      class12: { ...data.class12, [field]: val }
    });
  };

  const handleClass10Change = (field, val) => {
    onChange('previousEducation', {
      ...data,
      class10: { ...data.class10, [field]: val }
    });
  };

  const handleAddQualSubmit = (e) => {
    e.preventDefault();
    const newQual = { ...qualData, id: Date.now().toString() };
    onChange('previousEducation', {
      ...data,
      additionalQualifications: [...data.additionalQualifications, newQual]
    });
    setShowAddQualModal(false);
    setQualData({ type: 'Diploma', institution: '', year: '', score: '' });
  };

  const handleRemoveQual = (id) => {
    onChange('previousEducation', {
      ...data,
      additionalQualifications: data.additionalQualifications.filter(q => q.id !== id)
    });
  };

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <School size={22} />
        </div>
        <div className="step-header-text">
          <h2>Previous Education (All Details)</h2>
          <p>Tell us about your Class XII, Class X and any previous qualifications.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        {/* Class XII / Diploma Section */}
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
          Class XII / Diploma Details
        </h3>

        <div className="form-grid-2" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Class XII / Diploma Board <span className="req">*</span></label>
            <select 
              className="form-control"
              value={data.class12.board}
              onChange={(e) => handleClass12Change('board', e.target.value)}
              required
            >
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School / College Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Delhi Public School"
              value={data.class12.schoolName}
              onChange={(e) => handleClass12Change('schoolName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Year of Passing <span className="req">*</span></label>
            <select 
              className="form-control"
              value={data.class12.yearOfPassing}
              onChange={(e) => handleClass12Change('yearOfPassing', e.target.value)}
              required
            >
              <option value="">Select Year</option>
              {['2024', '2023', '2022', '2021', '2020'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Percentage / Marks <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. 92.40%"
              value={data.class12.percentage}
              onChange={(e) => handleClass12Change('percentage', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Obtained Marks / Max Marks</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Obtained"
                value={data.class12.obtainedMarks}
                onChange={(e) => handleClass12Change('obtainedMarks', e.target.value)}
              />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Max"
                value={data.class12.maxMarks}
                onChange={(e) => handleClass12Change('maxMarks', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Class X Section */}
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          Class X Details
        </h3>

        <div className="form-grid-2" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Board <span className="req">*</span></label>
            <select 
              className="form-control"
              value={data.class10.board}
              onChange={(e) => handleClass10Change('board', e.target.value)}
              required
            >
              <option value="">Select Board</option>
              <option value="ICSE">ICSE</option>
              <option value="CBSE">CBSE</option>
              <option value="State Board">State Board</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. St. George's High School"
              value={data.class10.schoolName}
              onChange={(e) => handleClass10Change('schoolName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Year of Passing <span className="req">*</span></label>
            <select 
              className="form-control"
              value={data.class10.yearOfPassing}
              onChange={(e) => handleClass10Change('yearOfPassing', e.target.value)}
              required
            >
              <option value="">Select Year</option>
              {['2022', '2021', '2020', '2019'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Percentage / Marks <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. 94.20%"
              value={data.class10.percentage}
              onChange={(e) => handleClass10Change('percentage', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Obtained Marks / Max Marks</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Obtained"
                value={data.class10.obtainedMarks}
                onChange={(e) => handleClass10Change('obtainedMarks', e.target.value)}
              />
              <input 
                type="text" 
                className="form-control"
                placeholder="Max"
                value={data.class10.maxMarks}
                onChange={(e) => handleClass10Change('maxMarks', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Additional Qualification List */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Additional Qualification</h3>
          <button 
            type="button" 
            className="btn-sm-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setShowAddQualModal(true)}
          >
            <Plus size={14} />
            <span>Add Qualification</span>
          </button>
        </div>

        {data.additionalQualifications.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic', marginBottom: '20px' }}>
            No additional qualifications added yet.
          </div>
        ) : (
          data.additionalQualifications.map((q) => (
            <div key={q.id} className="verify-card" style={{ marginBottom: '12px' }}>
              <div className="verify-info">
                <span className="verify-label">{q.type} in {q.institution}</span>
                <div className="verify-val-row">
                  <span className="verify-val">{q.institution} | {q.year} | {q.score}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-sm-action" onClick={() => handleRemoveQual(q.id)}>
                  <Trash2 size={14} color="#EF4444" />
                </button>
              </div>
            </div>
          ))
        )}

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

      {/* Add Qualification Modal */}
      {showAddQualModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add Qualification</h3>
              <button className="modal-close-btn" onClick={() => setShowAddQualModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddQualSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Qualification Type <span className="req">*</span></label>
                  <select 
                    className="form-control"
                    value={qualData.type}
                    onChange={(e) => setQualData({ ...qualData, type: e.target.value })}
                    required
                  >
                    <option value="Diploma">Diploma</option>
                    <option value="Certification">Certification</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Institute / Branch <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Govt. Polytechnic College"
                    value={qualData.institution}
                    onChange={(e) => setQualData({ ...qualData, institution: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Year of Passing</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 2021"
                      value={qualData.year}
                      onChange={(e) => setQualData({ ...qualData, year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Score / Percentage</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 89.65%"
                      value={qualData.score}
                      onChange={(e) => setQualData({ ...qualData, score: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-wizard-secondary" onClick={() => setShowAddQualModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-wizard-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
