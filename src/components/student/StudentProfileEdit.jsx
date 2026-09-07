import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  GraduationCap, 
  Save, 
  Sparkles,
  ShieldCheck,
  FileText,
  Upload
} from 'lucide-react';
import api from '../../services/api';
import './StudentDashboard.css';

export default function StudentProfileEdit() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    // Basic Details
    firstName: '',
    middleName: '',
    lastName: '',
    registerNumber: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'B+',

    // Contact Details
    primaryEmail: '',
    personalEmail: '',
    mobileNumber: '',
    state: '',
    district: '',
    city: '',
    pincode: '',

    // Academic Details
    fieldOfStudy: '',
    semester: '4',
    batch: '',
    cgpa: '',
    activeBacklogs: '0'
  });

  const [docState, setDocState] = useState({
    profilePhoto: null,
    resume: null,
    class10: null,
    class12: null,
    degree: null
  });
  const [uploadingDoc, setUploadingDoc] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profRes, contactRes, eduRes] = await Promise.allSettled([
          api.get('/api/v1/students/profile/'),
          api.get('/api/v1/students/contact/'),
          api.get('/api/v1/students/current-education/')
        ]);

        const prof = profRes.status === 'fulfilled' ? profRes.value.data : {};
        const contact = contactRes.status === 'fulfilled' ? contactRes.value.data : prof.contact || {};
        const edu = eduRes.status === 'fulfilled' ? eduRes.value.data : prof.current_education || {};
        const docs = prof.documents || {};

        setDocState({
          profilePhoto: prof.profile_photo || null,
          resume: docs.resume || null,
          class10: docs.class10_certificate || null,
          class12: docs.class12_certificate || null,
          degree: docs.degree_marksheet || null
        });

        setFormData({
          firstName: prof.first_name || '',
          middleName: prof.middle_name || '',
          lastName: prof.last_name || '',
          registerNumber: prof.register_number || '',
          dob: prof.date_of_birth || '',
          gender: prof.gender || 'Male',
          bloodGroup: prof.blood_group || 'B+',

          primaryEmail: contact.primary_email || prof.user_email || '',
          personalEmail: contact.personal_email || contact.primary_email || prof.user_email || '',
          mobileNumber: contact.mobile_number || '',
          state: contact.state || '',
          district: contact.district || '',
          city: contact.city || '',
          pincode: contact.pincode || '',

          fieldOfStudy: edu.field_of_study || '',
          semester: edu.semester ? String(edu.semester) : '4',
          batch: edu.batch || '',
          cgpa: edu.cgpa !== undefined && edu.cgpa !== null ? String(edu.cgpa) : '',
          activeBacklogs: edu.active_backlogs !== undefined && edu.active_backlogs !== null ? String(edu.active_backlogs) : '0'
        });
      } catch (err) {
        console.warn("Error fetching profile data for edit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;
    setUploadingDoc(docType);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      formData.append('file', file);

      const res = await api.post('/api/v1/students/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (docType === 'profile_photo') {
        setDocState(prev => ({ ...prev, profilePhoto: res.data.file_url }));
      } else if (docType === 'resume') {
        setDocState(prev => ({ ...prev, resume: res.data.file_url }));
      } else if (docType === 'class10_certificate') {
        setDocState(prev => ({ ...prev, class10: res.data.file_url }));
      } else if (docType === 'class12_certificate') {
        setDocState(prev => ({ ...prev, class12: res.data.file_url }));
      } else if (docType === 'degree_marksheet') {
        setDocState(prev => ({ ...prev, degree: res.data.file_url }));
      }
      setSuccessMsg(`${file.name} uploaded successfully!`);
    } catch (err) {
      console.error("Document upload error:", err);
      setErrorMsg(err?.response?.data?.error || 'Failed to upload document.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const extractErrorMessage = (data) => {
    if (!data) return 'Failed to update profile. Please verify your information.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.error) return data.error;
    if (typeof data === 'object') {
      const messages = [];
      Object.entries(data).forEach(([key, val]) => {
        const fieldName = key.replace('_', ' ').toUpperCase();
        if (Array.isArray(val)) {
          messages.push(`${fieldName}: ${val.join(' ')}`);
        } else if (typeof val === 'string') {
          messages.push(`${fieldName}: ${val}`);
        } else if (typeof val === 'object') {
          messages.push(`${fieldName}: ${JSON.stringify(val)}`);
        }
      });
      if (messages.length > 0) return messages.join(' | ');
    }
    return 'Failed to update profile. Please verify your information.';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      // 1. Basic profile payload
      const profilePayload = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        gender: formData.gender,
        blood_group: formData.bloodGroup
      };
      if (formData.dob) {
        profilePayload.date_of_birth = formData.dob;
      }

      // 2. Contact details payload
      const contactPayload = {
        primary_email: formData.primaryEmail,
        personal_email: formData.personalEmail || formData.primaryEmail,
        mobile_number: formData.mobileNumber,
        state: formData.state || 'Kerala',
        district: formData.district || 'Kottayam',
        city: formData.city || 'Kottayam',
        pincode: formData.pincode || '686518',
        permanent_address: formData.city ? `${formData.city}, ${formData.state}` : 'Main Permanent Address'
      };

      // 3. Current education details payload
      const eduPayload = {
        field_of_study: formData.fieldOfStudy || 'Computer Science & Engineering',
        semester: parseInt(formData.semester) || 4,
        batch: formData.batch || '2024 - 2026',
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : 0.0,
        active_backlogs: parseInt(formData.activeBacklogs) || 0
      };

      // Update backend via API endpoints
      await api.put('/api/v1/students/profile/', profilePayload);
      await api.put('/api/v1/students/contact/', contactPayload);
      await api.put('/api/v1/students/current-education/', eduPayload);

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1200);
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMsg(extractErrorMessage(err?.response?.data));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-center-container">
          <Sparkles size={24} className="spin-gear-icon" color="#6366F1" style={{ marginRight: '10px' }} />
          <span>Loading your profile information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard-layout" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '32px 0' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        
        {/* Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button 
            type="button" 
            className="btn-wizard-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10B981" />
            <span style={{ fontWeight: 800, color: '#0A192F', fontSize: '16px' }}>PLACENTRA Candidate Portal</span>
          </div>
        </div>

        {/* Page Title Card */}
        <div className="dashboard-card-panel" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="stat-icon-wrap stat-icon-purple" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
              <User size={22} color="#4F46E5" />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A192F', margin: 0 }}>Edit Student Profile</h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>Update your candidate information, contact details, and academic metrics.</p>
            </div>
          </div>
        </div>

        {/* Alert Notifications */}
        {successMsg && (
          <div className="wizard-alert alert-green" style={{ marginBottom: '20px', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}>
            <CheckCircle2 size={18} className="flex-shrink-0" color="#10B981" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="wizard-alert alert-amber" style={{ marginBottom: '20px', backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
            <AlertCircle size={18} className="flex-shrink-0" color="#EF4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Edit Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 1: Basic Information */}
          <div className="dashboard-card-panel">
            <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#4F46E5" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Basic Information</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>First Name *</label>
                <input 
                  type="text"
                  required
                  value={formData.firstName} 
                  onChange={(e) => handleChange('firstName', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Middle Name</label>
                <input 
                  type="text"
                  value={formData.middleName} 
                  onChange={(e) => handleChange('middleName', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Last Name *</label>
                <input 
                  type="text"
                  required
                  value={formData.lastName} 
                  onChange={(e) => handleChange('lastName', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Register Number</label>
                <input 
                  type="text"
                  disabled
                  value={formData.registerNumber} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '13.5px', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Date of Birth</label>
                <input 
                  type="date"
                  value={formData.dob} 
                  onChange={(e) => handleChange('dob', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Gender</label>
                <select 
                  value={formData.gender} 
                  onChange={(e) => handleChange('gender', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', background: '#FFFFFF' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Blood Group</label>
                <select 
                  value={formData.bloodGroup} 
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', background: '#FFFFFF' }}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Information */}
          <div className="dashboard-card-panel">
            <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#4F46E5" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Contact Details</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Primary Email *</label>
                <input 
                  type="email"
                  required
                  value={formData.primaryEmail} 
                  onChange={(e) => handleChange('primaryEmail', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Personal Email</label>
                <input 
                  type="email"
                  value={formData.personalEmail} 
                  onChange={(e) => handleChange('personalEmail', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Mobile Phone *</label>
                <input 
                  type="text"
                  required
                  value={formData.mobileNumber} 
                  onChange={(e) => handleChange('mobileNumber', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>State</label>
                <input 
                  type="text"
                  value={formData.state} 
                  onChange={(e) => handleChange('state', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>District</label>
                <input 
                  type="text"
                  value={formData.district} 
                  onChange={(e) => handleChange('district', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>City / Town</label>
                <input 
                  type="text"
                  value={formData.city} 
                  onChange={(e) => handleChange('city', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Pincode</label>
                <input 
                  type="text"
                  value={formData.pincode} 
                  onChange={(e) => handleChange('pincode', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Academic Details */}
          <div className="dashboard-card-panel">
            <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} color="#4F46E5" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Academic Details</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Field of Study / Branch</label>
                <input 
                  type="text"
                  value={formData.fieldOfStudy} 
                  onChange={(e) => handleChange('fieldOfStudy', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Semester</label>
                <select 
                  value={formData.semester} 
                  onChange={(e) => handleChange('semester', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', background: '#FFFFFF' }}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                  <option value="9">Semester 9</option>
                  <option value="10">Semester 10</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Batch / Years</label>
                <input 
                  type="text"
                  placeholder="2024 - 2026"
                  value={formData.batch} 
                  onChange={(e) => handleChange('batch', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Current CGPA (0.00 - 10.00)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa} 
                  onChange={(e) => handleChange('cgpa', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Active Backlogs</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.activeBacklogs} 
                  onChange={(e) => handleChange('activeBacklogs', e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Uploaded Documents & Profile Photo */}
          <div className="review-summary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="review-card-header">
              <div className="review-title-group">
                <FileText size={18} color="#4F46E5" />
                <span className="review-card-title">Manage Profile Photo & Uploaded Documents</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Profile Photo */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0A192F', marginBottom: '4px' }}>Profile Photo</label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>JPG, JPEG, or PNG (Max 2 MB)</p>
                {docState.profilePhoto ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <img 
                      src={docState.profilePhoto.startsWith('http://') || docState.profilePhoto.startsWith('https://') ? docState.profilePhoto : (docState.profilePhoto.startsWith('/') ? `http://localhost:8000${docState.profilePhoto}` : `http://localhost:8000/media/${docState.profilePhoto}`)} 
                      alt="Preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <span style={{ fontSize: '12.5px', color: '#10B981', fontWeight: 700 }}>✓ Photo Uploaded</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '10px' }}>No Profile Photo Uploaded</div>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleDocumentUpload('profile_photo', e.target.files?.[0])}
                  disabled={uploadingDoc === 'profile_photo'}
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* Resume */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0A192F', marginBottom: '4px' }}>Resume (PDF)</label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>PDF file only (Max 5 MB)</p>
                {docState.resume ? (
                  <div style={{ marginBottom: '10px' }}>
                    <a href={docState.resume.startsWith('http') || docState.resume.startsWith('/') ? docState.resume : `/media/${docState.resume}`} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                      📄 View Current Resume
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '10px' }}>Not Uploaded</div>
                )}
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => handleDocumentUpload('resume', e.target.files?.[0])}
                  disabled={uploadingDoc === 'resume'}
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* Class 10 Certificate */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0A192F', marginBottom: '4px' }}>Class X Certificate</label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>PDF, JPG, PNG (Max 5 MB)</p>
                {docState.class10 ? (
                  <div style={{ marginBottom: '10px' }}>
                    <a href={docState.class10.startsWith('http') || docState.class10.startsWith('/') ? docState.class10 : `/media/${docState.class10}`} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                      📄 View Class X Certificate
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '10px' }}>Not Uploaded</div>
                )}
                <input 
                  type="file" 
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleDocumentUpload('class10_certificate', e.target.files?.[0])}
                  disabled={uploadingDoc === 'class10_certificate'}
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* Class 12 Certificate */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0A192F', marginBottom: '4px' }}>Class XII Certificate</label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>PDF, JPG, PNG (Max 5 MB)</p>
                {docState.class12 ? (
                  <div style={{ marginBottom: '10px' }}>
                    <a href={docState.class12.startsWith('http') || docState.class12.startsWith('/') ? docState.class12 : `/media/${docState.class12}`} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                      📄 View Class XII Certificate
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '10px' }}>Not Uploaded</div>
                )}
                <input 
                  type="file" 
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleDocumentUpload('class12_certificate', e.target.files?.[0])}
                  disabled={uploadingDoc === 'class12_certificate'}
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* Degree Marksheet */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0A192F', marginBottom: '4px' }}>Degree Marksheet</label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>PDF, JPG, PNG (Max 5 MB)</p>
                {docState.degree ? (
                  <div style={{ marginBottom: '10px' }}>
                    <a href={docState.degree.startsWith('http') || docState.degree.startsWith('/') ? docState.degree : `/media/${docState.degree}`} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                      📄 View Degree Marksheet
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '10px' }}>Not Uploaded</div>
                )}
                <input 
                  type="file" 
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleDocumentUpload('degree_marksheet', e.target.files?.[0])}
                  disabled={uploadingDoc === 'degree_marksheet'}
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Form Submit Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              className="btn-wizard-secondary"
              style={{ padding: '10px 20px', borderRadius: '8px' }}
              onClick={() => navigate('/student/dashboard')}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="btn-wizard-primary"
              disabled={saving}
              style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
