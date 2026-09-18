import React, { useState, useRef } from 'react';
import { FileText, ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle, ShieldCheck, Lock, Trash2, Camera, Info, RefreshCw, Eye } from 'lucide-react';
import api from '../../../services/api';

export default function Step6Documents({ state, onChange, onNext, onBack }) {
  const docs = state.documents || {};
  const basic = state.basicDetails || {};

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [isFetchingDigiLocker, setIsFetchingDigiLocker] = useState(false);

  // Hidden File Input Refs
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const class10InputRef = useRef(null);
  const class12InputRef = useRef(null);
  const degreeInputRef = useRef(null);

  // Initial Document Values
  const photo = docs.profilePhoto || { name: 'Profile-Photo.jpg', size: '215 KB', uploadedDate: '25 May 2026', status: 'Uploaded', verified: true, fileUrl: null, previewUrl: null };
  const resume = docs.resume || { name: 'Resume.pdf', size: '512 KB', uploadedDate: '25 May 2026', status: 'Uploaded', verified: true, fileUrl: null };
  const class10 = docs.class10Cert || { name: 'Class-X-Certificate.pdf', size: '348 KB', uploadedDate: '24 May 2026', status: 'Uploaded', verified: true, fileUrl: null };
  const class12 = docs.class12Cert || { name: 'Class-XII-Certificate.pdf', size: '412 KB', uploadedDate: '24 May 2026', status: 'Uploaded', verified: true, fileUrl: null };
  const degree = docs.degreeMarksheet || { 
    name: 'Degree Marksheet', 
    size: 'DigiLocker', 
    uploadedDate: '25 May 2026', 
    status: 'Fetched', 
    verified: true, 
    studentName: `${basic.firstName || 'Abhinand'} ${basic.lastName || 'K K'}`,
    digilockerId: 'DL-DEG-2026-889412',
    fetchTimestamp: '25 May 2026, 10:30:00',
    fileUrl: null,
    isLocked: false
  };

  // 1. Standard File Upload Handler
  const handleFileUpload = async (e, docKey, backendDocType, maxMb, allowedTypesStr, allowedExts, allowedMimeTypes = [], customTypeMsg = '') => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Client Validation: File extension & MIME type
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const mimeType = (file.type || '').toLowerCase();

    const isExtValid = allowedExts.includes(ext);
    const isMimeValid = !mimeType || allowedMimeTypes.length === 0 || allowedMimeTypes.includes(mimeType);

    if (!isExtValid || !isMimeValid) {
      const typeError = customTypeMsg || `Invalid file format for ${file.name}. Allowed formats: ${allowedTypesStr}`;
      setErrorMsg(typeError);
      e.target.value = '';
      return;
    }

    if (file.size > maxMb * 1024 * 1024) {
      setErrorMsg(`File size must not exceed ${maxMb} MB.`);
      e.target.value = '';
      return;
    }

    setUploadingDoc(docKey);
    const localObjectUrl = URL.createObjectURL(file);
    const formattedSize = file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    try {
      const formData = new FormData();
      formData.append('document_type', backendDocType);
      formData.append('file', file);

      const res = await api.post('/api/v1/students/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resData = res.data;

      onChange('documents', {
        ...docs,
        [docKey]: {
          name: resData.file_name || file.name,
          size: resData.file_size || formattedSize,
          uploadedDate: resData.uploaded_date || nowStr,
          status: 'Uploaded',
          verified: true,
          fileUrl: resData.file_url || localObjectUrl,
          previewUrl: docKey === 'profilePhoto' ? localObjectUrl : null,
          rawFile: file
        }
      });
      setSuccessMsg(`${file.name} uploaded successfully.`);
    } catch (err) {
      console.warn("Backend document upload note:", err?.response?.data || err.message);

      // If backend explicitly rejected the file (e.g. 400 Bad Request), display error and DO NOT save locally
      if (err?.response?.status === 400 || err?.response?.data?.error) {
        const backendErrorStr = err?.response?.data?.error || `Failed to upload ${file.name}.`;
        setErrorMsg(backendErrorStr);
        return;
      }

      onChange('documents', {
        ...docs,
        [docKey]: {
          name: file.name,
          size: formattedSize,
          uploadedDate: nowStr,
          status: 'Uploaded',
          verified: true,
          fileUrl: localObjectUrl,
          previewUrl: docKey === 'profilePhoto' ? localObjectUrl : null,
          rawFile: file
        }
      });
      setSuccessMsg(`${file.name} saved locally for registration.`);
    } finally {
      setUploadingDoc(null);
      e.target.value = '';
    }
  };

  // 2. DigiLocker Marksheet Fetch / Re-fetch Handler
  const handleFetchDigiLocker = async () => {
    if (degree.isLocked) {
      setErrorMsg('This document is locked after saving. Re-fetching is disabled.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsFetchingDigiLocker(true);

    try {
      const res = await api.post('/api/v1/students/digilocker/fetch/', {
        student_name: `${basic.firstName || 'Abhinand'} ${basic.lastName || 'K K'}`,
        register_number: basic.rollNumber || 'AJC25MCA2002'
      });

      const resData = res.data;

      onChange('documents', {
        ...docs,
        degreeMarksheet: {
          name: resData.file_name || 'Degree_Marksheet_DigiLocker.pdf',
          size: resData.file_size || '640 KB',
          uploadedDate: resData.uploaded_date || 'Today',
          status: 'Fetched',
          verified: true,
          studentName: resData.student_name || `${basic.firstName || 'Abhinand'} ${basic.lastName || 'K K'}`,
          digilockerId: resData.digilocker_id,
          fetchTimestamp: resData.fetch_timestamp,
          fileUrl: resData.file_url,
          isLocked: false
        }
      });

      setSuccessMsg(`Degree marksheet re-fetched successfully from DigiLocker! (ID: ${resData.digilocker_id})`);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to authenticate/fetch from DigiLocker. Please try again.';
      setErrorMsg(errMsg);
    } finally {
      setIsFetchingDigiLocker(false);
    }
  };

  // Remove Document Handler
  const handleRemoveDoc = (docKey) => {
    setErrorMsg('');
    setSuccessMsg('');
    onChange('documents', {
      ...docs,
      [docKey]: {
        name: '',
        size: '',
        uploadedDate: '',
        status: 'Pending',
        verified: false,
        fileUrl: null,
        previewUrl: null
      }
    });
  };

  // Download / View Document Handler
  const handleViewOrDownloadDoc = (docObj) => {
    if (docObj?.fileUrl) {
      window.open(docObj.fileUrl, '_blank');
    } else if (docObj?.rawFile) {
      const url = URL.createObjectURL(docObj.rawFile);
      window.open(url, '_blank');
    } else {
      alert(`Viewing document: ${docObj.name || 'Uploaded File'}`);
    }
  };

  // Submit Handler & Lock After Save
  const handleSubmit = (e) => {
    e.preventDefault();

    // Lock DigiLocker Degree Marksheet on Save & Proceed
    onChange('documents', {
      ...docs,
      degreeMarksheet: {
        ...degree,
        isLocked: true
      }
    });

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

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="wizard-alert alert-amber" style={{ color: '#EF4444', backgroundColor: '#FEF2F2', borderColor: '#FECACA', marginBottom: '16px' }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="wizard-alert alert-green" style={{ color: '#047857', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', marginBottom: '16px' }}>
          <CheckCircle2 size={18} className="flex-shrink-0" color="#10B981" />
          <span>{successMsg}</span>
        </div>
      )}

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
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={photoInputRef} 
          accept="image/jpeg,image/jpg,image/png" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFileUpload(e, 'profilePhoto', 'profile_photo', 2, 'JPG, JPEG, PNG', ['.jpg', '.jpeg', '.png'], ['image/jpeg', 'image/png', 'image/jpg'], 'Invalid file type. Profile photo must be a JPG, JPEG, or PNG file.')}
        />
        <input 
          type="file" 
          ref={resumeInputRef} 
          accept="application/pdf,.pdf" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFileUpload(e, 'resume', 'resume', 5, 'PDF', ['.pdf'], ['application/pdf'], 'Invalid file type. Resume must be a PDF file.')}
        />
        <input 
          type="file" 
          ref={class10InputRef} 
          accept="application/pdf,.pdf,image/jpeg,image/jpg,image/png" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFileUpload(e, 'class10Cert', 'class10_certificate', 5, 'PDF, JPG, PNG', ['.pdf', '.jpg', '.jpeg', '.png'], ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'], 'Invalid file type. Please upload a PDF, JPG, JPEG, or PNG file.')}
        />
        <input 
          type="file" 
          ref={class12InputRef} 
          accept="application/pdf,.pdf,image/jpeg,image/jpg,image/png" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFileUpload(e, 'class12Cert', 'class12_certificate', 5, 'PDF, JPG, PNG', ['.pdf', '.jpg', '.jpeg', '.png'], ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'], 'Invalid file type. Please upload a PDF, JPG, JPEG, or PNG file.')}
        />
        <input 
          type="file" 
          ref={degreeInputRef} 
          accept="application/pdf,.pdf,image/jpeg,image/jpg,image/png" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFileUpload(e, 'degreeMarksheet', 'degree_marksheet', 5, 'PDF, JPG, PNG', ['.pdf', '.jpg', '.jpeg', '.png'], ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'], 'Invalid file type. Please upload a PDF, JPG, JPEG, or PNG file.')}
        />

        {/* CARD 1: Profile Photo */}
        <div className="doc-card-container">
          <div className="doc-card-main">
            <div className="photo-avatar-box">
              {photo.previewUrl ? (
                <img 
                  src={photo.previewUrl} 
                  alt="Profile Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                />
              ) : (
                <div className="avatar-icon-wrap">
                  <span className="avatar-silhouette">👤</span>
                  <Camera size={14} className="camera-badge" />
                </div>
              )}
            </div>

            <div className="doc-info-col">
              <div className="doc-title-row">
                <span className="doc-title-text">Profile Photo <span className="req">*</span></span>
                <span className="badge-editable-anytime">Editable anytime</span>
              </div>
              <p className="doc-sub-text">
                {photo.name && photo.status === 'Uploaded' ? `${photo.name} (${photo.size})` : 'Upload a clear, recent profile photo.'}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingDoc === 'profilePhoto'}
                >
                  <Upload size={14} />
                  <span>{uploadingDoc === 'profilePhoto' ? 'Uploading...' : photo.name && photo.status === 'Uploaded' ? 'Replace Photo' : 'Upload Photo'}</span>
                </button>

                {photo.name && photo.status === 'Uploaded' && (
                  <button 
                    type="button" 
                    className="icon-action-btn danger"
                    onClick={() => handleRemoveDoc('profilePhoto')}
                    title="Delete Photo"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
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
              <p className="doc-sub-text">
                {resume.name && resume.status === 'Uploaded' ? resume.name : 'Upload your latest resume. You can update this anytime after sign up.'}
              </p>
              <div className="doc-file-meta">
                {resume.status === 'Uploaded' ? `Uploaded on ${resume.uploadedDate || 'Today'} • ${resume.size || '512 KB'}` : 'Max size: 5 MB (PDF only)'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={uploadingDoc === 'resume'}
                >
                  <Upload size={14} />
                  <span>{uploadingDoc === 'resume' ? 'Uploading...' : resume.name && resume.status === 'Uploaded' ? 'Replace / Update' : 'Upload Resume'}</span>
                </button>

                {resume.name && resume.status === 'Uploaded' && (
                  <>
                    <button 
                      type="button" 
                      className="icon-action-btn"
                      onClick={() => handleViewOrDownloadDoc(resume)}
                      title="View / Download Resume"
                    >
                      <Eye size={15} />
                    </button>
                    <button 
                      type="button" 
                      className="icon-action-btn danger"
                      onClick={() => handleRemoveDoc('resume')}
                      title="Delete Resume"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>

              {resume.status === 'Uploaded' && (
                <div className="doc-status-verified">
                  <CheckCircle2 size={15} color="#10B981" />
                  <span>Uploaded</span>
                </div>
              )}
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
                {class10.status === 'Uploaded' && <span className="badge-verified-pill">Uploaded</span>}
              </div>
              <p className="doc-sub-text">
                {class10.name && class10.status === 'Uploaded' ? class10.name : 'Upload your Class X (10th) certificate.'}
              </p>
              <div className="doc-file-meta">
                {class10.status === 'Uploaded' ? `Uploaded on ${class10.uploadedDate || 'Today'} • ${class10.size || '348 KB'}` : 'Max size: 5 MB (PDF, JPG, PNG)'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => class10InputRef.current?.click()}
                  disabled={uploadingDoc === 'class10Cert'}
                >
                  <Upload size={14} />
                  <span>{uploadingDoc === 'class10Cert' ? 'Uploading...' : class10.name && class10.status === 'Uploaded' ? 'Replace / Update' : 'Upload File'}</span>
                </button>

                {class10.name && class10.status === 'Uploaded' && (
                  <>
                    <button 
                      type="button" 
                      className="icon-action-btn"
                      onClick={() => handleViewOrDownloadDoc(class10)}
                      title="View / Download Certificate"
                    >
                      <Eye size={15} />
                    </button>
                    <button 
                      type="button" 
                      className="icon-action-btn danger"
                      onClick={() => handleRemoveDoc('class10Cert')}
                      title="Delete Certificate"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>

              {class10.status === 'Uploaded' && (
                <div className="doc-status-verified">
                  <CheckCircle2 size={15} color="#10B981" />
                  <span>Uploaded</span>
                </div>
              )}
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
                {class12.status === 'Uploaded' && <span className="badge-verified-pill">Uploaded</span>}
              </div>
              <p className="doc-sub-text">
                {class12.name && class12.status === 'Uploaded' ? class12.name : 'Upload your Class XII (12th) certificate.'}
              </p>
              <div className="doc-file-meta">
                {class12.status === 'Uploaded' ? `Uploaded on ${class12.uploadedDate || 'Today'} • ${class12.size || '412 KB'}` : 'Max size: 5 MB (PDF, JPG, PNG)'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => class12InputRef.current?.click()}
                  disabled={uploadingDoc === 'class12Cert'}
                >
                  <Upload size={14} />
                  <span>{uploadingDoc === 'class12Cert' ? 'Uploading...' : class12.name && class12.status === 'Uploaded' ? 'Replace / Update' : 'Upload File'}</span>
                </button>

                {class12.name && class12.status === 'Uploaded' && (
                  <>
                    <button 
                      type="button" 
                      className="icon-action-btn"
                      onClick={() => handleViewOrDownloadDoc(class12)}
                      title="View / Download Certificate"
                    >
                      <Eye size={15} />
                    </button>
                    <button 
                      type="button" 
                      className="icon-action-btn danger"
                      onClick={() => handleRemoveDoc('class12Cert')}
                      title="Delete Certificate"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>

              {class12.status === 'Uploaded' && (
                <div className="doc-status-verified">
                  <CheckCircle2 size={15} color="#10B981" />
                  <span>Uploaded</span>
                </div>
              )}
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
                {degree.isLocked ? (
                  <span className="badge-locked-after-save" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                    Locked after save
                  </span>
                ) : (
                  <span className="badge-locked-after-save">Will lock after save</span>
                )}
              </div>
              <p className="doc-sub-text">
                {degree.name ? `${degree.name} (${degree.digilockerId || 'DigiLocker ID Verified'})` : 'Fetch your degree marksheet directly from DigiLocker.'}
              </p>
              <div className="doc-file-meta">
                👤 {degree.studentName || 'Abhinand K K'} • Fetched on {degree.uploadedDate || '25 May 2026'} • {degree.size || '640 KB'}
              </div>
            </div>

            <div className="doc-actions-col">
              <div className="doc-action-btns">
                <button 
                  type="button" 
                  className="btn-card-action"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={handleFetchDigiLocker}
                  disabled={isFetchingDigiLocker || degree.isLocked}
                >
                  <RefreshCw size={14} className={isFetchingDigiLocker ? 'animate-spin' : ''} />
                  <span>{isFetchingDigiLocker ? 'Fetching...' : degree.isLocked ? 'Document Locked' : 'Re-fetch from DigiLocker'}</span>
                </button>

                {degree.name && (
                  <button 
                    type="button" 
                    className="icon-action-btn"
                    onClick={() => handleViewOrDownloadDoc(degree)}
                    title="View / Download Marksheet"
                  >
                    <Eye size={15} />
                  </button>
                )}
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
