import React, { useState } from 'react';
import { Briefcase, ArrowRight, ArrowLeft, Plus, Edit2, Trash2, Info, Calendar, MapPin, Code2, CheckCircle2, X, Check } from 'lucide-react';

export default function Step5Experience({ state, onChange, onNext, onBack }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedSummaryExp, setSelectedSummaryExp] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [companySearch, setCompanySearch] = useState('M Squared Software and Services Pvt Ltd');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const [form, setForm] = useState({
    type: 'Internship',
    company: 'M Squared Software and Services Pvt Ltd',
    jobTitle: 'Web Developer Intern',
    location: 'Trivandrum, Kerala',
    startDate: '2026-06-18',
    endDate: '2026-07-27',
    isCurrent: false,
    description: 'Worked on developing responsive web applications using HTML, CSS, JavaScript and Django.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Django', 'Git', 'REST API']
  });

  const list = state.experiences || [];

  const companySuggestions = [
    'M Squared Software and Services Pvt Ltd',
    'M Square Media',
    'M Square Systems',
    'M Squared Tech Solutions',
    'M Square Digital',
    'M Squared Innovations',
    'M Square Pvt Ltd',
    'M Square Infotech',
    'TCS - Tata Consultancy Services',
    'Infosys Limited',
    'Accenture India',
    'Wipro Technologies',
    'Deloitte USI',
    'IBM India',
    'Cognizant Technology Solutions'
  ];

  const filteredCompanies = companySuggestions.filter(c =>
    c.toLowerCase().includes((companySearch || '').toLowerCase())
  );

  const availableSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Django', 'Git', 'REST API', 'Python', 'SQL', 'UI/UX'];

  const handleOpenAddModal = () => {
    setEditingId(null);
    setCompanySearch('M Squared Software and Services Pvt Ltd');
    setForm({
      type: 'Internship',
      company: 'M Squared Software and Services Pvt Ltd',
      jobTitle: 'Web Developer Intern',
      location: 'Trivandrum, Kerala',
      startDate: '2026-06-18',
      endDate: '2026-07-27',
      isCurrent: false,
      description: 'Worked on developing responsive web applications using HTML, CSS, JavaScript and Django.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Django', 'Git', 'REST API']
    });
    setShowAddModal(true);
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setCompanySearch(exp.company);
    setForm({
      type: exp.type || 'Internship',
      company: exp.company || '',
      jobTitle: exp.jobTitle || '',
      location: exp.location || '',
      startDate: exp.startDate || '2026-06-18',
      endDate: exp.endDate || '2026-07-27',
      isCurrent: Boolean(exp.isCurrent),
      description: exp.description || exp.summary || '',
      skills: exp.skills || ['HTML', 'CSS', 'JavaScript', 'Django', 'Git', 'REST API']
    });
    setShowAddModal(true);
  };

  const handleRemove = (id) => {
    onChange('experiences', list.filter(item => item.id !== id));
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddSkill = (skillToAdd) => {
    if (skillToAdd && !form.skills.includes(skillToAdd)) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, skillToAdd]
      }));
    }
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    let updatedList;
    if (editingId) {
      updatedList = list.map(item => item.id === editingId ? { ...form, id: editingId } : item);
    } else {
      const newExp = { ...form, id: Date.now().toString() };
      updatedList = [...list, newExp];
      setSelectedSummaryExp(newExp);
    }
    onChange('experiences', updatedList);
    setShowAddModal(false);
    setShowSummaryModal(true);
  };

  const displayList = list.length === 0 ? [
    {
      id: 'default-1',
      company: 'M Squared Software and Services Pvt Ltd',
      jobTitle: 'Web Developer Intern',
      type: 'Internship',
      startDate: '2026-06-18',
      endDate: '2026-07-27',
      isCurrent: false,
      location: 'Trivandrum, Kerala',
      domain: 'Computer Science - Software - IT',
      description: 'Worked on developing responsive web applications using HTML, CSS, JavaScript and Django.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Django', 'Git', 'REST API']
    }
  ] : list;

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="step-icon-tile">
            <Briefcase size={22} />
          </div>
          <div className="step-header-text">
            <h2>Internships & Work Experience</h2>
            <p>Add details of your internships and any prior work experience.</p>
          </div>
        </div>

        <button 
          type="button"
          className="btn-card-action"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={handleOpenAddModal}
        >
          <Plus size={16} />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Blue Info Alert Banner */}
      <div className="wizard-alert alert-blue" style={{ marginBottom: '24px' }}>
        <Info size={18} className="flex-shrink-0" />
        <span>Internship experience helps recruiters understand your practical exposure and skills.</span>
      </div>

      {/* Section Title */}
      <h3 className="wizard-section-title">Your Experiences</h3>

      {/* Experience Cards Stack */}
      {displayList.map((item) => (
        <div className="experience-summary-card" key={item.id}>
          <div className="exp-card-main-header">
            {/* Company Logo Tile */}
            <div className="company-logo-badge">
              <span>M²</span>
            </div>

            {/* Title & Metadata */}
            <div className="exp-card-title-wrap">
              <div className="company-name-row">
                <span className="company-name-text">{item.company}</span>
              </div>
              <div className="job-title-row">
                <span className="job-title-text">{item.jobTitle}</span>
                <span className="internship-badge">{item.type || 'Internship'}</span>
              </div>
              <div className="exp-meta-row">
                <span>📅 Jun 2026 - Jul 2026 (2 Months)</span>
                <span className="meta-sep">|</span>
                <span>📍 {item.location || 'Trivandrum, Kerala'}</span>
                <span className="meta-sep">|</span>
                <span>👨‍💻 {item.domain || 'Computer Science - Software - IT'}</span>
              </div>
            </div>

            {/* Action Icons */}
            <div className="exp-card-actions">
              <button type="button" className="icon-action-btn" onClick={() => handleEdit(item)}>
                <Edit2 size={15} />
              </button>
              <button type="button" className="icon-action-btn danger" onClick={() => handleRemove(item.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <p className="exp-description-text">
            {item.description || item.summary}
          </p>

          <div className="exp-skills-row">
            <span className="skills-label">Skills:</span>
            <div className="skills-tags-wrap">
              {(item.skills || ['HTML', 'CSS', 'JavaScript', 'Django', 'Git', 'REST API']).map((sk, idx) => (
                <span key={idx} className="skill-pill-tag">{sk}</span>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State Banner */}
      <div className="empty-experience-box">
        <div className="empty-box-icon">
          <Briefcase size={22} color="#4F46E5" />
        </div>
        <div className="empty-box-title">Add more experiences to make your profile stronger.</div>
        <div className="empty-box-sub">Add internships, part-time jobs, freelance work or any relevant experience.</div>
      </div>

      {/* Footer Actions */}
      <div className="wizard-footer-actions">
        <button type="button" className="btn-wizard-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button 
          type="button" 
          className="btn-wizard-primary"
          onClick={onNext}
        >
          <span>Save and Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Popup 1: Add New Experience Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card add-experience-modal-card">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Experience' : 'Add New Experience'}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Experience Type <span className="req">*</span></label>
                  <select 
                    className="form-control"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px', position: 'relative' }}>
                  <label className="form-label">Company Name <span className="req">*</span></label>
                  <div className="input-with-icon">
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Start typing company name..."
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        setForm({ ...form, company: e.target.value });
                        setShowCompanyDropdown(true);
                      }}
                      onFocus={() => setShowCompanyDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                      required
                    />
                    {companySearch && (
                      <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
                    )}
                  </div>

                  {showCompanyDropdown && (
                    <div className="searchable-dropdown-list">
                      {filteredCompanies.map((c, idx) => (
                        <div 
                          key={idx} 
                          className={`dropdown-item ${companySearch === c ? 'selected' : ''}`}
                          onMouseDown={() => {
                            setCompanySearch(c);
                            setForm({ ...form, company: c });
                            setShowCompanyDropdown(false);
                          }}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Job Title <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Web Developer Intern"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Location <span className="req">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Trivandrum, Kerala"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date <span className="req">*</span></label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date <span className="req">*</span></label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      disabled={form.isCurrent}
                      required={!form.isCurrent}
                    />
                  </div>
                </div>

                <div className="same-address-checkbox-row" style={{ marginTop: '0', marginBottom: '14px' }}>
                  <input 
                    type="checkbox" 
                    id="currentWorkCheck"
                    checked={form.isCurrent}
                    onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                  />
                  <label htmlFor="currentWorkCheck">I currently work here</label>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Job Description / Responsibilities <span className="req">*</span></label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Worked on developing responsive web applications using HTML, CSS, JavaScript and Django."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    maxLength="500"
                    required
                  />
                  <span className="char-count-text">
                    {(form.description || '').length}/500
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills Used</label>
                  <div className="subject-tags-container">
                    {form.skills.map((sk, idx) => (
                      <span key={idx} className="subject-tag-pill">
                        <span>{sk}</span>
                        <button 
                          type="button" 
                          className="tag-remove-btn"
                          onClick={() => handleRemoveSkill(sk)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <select 
                      className="subject-add-select"
                      value=""
                      onChange={(e) => handleAddSkill(e.target.value)}
                    >
                      <option value="">+ Add Skill</option>
                      {availableSkills.filter(s => !form.skills.includes(s)).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-wizard-secondary"
                  onClick={() => setShowAddModal(false)}
                >
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

      {/* Popup 2: Experience Summary (Saved) Modal */}
      {showSummaryModal && selectedSummaryExp && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Experience Summary (Saved)</h3>
              <button className="modal-close-btn" onClick={() => setShowSummaryModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="experience-summary-card" style={{ border: 'none', padding: '0', margin: '0' }}>
                <div className="exp-card-main-header">
                  <div className="company-logo-badge">
                    <span>M²</span>
                  </div>
                  <div className="exp-card-title-wrap">
                    <div className="company-name-row">
                      <span className="company-name-text">{selectedSummaryExp.company}</span>
                    </div>
                    <div className="job-title-row">
                      <span className="job-title-text">{selectedSummaryExp.jobTitle}</span>
                      <span className="internship-badge">{selectedSummaryExp.type}</span>
                    </div>
                    <div className="exp-meta-row">
                      <span>📅 Jun 2026 - Jul 2026 (2 Months)</span>
                      <span className="meta-sep">|</span>
                      <span>📍 {selectedSummaryExp.location}</span>
                    </div>
                  </div>
                </div>

                <p className="exp-description-text" style={{ marginTop: '14px' }}>
                  {selectedSummaryExp.description}
                </p>

                <div className="exp-skills-row" style={{ marginTop: '14px' }}>
                  <span className="skills-label">Skills:</span>
                  <div className="skills-tags-wrap">
                    {(selectedSummaryExp.skills || []).map((sk, idx) => (
                      <span key={idx} className="skill-pill-tag">{sk}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-wizard-primary"
                onClick={() => setShowSummaryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
