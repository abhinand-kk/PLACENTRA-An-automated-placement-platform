import React, { useState } from 'react';
import { FileText, ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle, ShieldCheck, Lock, Trash2, Camera, Info, RefreshCw } from 'lucide-react';

export default function Step6Documents({ state, onChange, onNext, onBack }) {
  const docs = state.documents || {};

  const handleMockUpload = (docKey, defaultName, defaultSize) => {
    onChange('documents', {
      ...docs,
      [docKey]: {
        name: defaultName,
        size: defaultSize,
        uploadedDate: '25 May 2026',
        status: 'Uploaded',
        verified: true
      }
    });
  };

  const handleMockRemove = (docKey) => {
    onChange('documents', {
      ...docs,
      [docKey]: {
        name: '',
        size: '',
        uploadedDate: '',
        status: 'Pending',
        verified: false
      }
    });
  };

  const photo = docs.profilePhoto || { name: 'Profile-Photo.jpg', size: '215 KB', uploadedDate: '25 May 2026', status: 'Uploaded', verified: true };
  const resume = docs.resume || { name: 'Resume.pdf', size: '512 KB', uploadedDate: '25 May 2026', status: 'Uploaded', verified: true };
  const class10 = docs.class10Cert || { name: 'Class-X-Certificate.pdf', size: '348 KB', uploadedDate: '24 May 2026', status: 'Uploaded', verified: true };
  const class12 = docs.class12Cert || { name: 'Class-XII-Certificate.pdf', size: '412 KB', uploadedDate: '24 May 2026', status: 'Uploaded', verified: true };
  const degree = docs.degreeMarksheet || { name: 'Degree Marksheet', size: 'DigiLocker', uploadedDate: '25 May 2026', status: 'Fetched', verified: true, studentName: 'Abhinand K K' };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
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

      {/* Yellow Warning Banner */}
      <div className="wizard-alert alert-amber" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>Please make sure all documents are correct and clearly visible before saving.</span>
        </div>
        <div style={{ fontWeight: 700, marginLeft: '26px' }}>
          Documents uploaded in this section cannot be edited after clicking 'Save and Proceed'.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* CARD 1: Profile Photo */}
        <div className="doc-card-container">
          <div className="doc-card-main">
            <div className="photo-avatar-box">
              <div className="avatar-icon-wrap">
                <span className="avatar-silhouette">👤</span>
                <Camera size={14} className="camera-badge" />
              </div>
            </div>

            <div className="doc-info-col">
              <div className="doc-title-row">
                <span className="doc-title-text">Profile Photo <span className="req">*</span></span>
                <span className="badge-editable-anytime">Editable anytime</span>
              </div>
              <p className="doc-sub-text">Upload a clear, recent profile photo.</p>
              <div style={{ marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleMockUpload('profilePhoto', 'Profile-Photo.jpg', '215 KB')}
                >
                  <Upload size={14} />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Photo Guidelines Box (Right Side) */}
            <div className="photo-guidelines-box">
              <div className="guidelines-title">Photo Guidelines</div>
              <ul className="guidelines-list">
                <li><CheckCircle2 size={13} color="#10B981" /> Use a clear, front-facing photo</li>
                <li><CheckCircle2 size={13} color="#10B981" /> Ensure good lighting and neutral background</li>
                <li><CheckCircle2 size={13} color="#10B981" /> Avoid sunglasses, filters or group photos</li>
                <li><CheckCircle2 size={13} color="#10B981" /> JPG, PNG format only (Max size: 2 MB)</li>
                <li><CheckCircle2 size={13} color="#10B981" /> Recommended size: 400x400 px</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CARD 2: Resume */}
        <div className="doc-card-container">
          <div className="doc-card-main">
            <div className="doc-file-type-icon pdf-purple">
              <span>PDF</span>
            </div>

            <div className="doc-info-col">
              <div className="doc-title-row">
                <span className="doc-title-text">Resume</span>
                <span className="badge-editable-anytime">Editable anytime</span>
              </div>
              <p className="doc-sub-text">Upload your latest resume. You can update this anytime after sign up.</p>
              <div className="doc-file-meta">
                Uploaded on {resume.uploadedDate || '25 May 2026'} • {resume.size || '512 KB'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleMockUpload('resume', 'Resume.pdf', '512 KB')}
                >
                  <Upload size={14} />
                  <span>Replace / Update</span>
                </button>
                <button 
                  type="button" 
                  className="icon-action-btn danger"
                  onClick={() => handleMockRemove('resume')}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="doc-status-verified">
                <CheckCircle2 size={15} color="#10B981" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="doc-card-footer footer-blue">
            <Info size={14} className="flex-shrink-0" />
            <span>You can replace your resume anytime from your dashboard.</span>
          </div>
        </div>

        {/* CARD 3: Class X Certificate */}
        <div className="doc-card-container">
          <div className="doc-card-main">
            <div className="doc-file-type-icon pdf-green">
              <span>PDF</span>
            </div>

            <div className="doc-info-col">
              <div className="doc-title-row">
                <span className="doc-title-text">Class X Certificate</span>
                <span className="badge-verified-pill">Verified</span>
              </div>
              <p className="doc-sub-text">Upload your Class X (10th) certificate.</p>
              <div className="doc-file-meta">
                Uploaded on {class10.uploadedDate || '24 May 2026'} • {class10.size || '348 KB'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleMockUpload('class10Cert', 'Class-X-Certificate.pdf', '348 KB')}
                >
                  <Upload size={14} />
                  <span>Replace / Update</span>
                </button>
                <button 
                  type="button" 
                  className="icon-action-btn danger"
                  onClick={() => handleMockRemove('class10Cert')}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="doc-status-verified">
                <CheckCircle2 size={15} color="#10B981" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="doc-card-footer footer-blue">
            <Info size={14} className="flex-shrink-0" />
            <span>You can replace your document anytime before final submission.</span>
          </div>
        </div>

        {/* CARD 4: Class XII Certificate */}
        <div className="doc-card-container">
          <div className="doc-card-main">
            <div className="doc-file-type-icon pdf-blue">
              <span>PDF</span>
            </div>

            <div className="doc-info-col">
              <div className="doc-title-row">
                <span className="doc-title-text">Class XII Certificate</span>
                <span className="badge-verified-pill">Verified</span>
              </div>
              <p className="doc-sub-text">Upload your Class XII (12th) certificate.</p>
              <div className="doc-file-meta">
                Uploaded on {class12.uploadedDate || '24 May 2026'} • {class12.size || '412 KB'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleMockUpload('class12Cert', 'Class-XII-Certificate.pdf', '412 KB')}
                >
                  <Upload size={14} />
                  <span>Replace / Update</span>
                </button>
                <button 
                  type="button" 
                  className="icon-action-btn danger"
                  onClick={() => handleMockRemove('class12Cert')}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="doc-status-verified">
                <CheckCircle2 size={15} color="#10B981" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="doc-card-footer footer-blue">
            <Info size={14} className="flex-shrink-0" />
            <span>You can replace your document anytime before final submission.</span>
          </div>
        </div>

        {/* CARD 5: Degree Marksheet (DigiLocker) */}
        <div className="doc-card-container">
          <div className="doc-card-main">
            <div className="doc-file-type-icon digilocker-tile">
              <ShieldCheck size={20} color="#4F46E5" />
              <span className="digilocker-sub-text">DigiLocker</span>
            </div>

            <div className="doc-info-col">
              <div className="doc-title-row">
                <span className="doc-title-text">Degree Marksheet (DigiLocker)</span>
                <span className="badge-locked-after-save">Locked after save</span>
              </div>
              <p className="doc-sub-text">Fetch your degree marksheet directly from DigiLocker.</p>
              <div className="doc-file-meta">
                👤 {degree.studentName || 'Abhinand K K'} • Fetched on {degree.uploadedDate || '25 May 2026'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleMockUpload('degreeMarksheet', 'Degree-Marksheet.pdf', 'DigiLocker')}
                >
                  <RefreshCw size={14} />
                  <span>Re-fetch from DigiLocker</span>
                </button>
              </div>

              <div className="doc-status-verified" style={{ color: '#059669' }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>Fetched Successfully</span>
              </div>
            </div>
          </div>

          <div className="doc-card-footer footer-red">
            <Lock size={14} className="flex-shrink-0" />
            <span>This document is locked after you click 'Save and Proceed'. You won't be able to change it later.</span>
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
