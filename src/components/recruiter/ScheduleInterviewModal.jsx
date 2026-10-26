import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import DatePicker from '../common/DatePicker';

export default function ScheduleInterviewModal({ application, onClose, onSuccess, onDuplicate }) {
  const candidateName = application?.student_name || `${application?.student_detail?.first_name || ''} ${application?.student_detail?.last_name || ''}`.trim() || 'Candidate';
  const jobTitle = application?.job_title || application?.job_detail?.job_title || 'Position';
  const companyName = application?.job_detail?.recruiter_detail?.company_name || 'Company';

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    interview_type: 'Technical Interview',
    interview_date: '',
    interview_time: '10:00',
    duration_minutes: 30,
    mode: 'Online',
    location_or_link: '',
    instructions: ''
  });

  const [existingInterviews, setExistingInterviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    const fetchExistingInterviews = async () => {
      const appId = application?.id || application?.pk;
      if (!appId) return;
      try {
        const res = await api.get(`/api/v1/interviews/?application=${appId}`);
        const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        setExistingInterviews(list);

        const activeTypes = list
          .filter(i => ['Scheduled', 'Rescheduled'].includes(i.status))
          .map(i => i.interview_type);

        if (activeTypes.includes('Technical Interview') && !activeTypes.includes('HR Interview')) {
          setFormData(prev => ({ ...prev, interview_type: 'HR Interview' }));
        }
      } catch (e) {
        console.error("Failed to fetch existing interviews:", e);
      }
    };
    fetchExistingInterviews();
  }, [application]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.interview_date) {
      setErrorMsg("Please select an interview date.");
      return;
    }

    if (!formData.location_or_link || !formData.location_or_link.trim()) {
      const fieldLbl = formData.mode === 'Online' ? 'Meeting Link URL' : formData.mode === 'Offline' ? 'Venue Address' : 'Venue / Meeting Link';
      setErrorMsg(`Please enter the ${fieldLbl}.`);
      return;
    }

    setSubmitting(true);

    try {
      const appId = application?.id || application?.pk;
      if (!appId) {
        setErrorMsg("Application ID missing. Cannot schedule interview.");
        setSubmitting(false);
        return;
      }

      let formattedDate = formData.interview_date ? formData.interview_date.trim() : '';
      if (formattedDate.includes('-') || formattedDate.includes('/')) {
        const parts = formattedDate.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else if (parts[0].length === 4) {
            formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
        }
      }

      const payload = {
        application: appId,
        interview_type: formData.interview_type,
        interview_date: formattedDate,
        interview_time: formData.interview_time,
        duration_minutes: parseInt(formData.duration_minutes, 10) || 30,
        mode: formData.mode,
        location_or_link: formData.location_or_link,
        instructions: formData.instructions
      };

      const res = await api.post('/api/v1/interviews/', payload);
      
      const roundName = formData.interview_type || 'Interview';
      const emailSent = res.data?.email_sent;
      const successMessageText = emailSent 
        ? `${roundName} scheduled successfully and invitation sent to the candidate.`
        : `${roundName} scheduled, but the invitation email could not be sent.`;
        
      setSuccessMsg(successMessageText);
      
      setTimeout(() => {
        if (onSuccess) onSuccess({ data: res.data, message: successMessageText, emailSent });
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Schedule interview error:", err);
      const errData = err.response?.data;
      let rawErrorText = '';

      if (errData) {
        if (typeof errData === 'string') {
          rawErrorText = errData;
        } else if (errData.errors && typeof errData.errors === 'object') {
          const fieldMsgs = Object.entries(errData.errors).map(([k, v]) => {
            return Array.isArray(v) ? v.join(' ') : (typeof v === 'object' ? JSON.stringify(v) : String(v));
          });
          rawErrorText = fieldMsgs.join(' | ') || errData.message || '';
        } else if (typeof errData === 'object') {
          const messages = Object.entries(errData).map(([key, val]) => {
            const formattedVal = Array.isArray(val) ? val.join(' ') : (typeof val === 'object' ? JSON.stringify(val) : String(val));
            return key === 'non_field_errors' || key === 'detail' || key === 'error' ? formattedVal : `${key}: ${formattedVal}`;
          });
          rawErrorText = messages.join(' | ');
        }
      }

      const lowerText = (rawErrorText || '').toLowerCase();
      const isDuplicate = lowerText.includes('already scheduled') || lowerText.includes('duplicate') || lowerText.includes('active interview');

      if (isDuplicate) {
        const roundName = formData.interview_type || 'Interview';
        const duplicateMsg = `An active ${roundName} is scheduled for this candidate. Please use Reschedule to update the existing interview.`;
        if (onDuplicate) {
          onDuplicate(duplicateMsg);
        } else if (onClose) {
          onClose(duplicateMsg);
        }
        return;
      }

      setErrorMsg(rawErrorText || err.message || "Failed to schedule interview. Please check form inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="job-modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={22} color="#10B981" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              Schedule Candidate Interview
            </h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {successMsg && (
          <div className="modal-success-banner" style={{ background: '#DCFCE7', color: '#15803D', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="modal-error-banner" style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="job-form">
          {/* Read-Only Candidate Details */}
          <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '12px', fontWeight: 600 }}>CANDIDATE</span>
                <strong style={{ color: '#0F172A' }}>{candidateName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '12px', fontWeight: 600 }}>POSITION</span>
                <strong style={{ color: '#0F172A' }}>{jobTitle}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '12px', fontWeight: 600 }}>COMPANY</span>
                <strong style={{ color: '#2563EB' }}>{companyName}</strong>
              </div>
            </div>
          </div>

          {/* Interview Type Choice */}
          <div className="form-group">
            <label>Interview Type *</label>
            <select
              value={formData.interview_type}
              onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
              required
            >
              <option value="Technical Interview">Technical Interview</option>
              <option value="HR Interview">HR Interview</option>
            </select>
          </div>

          {existingInterviews.some(i => i.interview_type === formData.interview_type && ['Scheduled', 'Rescheduled'].includes(i.status)) && (
            <div style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '14px', border: '1px solid #BFDBFE' }}>
              <strong>Notice:</strong> An active <strong>{formData.interview_type}</strong> is already scheduled for this candidate. Select another round (e.g. HR Interview) or reschedule from the Recruiter Calendar.
            </div>
          )}

          {/* Date & Time Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label>Date *</label>
              <DatePicker
                minDate={todayStr}
                required
                value={formData.interview_date || ''}
                onChange={(val) => setFormData({ ...formData, interview_date: val })}
                placeholder="dd-mm-yyyy"
                ariaLabel="Interview Date"
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                required
                value={formData.interview_time}
                onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
              />
            </div>
          </div>

          {/* Duration & Mode Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mode *</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                required
              >
                <option value="Online">Online (Video Call / Meeting Link)</option>
                <option value="Offline">Offline (In-Person / Venue)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Location or Meeting Link */}
          <div className="form-group">
            <label>
              {formData.mode === 'Online' ? 'Meeting Link URL *' : formData.mode === 'Offline' ? 'Venue Address *' : 'Venue / Meeting Link *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                formData.mode === 'Online'
                  ? 'e.g. https://meet.google.com/abc-defg-hij or Zoom Link'
                  : 'e.g. Conference Hall A, Main Campus / Company HQ'
              }
              value={formData.location_or_link}
              onChange={(e) => setFormData({ ...formData, location_or_link: e.target.value })}
            />
          </div>

          {/* Special Instructions */}
          <div className="form-group">
            <label>Instructions / Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Please bring original degree certificates and ID proof, or test webcam/microphone beforehand."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          {/* Action Buttons */}
          <div className="candidate-modal-footer" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-action-shortlist"
              style={{ padding: '10px 20px', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              disabled={submitting}
            >
              {submitting ? 'Scheduling...' : 'Confirm Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
