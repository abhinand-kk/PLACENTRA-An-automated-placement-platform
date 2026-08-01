import React from 'react';
import { FileText, ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Step6Documents({ state, onChange, onNext, onBack }) {
  const docs = state.documents;

  const handleDocumentUpdate = (docKey, status) => {
    onChange('documents', {
      ...docs,
      [docKey]: { ...docs[docKey], status }
    });
  };

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <FileText size={22} />
        </div>
        <div className="step-header-text">
          <h2>Documents</h2>
          <p>Upload your important documents. Some documents cannot be edited after submission.</p>
        </div>
      </div>

      {/* Alert Warning */}
      <div className="wizard-alert alert-amber">
        <AlertTriangle size={18} className="flex-shrink-0" />
        <div>
          Please make sure all documents are correct and clearly visible before saving. Documents uploaded in this section cannot be edited after clicking <strong>"Save and Proceed"</strong>.
        </div>
      </div>

      {/* Document Row 1: Profile Photo */}
      <div className="document-upload-row">
        <div className="doc-info">
          <div className="doc-icon-tile">
            <FileText size={20} />
          </div>
          <div>
            <div className="doc-name">Profile Photo</div>
            <div className="doc-sub">JPG/PNG • Max 2MB ({docs.profilePhoto.name})</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge-verified">Uploaded ✓</span>
          <button className="btn-sm-action" onClick={() => handleDocumentUpdate('profilePhoto', 'Uploaded')}>
            Replace / Update
          </button>
        </div>
      </div>

      {/* Document Row 2: Resume */}
      <div className="document-upload-row">
        <div className="doc-info">
          <div className="doc-icon-tile">
            <FileText size={20} />
          </div>
          <div>
            <div className="doc-name">Resume</div>
            <div className="doc-sub">PDF • Max 5MB ({docs.resume.name})</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge-verified">Uploaded ✓</span>
          <button className="btn-sm-action" onClick={() => handleDocumentUpdate('resume', 'Uploaded')}>
            Replace / Update
          </button>
        </div>
      </div>

      {/* Document Row 3: Class X Certificate */}
      <div className="document-upload-row">
        <div className="doc-info">
          <div className="doc-icon-tile">
            <FileText size={20} />
          </div>
          <div>
            <div className="doc-name">Class X Certificate</div>
            <div className="doc-sub">PDF • Max 5MB ({docs.class10Cert.name})</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge-verified">Uploaded ✓</span>
          <button className="btn-sm-action" onClick={() => handleDocumentUpdate('class10Cert', 'Uploaded')}>
            Replace / Update
          </button>
        </div>
      </div>

      {/* Document Row 4: Class XII Certificate */}
      <div className="document-upload-row">
        <div className="doc-info">
          <div className="doc-icon-tile">
            <FileText size={20} />
          </div>
          <div>
            <div className="doc-name">Class XII Certificate</div>
            <div className="doc-sub">PDF • Max 5MB ({docs.class12Cert.name})</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge-verified">Uploaded ✓</span>
          <button className="btn-sm-action" onClick={() => handleDocumentUpdate('class12Cert', 'Uploaded')}>
            Replace / Update
          </button>
        </div>
      </div>

      {/* Document Row 5: Degree Marksheet (DigiLocker) */}
      <div className="document-upload-row">
        <div className="doc-info">
          <div className="doc-icon-tile" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="doc-name">Degree Marksheet (DigiLocker)</div>
            <div className="doc-sub">Fetch from DigiLocker</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge-verified">Fetched ✓</span>
          <button className="btn-sm-action" onClick={() => handleDocumentUpdate('degreeMarksheet', 'Fetched')}>
            Re-fetch
          </button>
        </div>
      </div>

      <p style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic', marginTop: '12px' }}>
        * Documents once saved and verified cannot be changed later.
      </p>

      {/* Footer Actions */}
      <div className="wizard-footer-actions">
        <button className="btn-wizard-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
        <button className="btn-wizard-primary" onClick={onNext}>
          <span>Save and Proceed</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
