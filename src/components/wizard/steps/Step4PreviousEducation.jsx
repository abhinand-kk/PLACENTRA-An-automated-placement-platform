import React, { useState } from 'react';
import { GraduationCap, ArrowRight, ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Step4PreviousEducation({ state, onChange, onNext, onBack }) {
  const [showAddQualModal, setShowAddQualModal] = useState(false);
  const [editingQualId, setEditingQualId] = useState(null);

  const [qualForm, setQualForm] = useState({
    type: 'Diploma',
    stream: 'Computer Engineering',
    institute: 'Govt. Polytechnic College, Kochi',
    year: '2021',
    percentage: '89.60%'
  });

  const data = state.previousEducation || {};
  const c12 = data.class12 || {};
  const c10 = data.class10 || {};
  const additionalList = data.additionalQualifications || [];

  const availableSubjects = ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biology', 'Electronics'];

  const handleClass12Change = (field, val) => {
    onChange('previousEducation', {
      ...data,
      class12: { ...c12, [field]: val }
    });
  };

  const handleClass10Change = (field, val) => {
    onChange('previousEducation', {
      ...data,
      class10: { ...c10, [field]: val }
    });
  };

  const handleRemoveSubject = (subToRemove) => {
    const currentSubs = c12.subjects || ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'];
    handleClass12Change('subjects', currentSubs.filter(s => s !== subToRemove));
  };

  const handleAddSubject = (subToAdd) => {
    const currentSubs = c12.subjects || ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'];
    if (!currentSubs.includes(subToAdd)) {
      handleClass12Change('subjects', [...currentSubs, subToAdd]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQualId(null);
    setQualForm({
      type: 'Diploma',
      stream: 'Computer Engineering',
      institute: 'Govt. Polytechnic College, Kochi',
      year: '2021',
      percentage: '89.60%'
    });
    setShowAddQualModal(true);
  };

  const handleEditQual = (q) => {
    setEditingQualId(q.id);
    setQualForm({
      type: q.type || 'Diploma',
      stream: q.stream || q.institution || 'Computer Engineering',
      institute: q.institute || q.institution || 'Govt. Polytechnic College, Kochi',
      year: q.year || '2021',
      percentage: q.percentage || q.score || '89.60%'
    });
    setShowAddQualModal(true);
  };

  const handleRemoveQual = (id) => {
    onChange('previousEducation', {
      ...data,
      additionalQualifications: additionalList.filter(q => q.id !== id)
    });
  };

  const handleSaveQualSubmit = (e) => {
    e.preventDefault();
    if (editingQualId) {
      const updated = additionalList.map(q => q.id === editingQualId ? { ...qualForm, id: editingQualId } : q);
      onChange('previousEducation', { ...data, additionalQualifications: updated });
    } else {
      const newQual = { ...qualForm, id: Date.now().toString() };
      onChange('previousEducation', { ...data, additionalQualifications: [...additionalList, newQual] });
    }
    setShowAddQualModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const selectedSubjects = c12.subjects || ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'];

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
              value={c12.board || 'CBSE'}
              onChange={(e) => handleClass12Change('board', e.target.value)}
              required
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="IB">IB</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School / College Name <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="Delhi Public School, Kochi"
              value={c12.schoolName || 'Delhi Public School, Kochi'}
              onChange={(e) => handleClass12Change('schoolName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Year of Passing <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c12.yearOfPassing || '2024'}
              onChange={(e) => handleClass12Change('yearOfPassing', e.target.value)}
              required
            >
              {['2024', '2023', '2022', '2021', '2020'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number <span className="req">*</span></label>
            <input 
              type="text" 
              className="form-control"
              placeholder="23456789"
              value={c12.rollNumber || '23456789'}
              onChange={(e) => handleClass12Change('rollNumber', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Board Roll Number (if any)</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="87654321"
              value={c12.boardRollNumber || '87654321'}
              onChange={(e) => handleClass12Change('boardRollNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Percentage / Marks <span className="req">*</span></label>
            <div className="percentage-input-group">
              <input 
                type="text" 
                className="form-control"
                placeholder="92.40"
                value={c12.percentage || '92.40'}
                onChange={(e) => handleClass12Change('percentage', e.target.value)}
                required
              />
              <span className="percent-suffix">%</span>
            </div>
            <span className="sub-caption">Enter percentage as per marksheet</span>
          </div>

          <div className="form-group">
            <label className="form-label">Max Marks</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="500"
              value={c12.maxMarks || '500'}
              onChange={(e) => handleClass12Change('maxMarks', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Obtained Marks</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="462"
              value={c12.obtainedMarks || '462'}
              onChange={(e) => handleClass12Change('obtainedMarks', e.target.value)}
            />
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

        <div className="form-grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Board <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c10.board || 'ICSE'}
              onChange={(e) => handleClass10Change('board', e.target.value)}
              required
            >
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
              placeholder="St. George's High School, Kochi"
              value={c10.schoolName || "St. George's High School, Kochi"}
              onChange={(e) => handleClass10Change('schoolName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Year of Passing <span className="req">*</span></label>
            <select 
              className="form-control"
              value={c10.yearOfPassing || '2022'}
              onChange={(e) => handleClass10Change('yearOfPassing', e.target.value)}
              required
            >
              {['2022', '2021', '2020', '2019'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-3" style={{ marginBottom: '32px' }}>
          <div className="form-group">
            <label className="form-label">Percentage / Marks <span className="req">*</span></label>
            <div className="percentage-input-group">
              <input 
                type="text" 
                className="form-control"
                placeholder="94.20"
                value={c10.percentage || '94.20'}
                onChange={(e) => handleClass10Change('percentage', e.target.value)}
                required
              />
              <span className="percent-suffix">%</span>
            </div>
            <span className="sub-caption">Enter percentage as per marksheet</span>
          </div>

          <div className="form-group">
            <label className="form-label">Max Marks</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="500"
              value={c10.maxMarks || '500'}
              onChange={(e) => handleClass10Change('maxMarks', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Obtained Marks</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="471"
              value={c10.obtainedMarks || '471'}
              onChange={(e) => handleClass10Change('obtainedMarks', e.target.value)}
            />
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
          <div className="added-qual-card-row" key="default-diploma">
            <div className="qual-card-left">
              <div className="card-icon-tile">
                <GraduationCap size={20} />
              </div>
              <div className="qual-card-grid">
                <div>
                  <div className="qual-col-label">Qualification Type</div>
                  <div className="qual-col-val">Diploma</div>
                </div>
                <div>
                  <div className="qual-col-label">Stream / Branch</div>
                  <div className="qual-col-val">Computer Engineering</div>
                </div>
                <div>
                  <div className="qual-col-label">Institute Name</div>
                  <div className="qual-col-val">Govt. Polytechnic College, Kochi</div>
                </div>
                <div>
                  <div className="qual-col-label">Year of Passing</div>
                  <div className="qual-col-val">2021</div>
                </div>
                <div>
                  <div className="qual-col-label">Percentage / Marks</div>
                  <div className="qual-col-val">89.60%</div>
                </div>
              </div>
            </div>

            <div className="qual-card-actions">
              <button 
                type="button" 
                className="icon-action-btn"
                onClick={() => handleEditQual({ id: 'def', type: 'Diploma', stream: 'Computer Engineering', institute: 'Govt. Polytechnic College, Kochi', year: '2021', percentage: '89.60%' })}
              >
                <Edit2 size={15} />
              </button>
              <button type="button" className="icon-action-btn danger">
                <Trash2 size={15} />
              </button>
            </div>
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
                <button type="button" className="icon-action-btn danger" onClick={() => handleRemoveQual(q.id)}>
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
                    placeholder="Computer Engineering"
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
                    placeholder="Govt. Polytechnic College, Kochi"
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
                      {['2024', '2023', '2022', '2021', '2020', '2019'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Percentage / Marks <span className="req">*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="89.60%"
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
    </div>
  );
}
