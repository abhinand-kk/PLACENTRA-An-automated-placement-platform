import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../../services/api';

export default function Step4PreviousEducation({ state, onChange, onNext, onBack }) {
  const [showAddQualModal, setShowAddQualModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingQualId, setEditingQualId] = useState(null);
  const [deletingQual, setDeletingQual] = useState(null);

  const [qualForm, setQualForm] = useState({
    type: 'Diploma',
    stream: '',
    institute: '',
    year: '',
    percentage: ''
  });

  const data = state.previousEducation || {};
  const c12 = data.class12 || {};
  const c10 = data.class10 || {};
  
  const additionalList = data.additionalQualifications || [];

  const availableSubjects = [
    'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 
    'Biology', 'Electronics', 'Accountancy', 'Economics', 'Business Studies'
  ];

  const selectedSubjects = c12.subjects || [];

  // Lock body scroll when any modal is active
  useEffect(() => {
    if (showAddQualModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddQualModal, showDeleteModal]);

  const handleClass12Change = (field, val) => {
    onChange('previousEducation', {
      ...data,
      additionalQualifications: additionalList,
      class12: { ...c12, [field]: val }
    });
  };

  const handleClass10Change = (field, val) => {
    onChange('previousEducation', {
      ...data,
      additionalQualifications: additionalList,
      class10: { ...c10, [field]: val }
    });
  };

  const handleRemoveSubject = (subToRemove) => {
    handleClass12Change('subjects', selectedSubjects.filter(s => s !== subToRemove));
  };

  const handleAddSubject = (subToAdd) => {
    if (subToAdd && !selectedSubjects.includes(subToAdd)) {
      handleClass12Change('subjects', [...selectedSubjects, subToAdd]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQualId(null);
    setQualForm({
      type: 'Diploma',
      stream: '',
      institute: '',
      year: '',
      percentage: ''
    });
    setShowAddQualModal(true);
  };

  const handleEditQual = (q) => {
    setEditingQualId(q.id);
    setQualForm({
      type: q.type || 'Diploma',
      stream: q.stream || q.institution || q.board_or_university || '',
      institute: q.institute || q.institution_name || q.board_or_university || '',
      year: String(q.year || q.year_of_passing || ''),
      percentage: String(q.percentage || q.score || '')
    });
    setShowAddQualModal(true);
  };

  const handleRequestDeleteQual = (q) => {
    setDeletingQual(q);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteQual = async () => {
    if (!deletingQual) return;
    const targetId = deletingQual.id;
    
    const updatedList = additionalList.filter(q => q.id !== targetId);
    onChange('previousEducation', {
      ...data,
      additionalQualifications: updatedList
    });

    if (targetId && typeof targetId === 'number') {
      try {
        await api.delete(`/api/v1/students/previous-education/${targetId}/`);
      } catch (err) {
        console.warn("Backend qualification deletion error:", err);
      }
    }

    setShowDeleteModal(false);
    setDeletingQual(null);
  };

  const handleSaveQualSubmit = async (e) => {
    e.preventDefault();
    let updatedList;
    
    if (editingQualId) {
      const updatedItem = { ...qualForm, id: editingQualId };
      updatedList = additionalList.map(q => q.id === editingQualId ? updatedItem : q);
      onChange('previousEducation', { ...data, additionalQualifications: updatedList });

      if (editingQualId && typeof editingQualId === 'number') {
        try {
          await api.put(`/api/v1/students/previous-education/${editingQualId}/`, {
            institution_name: qualForm.institute,
            board_or_university: qualForm.stream,
            year_of_passing: parseInt(qualForm.year) || 2024,
            percentage: parseFloat(qualForm.percentage.replace('%', '')) || 0.0
          });
        } catch (err) {
          console.warn("Backend qualification update error:", err);
        }
      }
    } else {
      const newQual = { ...qualForm, id: `qual-${Date.now()}` };
      updatedList = [...additionalList, newQual];
      onChange('previousEducation', { ...data, additionalQualifications: updatedList });
    }

    setShowAddQualModal(false);
    setEditingQualId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const passYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <GraduationCap size={22} />
        </div>
        <div className="step-header-text">
          <h2>Previous Education (All Details)</h2>
          <p>Tell us about your Class XII, Class X and any other previous qualifications.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: Class XII / Diploma Details */}
        <h3 className="wizard-section-title">Class XII / Diploma Details</h3>

        <div className="form-grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Qualification Type <span className="req">*</span></label>
            <div className="radio-options-row" style={{ marginTop: '8px' }}>
              <label className="radio-option-row">
                <input 
                  type="radio" 
                  name="c12QualType" 
                  value="10+2"
                  checked={c12.qualType === '10+2' || !c12.qualType}
                  onChange={() => handleClass12Change('qualType', '10+2')}
                />
                <span>Class XII (10+2)</span>
              </label>

              <label className="radio-option-row">
                <input 
                  type="radio" 
                  name="c12QualType" 
                  value="Diploma"
                  checked={c12.qualType === 'Diploma'}
                  onChange={() => handleClass12Change('qualType', 'Diploma')}
                />
                <span>Diploma</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Stream / Board <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c12.board || ''}
              onChange={(e) => handleClass12Change('board', e.target.value)}
              required
            >
              <option value="">Select board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="IB">IB</option>
              <option value="Diploma">Diploma</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School / College Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Enter school or college name"
              value={c12.schoolName || ''}
              onChange={(e) => handleClass12Change('schoolName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Year of Passing <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c12.yearOfPassing || ''}
              onChange={(e) => handleClass12Change('yearOfPassing', e.target.value)}
              required
            >
              <option value="">Select year of passing</option>
              {passYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Percentage / Marks <span className="req">*</span></label>
            <div className="percentage-input-group">
              <input 
                type="text" 
                className="form-control"
                placeholder="Enter percentage"
                value={c12.percentage || ''}
                onChange={(e) => handleClass12Change('percentage', e.target.value)}
                required
              />
              <span className="percent-suffix">%</span>
            </div>
            <span className="sub-caption">Enter percentage as per marksheet</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '32px' }}>
          <label className="form-label">Subjects Studied <span className="req">*</span></label>
          <div className="subject-tags-container">
            {selectedSubjects.map((sub, idx) => (
              <span key={idx} className="subject-tag-pill">
                <span>{sub}</span>
                <button 
                  type="button" 
                  className="tag-remove-btn"
                  onClick={() => handleRemoveSubject(sub)}
                >
                  ✕
                </button>
              </span>
            ))}
            <select 
              className="subject-add-select"
              value=""
              onChange={(e) => handleAddSubject(e.target.value)}
            >
              <option value="">+ Add Subject</option>
              {availableSubjects.filter(s => !selectedSubjects.includes(s)).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2: Class X Details */}
        <div className="wizard-section-divider"></div>
        <h3 className="wizard-section-title">Class X Details</h3>

        <div className="form-grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Board <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c10.board || ''}
              onChange={(e) => handleClass10Change('board', e.target.value)}
              required
            >
              <option value="">Select board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="IB">IB</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Enter school name"
              value={c10.schoolName || ''}
              onChange={(e) => handleClass10Change('schoolName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: '32px' }}>
          <div className="form-group">
            <label className="form-label">Year of Passing <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c10.yearOfPassing || ''}
              onChange={(e) => handleClass10Change('yearOfPassing', e.target.value)}
              required
            >
              <option value="">Select year of passing</option>
              {passYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Percentage / Marks <span className="req">*</span></label>
            <div className="percentage-input-group">
              <input 
                type="text" 
                className="form-control"
                placeholder="Enter percentage"
                value={c10.percentage || ''}
                onChange={(e) => handleClass10Change('percentage', e.target.value)}
                required
              />
              <span className="percent-suffix">%</span>
            </div>
            <span className="sub-caption">Enter percentage as per marksheet</span>
          </div>
        </div>

        {/* SECTION 3: Add Another Qualification (Optional) */}
        <div className="wizard-section-divider"></div>
        <div className="section-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 className="wizard-section-title" style={{ marginBottom: '2px' }}>
              Add Another Qualification (Optional)
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B' }}>
              Add any other previous qualification like ITI, Polytechnic, NIOS, etc.
            </p>
          </div>

          <button 
            type="button" 
            className="btn-card-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={handleOpenAddModal}
          >
            <Plus size={15} />
            <span>Add Qualification</span>
          </button>
        </div>

        {/* Added Qualification Cards List */}
        {additionalList.length === 0 ? (
          <div className="empty-experience-box" style={{ marginTop: '12px', marginBottom: '24px' }}>
            <div className="empty-box-icon">
              <GraduationCap size={22} color="#4F46E5" />
            </div>
            <div className="empty-box-title">No additional qualifications added.</div>
            <div className="empty-box-sub">Add any other previous qualification like ITI, Polytechnic, NIOS, Diploma, etc.</div>
          </div>
        ) : (
          additionalList.map((q) => (
            <div className="added-qual-card-row" key={q.id}>
              <div className="qual-card-left">
                <div className="card-icon-tile">
                  <GraduationCap size={20} />
                </div>
                <div className="qual-card-grid">
                  <div>
                    <div className="qual-col-label">Qualification Type</div>
                    <div className="qual-col-val">{q.type}</div>
                  </div>
                  <div>
                    <div className="qual-col-label">Stream / Branch</div>
                    <div className="qual-col-val">{q.stream || q.institution}</div>
                  </div>
                  <div>
                    <div className="qual-col-label">Institute Name</div>
                    <div className="qual-col-val">{q.institute || q.institution}</div>
                  </div>
                  <div>
                    <div className="qual-col-label">Year of Passing</div>
                    <div className="qual-col-val">{q.year}</div>
                  </div>
                  <div>
                    <div className="qual-col-label">Percentage / Marks</div>
                    <div className="qual-col-val">{q.percentage || q.score}</div>
                  </div>
                </div>
              </div>

              <div className="qual-card-actions">
                <button type="button" className="icon-action-btn" onClick={() => handleEditQual(q)}>
                  <Edit2 size={15} />
                </button>
                <button type="button" className="icon-action-btn danger" onClick={() => handleRequestDeleteQual(q)}>
                  <Trash2 size={15} />
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
          <button 
            type="submit" 
            className="btn-wizard-primary"
          >
            <span>Save and Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Add / Edit Qualification Modal */}
      {showAddQualModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingQualId ? 'Edit Qualification' : 'Add Qualification'}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddQualModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveQualSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Qualification Type <span className="req">*</span></label>
                  <select 
                    className="form-control"
                    value={qualForm.type}
                    onChange={(e) => setQualForm({ ...qualForm, type: e.target.value })}
                    required
                  >
                    <option value="Diploma">Diploma</option>
                    <option value="ITI">ITI</option>
                    <option value="Polytechnic">Polytechnic</option>
                    <option value="Certification">Certification</option>
                    <option value="NIOS">NIOS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Stream / Branch <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter stream / branch"
                    value={qualForm.stream}
                    onChange={(e) => setQualForm({ ...qualForm, stream: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Institute Name <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter institute name"
                    value={qualForm.institute}
                    onChange={(e) => setQualForm({ ...qualForm, institute: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Year of Passing <span className="req">*</span></label>
                    <select 
                      className="form-control"
                      value={qualForm.year}
                      onChange={(e) => setQualForm({ ...qualForm, year: e.target.value })}
                      required
                    >
                      <option value="">Select year of passing</option>
                      {passYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Percentage / Marks <span className="req">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Enter percentage"
                      value={qualForm.percentage}
                      onChange={(e) => setQualForm({ ...qualForm, percentage: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-wizard-secondary"
                  onClick={() => setShowAddQualModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wizard-primary">
                  Save Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingQual && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Delete Qualification</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete your <b>{deletingQual.type || 'Diploma'}</b> qualification ({deletingQual.stream || deletingQual.institute})? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-wizard-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-wizard-primary"
                style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', color: '#FFFFFF' }}
                onClick={handleConfirmDeleteQual}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
