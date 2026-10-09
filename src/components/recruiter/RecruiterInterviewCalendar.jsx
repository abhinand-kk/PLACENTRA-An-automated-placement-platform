import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, Briefcase, Building2, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function RecruiterInterviewCalendar({ onScheduleClick }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day' | 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/interviews/calendar/');
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch interview calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const monthYearHeader = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Format events by date string (YYYY-MM-DD)
  const eventsByDate = {};
  events.forEach(ev => {
    const dStr = ev.date;
    if (!eventsByDate[dStr]) eventsByDate[dStr] = [];
    eventsByDate[dStr].push(ev);
  });

  // Render Month Grid
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding preceding month days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', minHeight: '100px' }}></div>);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dStr = dayDate.toISOString().split('T')[0];
      const dayEvents = eventsByDate[dStr] || [];
      const isToday = dStr === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          style={{
            background: isToday ? '#F0F9FF' : '#FFFFFF',
            border: `1px solid ${isToday ? '#3B82F6' : '#E2E8F0'}`,
            minHeight: '110px',
            padding: '8px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: isToday ? 800 : 600, color: isToday ? '#2563EB' : '#475569' }}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span style={{ fontSize: '11px', background: '#E0E7FF', color: '#3730A3', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                {dayEvents.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '80px' }}>
            {dayEvents.map(ev => {
              const isTech = ev.interview_type?.includes('Technical');
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  style={{
                    background: isTech ? '#DBEAFE' : '#FCE7F3',
                    borderLeft: `3px solid ${isTech ? '#2563EB' : '#DB2777'}`,
                    color: isTech ? '#1E40AF' : '#9D174D',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={`${ev.interview_type}: ${ev.candidate_name} (${ev.time})`}
                >
                  ⏱️ {ev.time} {ev.candidate_name}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ background: '#F1F5F9', padding: '10px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#64748B', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            {monthYearHeader}
          </h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={handlePrev} className="btn-table-action" style={{ padding: '6px 10px' }}><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-table-action" style={{ padding: '6px 12px', fontSize: '12.5px', fontWeight: 600 }}>Today</button>
            <button onClick={handleNext} className="btn-table-action" style={{ padding: '6px 10px' }}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {['month', 'list'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: viewMode === mode ? '#10B981' : '#FFFFFF',
                color: viewMode === mode ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {mode} View
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar View Body */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading interview calendar...</div>
        ) : viewMode === 'month' ? (
          renderMonthView()
        ) : (
          /* List View */
          <div style={{ padding: '16px' }}>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No scheduled interviews found.</div>
            ) : (
              <table className="rec-jobs-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Interview Type</th>
                    <th>Job Position</th>
                    <th>Date & Time</th>
                    <th>Mode</th>
                    <th>Venue / Link</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 700 }}>{ev.candidate_name}</td>
                      <td>
                        <span className={`status-pill ${ev.interview_type?.includes('Technical') ? 'pill-open' : 'pill-ongoing'}`}>
                          {ev.interview_type}
                        </span>
                      </td>
                      <td>{ev.job_title}</td>
                      <td><strong>{ev.date}</strong> at {ev.time} ({ev.duration_minutes}m)</td>
                      <td>{ev.mode}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.location_or_link}
                      </td>
                      <td>
                        <span className="status-pill pill-completed">{ev.status}</span>
                      </td>
                      <td>
                        <button className="btn-action-view" onClick={() => setSelectedEvent(ev)}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="job-modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                {selectedEvent.interview_type} Details
              </h3>
              <button className="btn-close-modal" onClick={() => setSelectedEvent(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="info-item">
                <span className="info-label">Candidate Name</span>
                <span className="info-val" style={{ fontSize: '16px', fontWeight: 700 }}>{selectedEvent.candidate_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Applied Job Position</span>
                <span className="info-val">{selectedEvent.job_title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Company</span>
                <span className="info-val" style={{ color: '#2563EB', fontWeight: 700 }}>{selectedEvent.company_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Interview Type & Mode</span>
                <span className="info-val">{selectedEvent.interview_type} ({selectedEvent.mode})</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date & Time</span>
                <span className="info-val">📅 {selectedEvent.date} • ⏱️ {selectedEvent.time} ({selectedEvent.duration_minutes} Minutes)</span>
              </div>
              <div className="info-item">
                <span className="info-label">Venue / Meeting Link</span>
                <span className="info-val" style={{ wordBreak: 'break-all' }}>{selectedEvent.location_or_link}</span>
              </div>
              {selectedEvent.instructions && (
                <div className="info-item">
                  <span className="info-label">Special Instructions</span>
                  <span className="info-val" style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    {selectedEvent.instructions}
                  </span>
                </div>
              )}
            </div>

            <div className="candidate-modal-footer">
              <button className="btn-modal-cancel" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
