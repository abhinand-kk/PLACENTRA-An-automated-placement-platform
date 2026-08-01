import React, { useState } from 'react';
import { Briefcase, ArrowRight, ArrowLeft, Plus, Trash2, Info } from 'lucide-react';

export default function Step5Experience({ state, onChange, onNext, onBack }) {
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [expForm, setExpForm] = useState({
    type: 'Internship',
    company: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    location: '',
    summary: '',
    skillsText: ''
  });

  const list = state.experiences;

  const handleAddExpSubmit = (e) => {
    e.preventDefault();
    const skills = expForm.skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const newExp = {
      ...expForm,
      skills,
      id: Date.now().toString()
    };
    onChange('experiences', [...list, newExp]);
    setShowAddExpModal(false);
    setExpForm({
      type: 'Internship',
      company: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      location: '',
      summary: '',
      skillsText: ''
    });
  };

  const handleRemoveExp = (id) => {
    onChange('experiences', list.filter(item => item.id !== id));
  };

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="step-icon-tile">
            <Briefcase size={22} />
          </div>
          <div className="step-header-text">
            <h2>Internships & Work Experience</h2>
            <p>Add details of your internships and any prior work experience.</p>
          </div>
        </div>

        <button 
          className="btn-wizard-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowAddExpModal(true)}
        >
          <Plus size={16} />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="wizard-alert alert-blue">
        <Info size={18} className="flex-shrink-0" />
        <span>Internship experience helps recruiters understand your practical exposure and skills.</span>
      </div>

      {/* Experience Cards */}
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', background: '#F8FAFC', borderRadius: '12px', marginBottom: '24px' }}>
          No work experiences added yet. Click "+ Add Experience" above to add one.
        </div>
      ) : (
        list.map((item) => (
          <div className="experience-card-item" key={item.id}>
            <div className="exp-card-header">
              <div>
                <h3 className="exp-title">{item.company}</h3>
                <div className="exp-company">{item.jobTitle} • <span style={{ color: '#4F46E5' }}>{item.type}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-sm-action" onClick={() => handleRemoveExp(item.id)}>
                  <Trash2 size={14} color="#EF4444" />
                </button>
              </div>
            </div>

            <div className="exp-meta">
              📅 {item.startDate} - {item.isCurrent ? 'Present' : item.endDate} {item.location && `| 📍 ${item.location}`}
            </div>

            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: '8px 0' }}>
              {item.summary}
            </p>

            <div className="exp-skills-wrap">
              {item.skills.map((sk, idx) => (
                <span className="skill-tag" key={idx}>{sk}</span>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Footer Actions */}
      <div className="wizard-footer-actions">
        <button className="btn-wizard-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button className="btn-wizard-primary" onClick={onNext}>
          <span>Save and Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Add Experience Modal */}
      {showAddExpModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>Add Experience</h3>
              <button className="modal-close-btn" onClick={() => setShowAddExpModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddExpSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Experience Type <span className="req">*</span></label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                    {['Internship', 'Full-Time', 'Freelance'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="expType"
                          checked={expForm.type === t}
                          onChange={() => setExpForm({ ...expForm, type: t })}
                          style={{ accentColor: '#4F46E5' }}
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Company Name <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. M2 Squared Software"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Job Title <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Web Developer Intern"
                    value={expForm.jobTitle}
                    onChange={(e) => setExpForm({ ...expForm, jobTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={expForm.startDate}
                      onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={expForm.endDate}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                      disabled={expForm.isCurrent}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Experience Summary</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Describe your key responsibilities and achievements..."
                    value={expForm.summary}
                    onChange={(e) => setExpForm({ ...expForm, summary: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills Used (Comma Separated)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. HTML, CSS, JavaScript, React"
                    value={expForm.skillsText}
                    onChange={(e) => setExpForm({ ...expForm, skillsText: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-wizard-secondary" onClick={() => setShowAddExpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-wizard-primary">
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
