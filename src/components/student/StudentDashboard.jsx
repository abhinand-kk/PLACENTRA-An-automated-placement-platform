import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FileText, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut, 
  GraduationCap, 
  AlertCircle,
  Sparkles,
  X,
  Edit3,
  Edit2,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChangePasswordCard from '../common/ChangePasswordCard';
import StudentResume from './StudentResume';
import ExperienceSkillsSelector from '../common/ExperienceSkillsSelector';
import DatePicker from '../common/DatePicker';
import { getMediaUrl } from '../../services/api';
import './StudentDashboard.css';

export default function StudentDashboard({ initialTab = 'dashboard' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState(initialTab);

  const [selectedDrive, setSelectedDrive] = useState(null);

  // Experience Modal States
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpId, setEditingExpId] = useState(null);
  const [savingExp, setSavingExp] = useState(false);
  const [deletingExpId, setDeletingExpId] = useState(null);
  const [expError, setExpError] = useState('');
  const [expFormData, setExpFormData] = useState({
    company_name: '',
    designation: '',
    employment_type: 'Internship',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    skills: []
  });

  // Filter States for Jobs Page
  const [jobSearch, setJobSearch] = useState('');
  const [jobCompanyFilter, setJobCompanyFilter] = useState('All');
  const [jobLocationFilter, setJobLocationFilter] = useState('All');
  const [jobMinSalaryFilter, setJobMinSalaryFilter] = useState('0');
  const [jobWorkModeFilter, setJobWorkModeFilter] = useState('All');

  // Filter State for Applications Page
  const [appStatusFilter, setAppStatusFilter] = useState('All');

  // Backend Data States
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [_education, setEducation] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [publicJobs, setPublicJobs] = useState([]);
  const [jobTabMode, setJobTabMode] = useState('campus'); // 'campus' | 'reference'

  // Fetch all student data on mount
  useEffect(() => {
    const fetchStudentDashboardData = async () => {
      setLoading(true);
      try {
        const [
          profRes,
          eduRes,
          statsRes,
          jobsRes,
          appsRes,
          drivesRes,
          notifsRes,
          unreadRes,
          interviewsRes,
          publicJobsRes
        ] = await Promise.allSettled([
          api.get('/api/v1/students/profile/'),
          api.get('/api/v1/students/current-education/'),
          api.get('/api/v1/applications/student-dashboard/'),
          api.get('/api/v1/jobs/'),
          api.get('/api/v1/applications/my-applications/'),
          api.get('/api/v1/placement-drives/student/'),
          api.get('/api/v1/notifications/'),
          api.get('/api/v1/notifications/unread-count/'),
          api.get('/api/v1/interviews/my-interviews/'),
          api.get('/api/v1/jobs/public-reference/')
        ]);

        if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
        if (eduRes.status === 'fulfilled') setEducation(eduRes.value.data);
        if (statsRes.status === 'fulfilled') setDashboardStats(statsRes.value.data);
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.results || jobsRes.value.data || []);
        if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.results || appsRes.value.data || []);
        if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data.results || drivesRes.value.data || []);
        if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data.results || notifsRes.value.data || []);
        if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data.unread_count || 0);
        if (interviewsRes.status === 'fulfilled') setScheduledInterviews(interviewsRes.value.data.results || interviewsRes.value.data || []);
        if (publicJobsRes && publicJobsRes.status === 'fulfilled') setPublicJobs(publicJobsRes.value.data.results || publicJobsRes.value.data || []);
      } catch (err) {
        console.warn("Student data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboardData();
  }, []);

  const handleOpenAddExpModal = () => {
    setExpError('');
    setEditingExpId(null);
    setExpFormData({
      company_name: '',
      designation: '',
      employment_type: 'Internship',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      skills: []
    });
    setShowExpModal(true);
  };

  const handleOpenEditExpModal = (exp) => {
    setExpError('');
    setEditingExpId(exp.id);
    const empType = exp.employment_type_detail?.name || (typeof exp.employment_type === 'string' ? exp.employment_type : 'Internship');
    setExpFormData({
      company_name: exp.company_name || '',
      designation: exp.designation || '',
      employment_type: empType,
      location: exp.location || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_current: !exp.end_date,
      description: exp.description || '',
      skills: Array.isArray(exp.skills) ? [...exp.skills] : []
    });
    setShowExpModal(true);
  };

  const handleCloseExpModal = () => {
    setShowExpModal(false);
    setEditingExpId(null);
    setExpError('');
  };

  const handleSaveExp = async (e) => {
    e.preventDefault();
    setExpError('');

    if (!expFormData.company_name.trim()) {
      setExpError('Company Name is required.');
      return;
    }
    if (!expFormData.designation.trim()) {
      setExpError('Job Title / Role is required.');
      return;
    }
    if (!expFormData.start_date) {
      setExpError('Start Date is required.');
      return;
    }
    if (!expFormData.is_current && expFormData.end_date) {
      if (new Date(expFormData.end_date) < new Date(expFormData.start_date)) {
        setExpError('End Date cannot be before Start Date.');
        return;
      }
    }

    setSavingExp(true);
    try {
      const payload = {
        company_name: expFormData.company_name.trim(),
        designation: expFormData.designation.trim(),
        employment_type: expFormData.employment_type,
        location: expFormData.location.trim(),
        start_date: expFormData.start_date,
        end_date: expFormData.is_current ? null : (expFormData.end_date || null),
        description: expFormData.description.trim(),
        skills: expFormData.skills
      };

      if (editingExpId) {
        await api.put(`/api/v1/students/experience/${editingExpId}/`, payload);
      } else {
        await api.post('/api/v1/students/experience/', payload);
      }

      // Refresh profile data
      const profRes = await api.get('/api/v1/students/profile/');
      setProfile(profRes.data);
      setShowExpModal(false);
    } catch (err) {
      console.error("Save experience error:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.detail ||
        (typeof err?.response?.data === 'object' ? Object.values(err.response.data).flat().join(' ') : 'Failed to save experience.');
      setExpError(errMsg);
    } finally {
      setSavingExp(false);
    }
  };

  const handleDeleteExp = async (expId, companyName) => {
    if (!window.confirm(`Are you sure you want to remove your experience at ${companyName || 'this company'}?`)) {
      return;
    }
    setDeletingExpId(expId);
    try {
      await api.delete(`/api/v1/students/experience/${expId}/`);
      const profRes = await api.get('/api/v1/students/profile/');
      setProfile(profRes.data);
    } catch (err) {
      console.error("Delete experience error:", err);
      alert(err?.response?.data?.error || 'Failed to delete experience.');
    } finally {
      setDeletingExpId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper check if student already applied to a job
  const isJobApplied = (jobId) => {
    return applications.some(app => app.job === jobId || app.job?.id === jobId || app.job_detail?.id === jobId);
  };

  // Handler for applying to a job directly
  const handleApplyJob = async (jobId) => {
    try {
      await api.post('/api/v1/applications/', { job: jobId });
      const [appsRes, statsRes] = await Promise.allSettled([
        api.get('/api/v1/applications/my-applications/'),
        api.get('/api/v1/applications/student-dashboard/')
      ]);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.results || appsRes.value.data || []);
      if (statsRes.status === 'fulfilled') setDashboardStats(statsRes.value.data);
    } catch (err) {
      alert(err?.response?.data?.error || err?.response?.data?.detail || "Could not apply for job.");
    }
  };

  // Handler for marking all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch('/api/v1/notifications/read-all/');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.warn("Mark all read error:", err);
    }
  };

  const handleDownloadOfferLetter = async (appId) => {
    try {
      const response = await api.get(`/api/v1/applications/${appId}/offer-letter/`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Failed to download offer letter:", err);
      alert("Offer letter could not be retrieved at this time.");
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-center-container">
          <Sparkles size={24} className="spin-gear-icon" color="#6366F1" style={{ marginRight: '10px' }} />
          <span>Loading your PLACENTRA Student Portal...</span>
        </div>
      </div>
    );
  }

  const completionPct = profile?.profile_completion || 0;
  const studentName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Student';

  // Dynamic Statistic Card Calculations
  const totalJobsApplied = dashboardStats?.total_applications !== undefined
    ? dashboardStats.total_applications
    : applications.length;

  const activeStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled'];
  const activeApplicationsCount = dashboardStats?.active_applications !== undefined
    ? dashboardStats.active_applications
    : applications.filter(a => activeStatuses.includes(a.application_status)).length;

  const todayStr = new Date().toISOString().split('T')[0];

  // Latest 5 recommended jobs for dashboard tab
  const recentJobs = jobs.slice(0, 5);

  // Upcoming campus drives (drive_date >= today) up to 5
  const upcomingDrivesList = drives.filter(d => !d.drive_date || d.drive_date >= todayStr).slice(0, 5);
  const upcomingDrivesCount = drives.filter(d => d.drive_date && d.drive_date >= todayStr).length;

  // Filtered Jobs List for Jobs Tab
  const filteredJobs = jobs.filter(j => {
    if (jobSearch.trim()) {
      const q = jobSearch.toLowerCase();
      const titleMatch = j.job_title?.toLowerCase().includes(q);
      const compMatch = j.recruiter_detail?.company_name?.toLowerCase().includes(q);
      const locMatch = j.location?.toLowerCase().includes(q);
      if (!titleMatch && !compMatch && !locMatch) return false;
    }
    if (jobCompanyFilter !== 'All') {
      if (!j.recruiter_detail?.company_name?.toLowerCase().includes(jobCompanyFilter.toLowerCase())) return false;
    }
    if (jobLocationFilter !== 'All') {
      if (!j.location?.toLowerCase().includes(jobLocationFilter.toLowerCase())) return false;
    }
    if (parseFloat(jobMinSalaryFilter) > 0) {
      if (!j.package_lpa || parseFloat(j.package_lpa) < parseFloat(jobMinSalaryFilter)) return false;
    }
    if (jobWorkModeFilter !== 'All') {
      const modeName = j.work_mode_detail?.name || j.location || '';
      if (!modeName.toLowerCase().includes(jobWorkModeFilter.toLowerCase())) return false;
    }
    return true;
  });

  // Filtered Public Reference Opportunities for Reference Tab
  const filteredPublicJobs = publicJobs.filter(j => {
    if (jobSearch.trim()) {
      const q = jobSearch.toLowerCase();
      const titleMatch = j.job_title?.toLowerCase().includes(q);
      const compMatch = j.company_name?.toLowerCase().includes(q);
      const locMatch = j.location?.toLowerCase().includes(q);
      const indMatch = j.industry?.toLowerCase().includes(q);
      if (!titleMatch && !compMatch && !locMatch && !indMatch) return false;
    }
    return true;
  });

  // Filtered Applications List for Applications Tab
  const filteredApplications = applications.filter(app => {
    if (appStatusFilter !== 'All') {
      return app.application_status?.toLowerCase() === appStatusFilter.toLowerCase();
    }
    return true;
  });

  // Helper status badge class styling
  const getStatusBadgeClass = (statusStr) => {
    switch ((statusStr || '').toLowerCase()) {
      case 'applied': return 'badge-applied';
      case 'under review': return 'badge-tag';
      case 'shortlisted': return 'badge-open';
      case 'interview scheduled': return 'badge-open';
      case 'selected': return 'badge-open';
      case 'rejected': return 'badge-tag';
      default: return 'badge-applied';
    }
  };

  const getPhotoUrl = (photo) => {
    return getMediaUrl(photo) || null;
  };

  return (
    <div className="student-dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="student-sidebar">
        <div>
          <div className="student-sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-box" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/placentra-logo.png" alt="PLACENTRA Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <span className="brand-title">PLACENTRA</span>
          </div>

          <nav className="student-nav-menu">
            <button 
              className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>My Profile</span>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <FileText size={18} />
              <span>My Resume</span>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <Briefcase size={18} />
              <span>Jobs & Opportunities</span>
            </button>


            <button 
              className={`nav-item-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={18} />
              <span>My Applications</span>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'drives' ? 'active' : ''}`}
              onClick={() => setActiveTab('drives')}
            >
              <Calendar size={18} />
              <span>Placement Drives</span>
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </button>

            <button 
              className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-user-footer">
          <button className="btn-sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="student-main-content">
        {/* Top Header */}
        <header className="student-top-header">
          <div className="header-welcome-title">
            <h2>Welcome back, {studentName} 👋</h2>
            <p>Integrated MCA Candidate • {profile?.institution_detail?.institution_name || 'Campus Student'}</p>
          </div>

          <div className="header-user-avatar">
            <div className="avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
              {profile?.profile_photo ? (
                <img 
                  src={getPhotoUrl(profile.profile_photo)} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ) : (
                profile?.first_name ? profile.first_name[0].toUpperCase() : 'S'
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="dashboard-body-container">
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Overview Dashboard Cards */}
              <div className="dashboard-stats-grid">
                {/* CARD 1: Profile Completion */}
                <div className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon-wrap stat-icon-purple">
                      <GraduationCap size={22} />
                    </div>
                    <span className="stat-val">{completionPct}%</span>
                  </div>
                  <span className="stat-lbl">Profile Completion</span>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${completionPct}%` }}></div>
                  </div>
                </div>

                {/* CARD 2: Jobs Applied */}
                <div className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon-wrap stat-icon-green">
                      <Briefcase size={22} />
                    </div>
                    <span className="stat-val">{totalJobsApplied}</span>
                  </div>
                  <span className="stat-lbl">Jobs Applied</span>
                </div>

                {/* CARD 3: Active Applications */}
                <div className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon-wrap stat-icon-amber">
                      <FileText size={22} />
                    </div>
                    <span className="stat-val">{activeApplicationsCount}</span>
                  </div>
                  <span className="stat-lbl">Active Applications</span>
                </div>

                {/* CARD 4: Upcoming Drives */}
                <div className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon-wrap stat-icon-pink">
                      <Calendar size={22} />
                    </div>
                    <span className="stat-val">{upcomingDrivesCount}</span>
                  </div>
                  <span className="stat-lbl">Upcoming Drives</span>
                </div>
              </div>

              {/* 2 Grid Sections: Recent Jobs & Campus Drives */}
              <div className="dashboard-grid-2">
                {/* Recent Job Recommendations */}
                <div className="dashboard-card-panel">
                  <div className="panel-header">
                    <h3>Recent Job Recommendations</h3>
                    <button className="nav-item-btn" style={{ width: 'auto', padding: '4px 8px' }} onClick={() => setActiveTab('jobs')}>
                      View All
                    </button>
                  </div>

                  {recentJobs.length === 0 ? (
                    <div className="empty-state-box">
                      <Briefcase size={28} color="#64748B" />
                      <p>No job postings currently available.</p>
                    </div>
                  ) : (
                    <div className="list-stack">
                      {recentJobs.map((job) => {
                        const applied = isJobApplied(job.id);
                        return (
                          <div key={job.id} className="list-item-card" style={{ gap: '12px' }}>
                            <div className="item-main-info" style={{ flex: 1 }}>
                              <h4>{job.job_title}</h4>
                              <p className="item-sub-info">
                                <strong>{job.recruiter_detail?.company_name || 'Company Name'}</strong> • {job.location || 'Remote'} • {job.package_lpa ? `${job.package_lpa} LPA` : 'Salary Not Disclosed'}
                              </p>
                            </div>
                            {applied ? (
                              <span className="badge-tag badge-applied" style={{ whiteSpace: 'nowrap' }}>✓ Applied</span>
                            ) : (
                              <button 
                                type="button" 
                                className="btn-wizard-primary" 
                                style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '8px', whiteSpace: 'nowrap' }} 
                                onClick={() => handleApplyJob(job.id)}
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upcoming Campus Drives */}
                <div className="dashboard-card-panel">
                  <div className="panel-header">
                    <h3>Upcoming Campus Drives</h3>
                    <button className="nav-item-btn" style={{ width: 'auto', padding: '4px 8px' }} onClick={() => setActiveTab('drives')}>
                      View All
                    </button>
                  </div>

                  {upcomingDrivesList.length === 0 ? (
                    <div className="empty-state-box">
                      <Calendar size={28} color="#64748B" />
                      <p>No upcoming placement drives scheduled.</p>
                    </div>
                  ) : (
                    <div className="list-stack">
                      {upcomingDrivesList.map((drive) => (
                        <div key={drive.id} className="list-item-card" style={{ gap: '12px' }}>
                          <div className="item-main-info" style={{ flex: 1 }}>
                            <h4>{drive.drive_title}</h4>
                            <p className="item-sub-info">
                              <strong>{drive.recruiter_detail?.company_name || 'Partner Company'}</strong> • 📅 {drive.drive_date} • 📍 {drive.venue || 'Main Campus'}
                            </p>
                            <p className="item-sub-info" style={{ marginTop: '2px', fontSize: '12px', color: '#475569' }}>
                              Eligibility: {drive.job_detail?.minimum_cgpa ? `CGPA ≥ ${drive.job_detail.minimum_cgpa}` : 'All MCA / B.Tech Eligible'}
                            </p>
                          </div>
                          <button 
                            type="button" 
                            className="btn-wizard-secondary" 
                            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', whiteSpace: 'nowrap' }} 
                            onClick={() => setSelectedDrive(drive)}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scheduled Candidate Interviews Panel */}
                <div className="dashboard-card-panel" style={{ gridColumn: 'span 2' }}>
                  <div className="panel-header">
                    <h3>My Scheduled Interviews</h3>
                    <span className="badge-tag badge-open" style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                      {scheduledInterviews.length} Scheduled
                    </span>
                  </div>

                  {scheduledInterviews.length === 0 ? (
                    <div className="empty-state-box">
                      <Calendar size={28} color="#64748B" />
                      <p>No interviews scheduled yet. Once you are shortlisted by an employer, your Technical / HR interview schedule will appear here.</p>
                    </div>
                  ) : (
                    <div className="list-stack">
                      {scheduledInterviews.map((item) => (
                        <div key={item.id} className="list-item-card" style={{ gap: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px' }}>
                          <div className="item-main-info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                              <span className={`status-pill ${item.interview_type?.includes('Technical') ? 'pill-open' : 'pill-ongoing'}`} style={{ fontSize: '12px', fontWeight: 700 }}>
                                {item.interview_type}
                              </span>
                              <span className="status-pill pill-completed" style={{ fontSize: '12px' }}>
                                {item.status}
                              </span>
                            </div>
                            <h4 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                              {item.job_title} at <span style={{ color: '#2563EB' }}>{item.company_name}</span>
                            </h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#475569' }}>
                              📅 <strong>{item.interview_date}</strong> at <strong>{item.interview_time}</strong> ({item.duration_minutes} mins) • 📍 Mode: <strong>{item.mode}</strong>
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1E293B', wordBreak: 'break-all' }}>
                              🔗 <strong>Venue / Link:</strong> {item.location_or_link || 'To be shared'}
                            </p>
                            {item.instructions && (
                              <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#64748B', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                💡 <strong>Instructions:</strong> {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="dashboard-card-panel" style={{ gap: '24px' }}>
              {/* Profile Header Banner */}
              <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 800, overflow: 'hidden', flexShrink: 0
                  }}>
                    {profile?.profile_photo ? (
                      <img 
                        src={getPhotoUrl(profile.profile_photo)} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    ) : (
                      (profile?.first_name ? profile.first_name[0].toUpperCase() : 'S')
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0A192F', margin: 0 }}>
                      {profile?.first_name} {profile?.middle_name || ''} {profile?.last_name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Register No: {profile?.register_number || 'N/A'} • {profile?.institution_detail?.institution_name || 'Campus Student'}
                    </p>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-wizard-primary" 
                  style={{ padding: '8px 18px', fontSize: '13.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigate('/student/profile/edit')}
                >
                  <Edit3 size={15} /> Edit Profile
                </button>
              </div>

              {/* Profile Completion Bar */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>
                  <span>Profile Completion Status</span>
                  <span style={{ color: '#10B981' }}>{completionPct}% Completed</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${completionPct}%` }}></div>
                </div>
              </div>

              {/* SECTION 1: Basic Information & Contact Details */}
              <div className="review-cards-grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Basic Details */}
                <div className="review-summary-card">
                  <div className="review-card-header">
                    <div className="review-title-group">
                      <User size={18} color="#4F46E5" />
                      <span className="review-card-title">Basic Information</span>
                    </div>
                  </div>
                  <div className="review-kv-table">
                    <div className="kv-row"><span className="kv-key">Full Name</span><span className="kv-sep">:</span><span className="kv-val">{`${profile?.first_name || ''} ${profile?.middle_name || ''} ${profile?.last_name || ''}`.trim() || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Register Number</span><span className="kv-sep">:</span><span className="kv-val">{profile?.register_number || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Date of Birth</span><span className="kv-sep">:</span><span className="kv-val">{profile?.date_of_birth || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Gender</span><span className="kv-sep">:</span><span className="kv-val">{profile?.gender || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Blood Group</span><span className="kv-sep">:</span><span className="kv-val">{profile?.blood_group || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Contact Verification */}
                <div className="review-summary-card">
                  <div className="review-card-header">
                    <div className="review-title-group">
                      <User size={18} color="#4F46E5" />
                      <span className="review-card-title">Contact Verification</span>
                    </div>
                  </div>
                  <div className="review-kv-table">
                    <div className="kv-row"><span className="kv-key">Primary Email</span><span className="kv-sep">:</span><span className="kv-val">{profile?.contact?.primary_email || profile?.user_email || user?.email}</span></div>
                    <div className="kv-row"><span className="kv-key">Personal Email</span><span className="kv-sep">:</span><span className="kv-val">{profile?.contact?.personal_email || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Mobile Phone</span><span className="kv-sep">:</span><span className="kv-val">{profile?.contact?.mobile_number || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">State & District</span><span className="kv-sep">:</span><span className="kv-val">{profile?.contact?.state ? `${profile.contact.state}, ${profile.contact.district}` : 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">City & Pincode</span><span className="kv-sep">:</span><span className="kv-val">{profile?.contact?.city ? `${profile.contact.city} - ${profile.contact.pincode}` : 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Permanent Address</span><span className="kv-sep">:</span><span className="kv-val">{profile?.contact?.permanent_address || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Academic Details & Previous Education */}
              <div className="review-cards-grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Academic Details */}
                <div className="review-summary-card">
                  <div className="review-card-header">
                    <div className="review-title-group">
                      <GraduationCap size={18} color="#4F46E5" />
                      <span className="review-card-title">Academic & Program Details</span>
                    </div>
                  </div>
                  <div className="review-kv-table">
                    <div className="kv-row"><span className="kv-key">Institution</span><span className="kv-sep">:</span><span className="kv-val">{profile?.institution_detail?.institution_name || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Program / Degree</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.program_detail?.name || 'Integrated MCA'}</span></div>
                    <div className="kv-row"><span className="kv-key">Branch / Specialization</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.branch_detail?.name || profile?.current_education?.field_of_study || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Field of Study</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.field_of_study || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Semester</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.semester ? `Semester ${profile.current_education.semester}` : 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Current CGPA</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.cgpa ? `${profile.current_education.cgpa} / 10.0` : 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Batch</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.batch || 'N/A'}</span></div>
                    <div className="kv-row"><span className="kv-key">Active Backlogs</span><span className="kv-sep">:</span><span className="kv-val">{profile?.current_education?.active_backlogs ?? 0}</span></div>
                  </div>
                </div>

                {/* Previous Education */}
                <div className="review-summary-card">
                  <div className="review-card-header">
                    <div className="review-title-group">
                      <GraduationCap size={18} color="#4F46E5" />
                      <span className="review-card-title">Previous Education</span>
                    </div>
                  </div>
                  <div className="review-kv-table">
                    {profile?.previous_educations && profile.previous_educations.length > 0 ? (
                      profile.previous_educations.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: idx === profile.previous_educations.length - 1 ? 0 : '12px', borderBottom: idx === profile.previous_educations.length - 1 ? 'none' : '1px dashed #E2E8F0', paddingBottom: '8px' }}>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#4F46E5', marginBottom: '4px' }}>
                            {edu.qualification_type_detail?.name || `Qualification #${idx + 1}`}
                          </div>
                          <div className="kv-row"><span className="kv-key">Board / University</span><span className="kv-sep">:</span><span className="kv-val">{edu.board_or_university || 'N/A'}</span></div>
                          <div className="kv-row"><span className="kv-key">School / Institution</span><span className="kv-sep">:</span><span className="kv-val">{edu.institution_name || 'N/A'}</span></div>
                          <div className="kv-row"><span className="kv-key">Passing Year & Score</span><span className="kv-sep">:</span><span className="kv-val">{`${edu.year_of_passing || ''} (${edu.percentage || ''}%)`}</span></div>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '13px' }}>No previous education records added.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Experience & Internships */}
              <div className="review-summary-card">
                <div className="review-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="review-title-group">
                    <Briefcase size={18} color="#4F46E5" />
                    <span className="review-card-title">Experience & Internships</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddExpModal}
                    style={{
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      border: '1px solid #C7D2FE',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={14} /> Add Experience
                  </button>
                </div>
                <div className="review-kv-table">
                  {profile?.experiences && profile.experiences.length > 0 ? (
                    profile.experiences.map((exp, idx) => (
                      <div key={idx} style={{ marginBottom: idx === profile.experiences.length - 1 ? 0 : '16px', borderBottom: idx === profile.experiences.length - 1 ? 'none' : '1px dashed #E2E8F0', paddingBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0A192F' }}>
                            {exp.designation} <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px' }}>{exp.employment_type_detail?.name || (typeof exp.employment_type === 'string' ? exp.employment_type : 'Internship')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditExpModal(exp)}
                              title="Edit Experience"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#4F46E5', borderRadius: '4px' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExp(exp.id, exp.company_name)}
                              disabled={deletingExpId === exp.id}
                              title="Delete Experience"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#EF4444', borderRadius: '4px', opacity: deletingExpId === exp.id ? 0.5 : 1 }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="kv-row"><span className="kv-key">Company</span><span className="kv-sep">:</span><span className="kv-val">{exp.company_name}</span></div>
                        <div className="kv-row"><span className="kv-key">Location</span><span className="kv-sep">:</span><span className="kv-val">{exp.location || 'N/A'}</span></div>
                        <div className="kv-row"><span className="kv-key">Duration</span><span className="kv-sep">:</span><span className="kv-val">{`${exp.start_date || ''} to ${exp.end_date || 'Present'}`}</span></div>
                        {exp.description && (
                          <div className="kv-row"><span className="kv-key">Description</span><span className="kv-sep">:</span><span className="kv-val">{exp.description}</span></div>
                        )}
                        {Array.isArray(exp.skills) && exp.skills.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginRight: '4px' }}>Skills Used:</span>
                            {exp.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="badge-tag badge-open" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px 0', color: '#94A3B8', fontSize: '13px' }}>
                      No internship or work experience recorded. Click <strong>+ Add Experience</strong> above to record your internships and skills.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: Skills & Technical Competencies */}
              {(() => {
                const allStudentSkills = Array.from(new Set(
                  (profile?.experiences || []).flatMap(exp => Array.isArray(exp.skills) ? exp.skills : [])
                ));
                return (
                  <div className="review-summary-card">
                    <div className="review-card-header">
                      <div className="review-title-group">
                        <Sparkles size={18} color="#10B981" />
                        <span className="review-card-title">Skills & Technical Competencies</span>
                      </div>
                    </div>
                    {allStudentSkills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {allStudentSkills.map((skill, idx) => (
                          <span key={idx} className="badge-tag badge-open" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginTop: '12px', color: '#94A3B8', fontSize: '13px' }}>
                        No skills added yet. Add an experience record above with your skills to build your competencies list.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* SECTION 5: Uploaded Documents */}
              <div className="review-summary-card">
                <div className="review-card-header">
                  <div className="review-title-group">
                    <FileText size={18} color="#4F46E5" />
                    <span className="review-card-title">Uploaded Documents</span>
                  </div>
                </div>
                <div className="review-kv-table">
                  <div className="kv-row">
                    <span className="kv-key">Resume</span>
                    <span className="kv-sep">:</span>
                    <span className="kv-val">
                      {profile?.documents?.resume ? (
                        <a href={profile.documents.resume.startsWith('http') || profile.documents.resume.startsWith('/') ? profile.documents.resume : `/media/${profile.documents.resume}`} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                          📄 View / Download Resume
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Not Uploaded</span>
                      )}
                    </span>
                  </div>

                  <div className="kv-row">
                    <span className="kv-key">Class X Certificate</span>
                    <span className="kv-sep">:</span>
                    <span className="kv-val">
                      {profile?.documents?.class10_certificate ? (
                        <a href={profile.documents.class10_certificate.startsWith('http') || profile.documents.class10_certificate.startsWith('/') ? profile.documents.class10_certificate : `/media/${profile.documents.class10_certificate}`} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                          📄 View Class X Certificate
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Not Uploaded</span>
                      )}
                    </span>
                  </div>

                  <div className="kv-row">
                    <span className="kv-key">Class XII Certificate</span>
                    <span className="kv-sep">:</span>
                    <span className="kv-val">
                      {profile?.documents?.class12_certificate ? (
                        <a href={profile.documents.class12_certificate.startsWith('http') || profile.documents.class12_certificate.startsWith('/') ? profile.documents.class12_certificate : `/media/${profile.documents.class12_certificate}`} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                          📄 View Class XII Certificate
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Not Uploaded</span>
                      )}
                    </span>
                  </div>

                  <div className="kv-row">
                    <span className="kv-key">Degree Marksheet</span>
                    <span className="kv-sep">:</span>
                    <span className="kv-val">
                      {profile?.documents?.degree_marksheet ? (
                        <a href={profile.documents.degree_marksheet.startsWith('http') || profile.documents.degree_marksheet.startsWith('/') ? profile.documents.degree_marksheet : `/media/${profile.documents.degree_marksheet}`} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'underline' }}>
                          📄 View Degree Marksheet
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Not Uploaded</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="dashboard-card-panel" style={{ gap: '20px' }}>
              <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Available Opportunities</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    {jobTabMode === 'campus'
                      ? 'Official campus recruitment drives posted by registered enterprise recruiters'
                      : 'Verified technical opportunities sourced from official enterprise career portals for reference'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`notif-filter-btn ${jobTabMode === 'campus' ? 'active' : ''}`}
                    onClick={() => setJobTabMode('campus')}
                    style={{ fontSize: '13px', padding: '6px 14px' }}
                  >
                    Campus Placement ({jobs.length})
                  </button>
                  <button
                    type="button"
                    className={`notif-filter-btn ${jobTabMode === 'reference' ? 'active' : ''}`}
                    onClick={() => setJobTabMode('reference')}
                    style={{ fontSize: '13px', padding: '6px 14px' }}
                  >
                    Verified Reference ({publicJobs.length})
                  </button>
                </div>
              </div>

              {jobTabMode === 'campus' ? (
                <>
                  {/* Jobs Search & Filter Toolbar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder="Search job title, company..." 
                        value={jobSearch} 
                        onChange={(e) => setJobSearch(e.target.value)} 
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }} 
                      />
                    </div>

                    {/* Company Filter */}
                    <select 
                      value={jobCompanyFilter} 
                      onChange={(e) => setJobCompanyFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#FFFFFF' }}
                    >
                      <option value="All">All Companies</option>
                      {Array.from(new Set(jobs.map(j => j.recruiter_detail?.company_name || j.recruiter?.company_name).filter(Boolean))).map((comp, idx) => (
                        <option key={idx} value={comp}>{comp}</option>
                      ))}
                    </select>

                    {/* Location Filter */}
                    <select 
                      value={jobLocationFilter} 
                      onChange={(e) => setJobLocationFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#FFFFFF' }}
                    >
                      <option value="All">All Locations</option>
                      <option value="Kochi">Kochi</option>
                      <option value="Trivandrum">Trivandrum</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Remote">Remote</option>
                    </select>

                    {/* Min Salary Filter */}
                    <select 
                      value={jobMinSalaryFilter} 
                      onChange={(e) => setJobMinSalaryFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#FFFFFF' }}
                    >
                      <option value="0">All Salaries</option>
                      <option value="8">≥ 8.0 LPA</option>
                      <option value="10">≥ 10.0 LPA</option>
                      <option value="12">≥ 12.0 LPA</option>
                    </select>

                    {/* Work Mode Filter */}
                    <select 
                      value={jobWorkModeFilter} 
                      onChange={(e) => setJobWorkModeFilter(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#FFFFFF' }}
                    >
                      <option value="All">All Modes</option>
                      <option value="On-Site">On-Site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  {filteredJobs.length === 0 ? (
                    <div className="empty-state-box">
                      <Briefcase size={32} color="#64748B" />
                      <p>No job postings match your selected filters.</p>
                    </div>
                  ) : (
                    <div className="list-stack">
                      {filteredJobs.map((job) => {
                        const applied = isJobApplied(job.id);
                        return (
                          <div key={job.id} className="list-item-card" style={{ padding: '18px', gap: '16px' }}>
                            <div className="item-main-info" style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0A192F', marginBottom: '4px' }}>{job.job_title}</h4>
                              <p className="item-sub-info" style={{ fontSize: '13.5px', color: '#475569' }}>
                                <strong>{job.recruiter_detail?.company_name || 'Partner Company'}</strong> • 📍 {job.location || 'Location'} • 💰 {job.package_lpa ? `${job.package_lpa} LPA` : 'Salary Not Disclosed'}
                              </p>
                              <p className="item-sub-info" style={{ marginTop: '4px', fontSize: '12.5px', color: '#64748B' }}>
                                Min CGPA: {job.minimum_cgpa || '7.0'} • Deadline: {job.application_deadline || '2026-12-31'}
                              </p>
                            </div>
                            {applied ? (
                              <span className="badge-tag badge-applied" style={{ padding: '8px 16px', fontSize: '13px' }}>✓ Applied</span>
                            ) : (
                              <button 
                                type="button" 
                                className="btn-wizard-primary" 
                                style={{ padding: '8px 20px', fontSize: '13.5px', borderRadius: '8px' }} 
                                onClick={() => handleApplyJob(job.id)}
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Verified Public Reference Opportunities Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    color: '#166534',
                    fontSize: '13.5px',
                    lineHeight: '1.55'
                  }}>
                    <ShieldCheck size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                        Verified Public Reference Opportunities (Industry Benchmark)
                      </div>
                      <div>
                        These graduate openings are sourced directly from authoritative enterprise career pages for MCA and Computing students. 
                        Applying through PLACENTRA does not submit to employer applicant tracking systems; please submit directly on the employer's official portal.
                      </div>
                    </div>
                  </div>

                  {/* Search Toolbar for Reference Opportunities */}
                  <div style={{ position: 'relative', maxWidth: '420px' }}>
                    <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Search company, job role, or location..." 
                      value={jobSearch} 
                      onChange={(e) => setJobSearch(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }} 
                    />
                  </div>

                  {filteredPublicJobs.length === 0 ? (
                    <div className="empty-state-box">
                      <Briefcase size={32} color="#64748B" />
                      <p>No verified reference opportunities match your search.</p>
                    </div>
                  ) : (
                    <div className="list-stack">
                      {filteredPublicJobs.map((refJob) => (
                        <div key={refJob.id} className="list-item-card" style={{ padding: '20px', gap: '16px', flexDirection: 'column', alignItems: 'stretch' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0A192F' }}>
                                  {refJob.job_title}
                                </span>
                                <span className="badge-tag" style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '11px', fontWeight: 700 }}>
                                  ✓ Verified Opportunity
                                </span>
                              </div>
                              <p style={{ margin: '2px 0 0 0', fontSize: '13.5px', color: '#334155' }}>
                                <strong>
                                  <a href={refJob.company_website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>
                                    {refJob.company_name} ↗
                                  </a>
                                </strong>
                                {' '}• 🏢 {refJob.industry} • 📍 {refJob.location} • 💼 {refJob.work_mode}
                              </p>
                            </div>
                            <a
                              href={refJob.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-wizard-primary"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                                padding: '8px 18px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                fontWeight: 600
                              }}
                            >
                              <span>Apply on Official Portal</span>
                              <ExternalLink size={14} />
                            </a>
                          </div>

                          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>
                              <strong style={{ color: '#0F172A' }}>Package / Remuneration:</strong> {refJob.package_details}
                            </div>
                            <div>
                              <strong style={{ color: '#0F172A' }}>Eligibility Criteria:</strong> {refJob.eligibility_criteria}
                            </div>
                            <div>
                              <strong style={{ color: '#0F172A' }}>Description:</strong> {refJob.job_description}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                            <span>
                              Verified on {refJob.verified_at} from{' '}
                              <a href={refJob.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#64748B', textDecoration: 'underline' }}>
                                Official Careers Page ↗
                              </a>
                            </span>
                            <span style={{ fontStyle: 'italic' }}>
                              Reference only • Official submission takes place on employer ATS
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="dashboard-card-panel" style={{ gap: '20px' }}>
              <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>My Submitted Applications</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>Track status of your job applications</p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`nav-item-btn ${appStatusFilter === st ? 'active' : ''}`}
                    style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', borderRadius: '8px' }}
                    onClick={() => setAppStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {filteredApplications.length === 0 ? (
                <div className="empty-state-box">
                  <FileText size={32} color="#64748B" />
                  <p>No job applications found matching status "{appStatusFilter}".</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>STUDENT NAME</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>APPLIED JOB</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>COMPANY</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>APPLICATION DATE</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => {
                        const sName = app.student_detail ? `${app.student_detail.first_name || ''} ${app.student_detail.last_name || ''}`.trim() : (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Student Candidate');
                        const jobTitle = app.job_detail?.job_title || app.job?.job_title || app.job_title || 'N/A';
                        const compName = app.job_detail?.recruiter_detail?.company_name || app.job?.recruiter_detail?.company_name || app.company_name || 'N/A';
                        const appDate = app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-GB') : 'N/A';
                        const appStatus = app.application_status || app.status || 'Applied';

                        return (
                          <tr key={app.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0A192F' }}>
                              {sName}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#334155' }}>
                              {jobTitle}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>
                              {compName}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '13px' }}>
                              {appDate}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                <span className={`badge-tag ${getStatusBadgeClass(appStatus)}`} style={{ padding: '6px 14px' }}>
                                  {appStatus}
                                </span>
                                {(appStatus === 'Selected' || app.application_status === 'Selected') && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadOfferLetter(app.id)}
                                    style={{
                                      padding: '5px 12px',
                                      fontSize: '12px',
                                      background: '#ECFDF5',
                                      color: '#047857',
                                      border: '1px solid #A7F3D0',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="View / Download Candidate Provisional Offer Letter PDF"
                                  >
                                    <FileText size={13} />
                                    <span>Offer Letter</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Placement Drives Tab */}
          {activeTab === 'drives' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Placement Drives</h3>
              </div>
              {drives.length === 0 ? (
                <div className="empty-state-box">
                  <Calendar size={32} color="#64748B" />
                  <p>No campus placement drives scheduled at this time.</p>
                </div>
              ) : (
                <div className="list-stack">
                  {drives.map((drive) => (
                    <div key={drive.id} className="list-item-card">
                      <div className="item-main-info">
                        <h4>{drive.drive_title}</h4>
                        <p className="item-sub-info">
                          <strong>{drive.recruiter_detail?.company_name || 'Recruiter'}</strong> • Date: {drive.drive_date} • Venue: {drive.venue || 'Campus Auditorium'}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        className="btn-wizard-secondary" 
                        style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }} 
                        onClick={() => setSelectedDrive(drive)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Notifications & System Alerts</h3>
                {notifications.some(n => !n.is_read) && (
                  <button 
                    type="button" 
                    className="nav-item-btn" 
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '13px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', borderRadius: '8px' }} 
                    onClick={handleMarkAllNotificationsRead}
                  >
                    ✓ Mark All as Read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="empty-state-box">
                  <Bell size={32} color="#64748B" />
                  <p>You have no notifications at this time.</p>
                </div>
              ) : (
                <div className="list-stack">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="list-item-card" style={{ backgroundColor: notif.is_read ? '#FFFFFF' : '#F0FDF4', borderColor: notif.is_read ? '#E2E8F0' : '#A7F3D0' }}>
                      <div className="item-main-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <h4 style={{ margin: 0 }}>{notif.title || 'System Notification'}</h4>
                          {!notif.is_read && <span className="nav-badge" style={{ backgroundColor: '#10B981', fontSize: '10px' }}>New</span>}
                        </div>
                        <p className="item-sub-info" style={{ color: '#334155' }}>{notif.message}</p>
                      </div>
                      <span className="item-sub-info" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <div>
                    <h3>Account & Security Settings</h3>
                    <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                      Manage your candidate account information, security credentials, and preferences.
                    </p>
                  </div>
                </div>

                <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div className="info-item">
                    <span className="info-label">Candidate Name</span>
                    <span className="info-val">{profile?.first_name ? `${profile.first_name} ${profile.last_name}` : (user?.username || 'Candidate Student')}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Register Number</span>
                    <span className="info-val">{profile?.register_number || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Primary Email Address</span>
                    <span className="info-val">{profile?.contact?.primary_email || user?.email || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Account Role</span>
                    <span className="info-val">Candidate Student</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Academic Program & Branch</span>
                    <span className="info-val">
                      {profile?.current_education?.program?.name || 'Integrated MCA'} 
                      {profile?.current_education?.branch?.name ? ` (${profile.current_education.branch.name})` : ''}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Account & Verification Status</span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className="status-pill pill-completed">Active</span>
                      <span className="status-pill pill-ongoing">Verified Candidate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Change Password Module */}
              <ChangePasswordCard />

              {/* Communication & Notification Preferences */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Notification Preferences</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Email Job Notifications</strong>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Receive job alerts, drive schedules, and selection updates via registered email.</span>
                    </div>
                    <span className="status-pill pill-completed">Enabled</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Placement Cell Broadcasts</strong>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Institutional placement cell notices and schedule broadcasts.</span>
                    </div>
                    <span className="status-pill pill-completed">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <StudentResume onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
        </div>

      </main>

      {/* Placement Drive Details Modal Dialog */}
      {selectedDrive && (
        <div className="modal-backdrop-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="review-summary-card" style={{ maxWidth: '520px', width: '100%', background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="review-card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="review-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#4F46E5" />
                <span className="review-card-title" style={{ fontSize: '18px', fontWeight: 800 }}>{selectedDrive.drive_title}</span>
              </div>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => setSelectedDrive(null)}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div className="review-kv-table" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="kv-row"><span className="kv-key">Company</span><span className="kv-sep">:</span><span className="kv-val">{selectedDrive.recruiter_detail?.company_name || 'Partner Recruiter'}</span></div>
              <div className="kv-row"><span className="kv-key">Drive Date</span><span className="kv-sep">:</span><span className="kv-val">{selectedDrive.drive_date} {selectedDrive.drive_time || ''}</span></div>
              <div className="kv-row"><span className="kv-key">Venue</span><span className="kv-sep">:</span><span className="kv-val">{selectedDrive.venue || 'Campus Central Auditorium'}</span></div>
              <div className="kv-row"><span className="kv-key">Eligibility</span><span className="kv-sep">:</span><span className="kv-val">{selectedDrive.job_detail?.minimum_cgpa ? `Min CGPA: ${selectedDrive.job_detail.minimum_cgpa}` : 'All Eligible Students'}</span></div>
              <div className="kv-row"><span className="kv-key">Associated Job</span><span className="kv-sep">:</span><span className="kv-val">{selectedDrive.job_detail?.job_title || selectedDrive.drive_title}</span></div>
              {selectedDrive.description && (
                <div className="kv-row" style={{ flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  <span className="kv-key" style={{ fontWeight: 700 }}>Description / Instructions:</span>
                  <span className="kv-val" style={{ whiteSpace: 'pre-wrap', color: '#475569', fontSize: '13px' }}>{selectedDrive.description}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-wizard-primary" style={{ padding: '8px 20px', borderRadius: '8px' }} onClick={() => setSelectedDrive(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experience Add/Edit Modal Dialog */}
      {showExpModal && (
        <div className="modal-backdrop-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="review-summary-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="review-card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div className="review-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#4F46E5" />
                <span className="review-card-title" style={{ fontSize: '18px', fontWeight: 800 }}>
                  {editingExpId ? 'Edit Work / Internship Experience' : 'Add Work / Internship Experience'}
                </span>
              </div>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={handleCloseExpModal}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            {expError && (
              <div className="wizard-alert alert-amber" style={{ marginBottom: '16px', backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <AlertCircle size={16} className="flex-shrink-0" color="#EF4444" />
                <span>{expError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Job Title / Role <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern"
                    value={expFormData.designation}
                    onChange={(e) => setExpFormData({ ...expFormData, designation: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Company Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={expFormData.company_name}
                    onChange={(e) => setExpFormData({ ...expFormData, company_name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Experience Type
                  </label>
                  <select
                    value={expFormData.employment_type}
                    onChange={(e) => setExpFormData({ ...expFormData, employment_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px', background: '#FFFFFF' }}
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, India / Remote"
                    value={expFormData.location}
                    onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Start Date <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <DatePicker
                    required
                    value={expFormData.start_date || ''}
                    maxDate={expFormData.end_date && !expFormData.is_current ? expFormData.end_date : undefined}
                    onChange={(val) => setExpFormData({ ...expFormData, start_date: val })}
                    placeholder="dd-mm-yyyy"
                    ariaLabel="Experience Start Date"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    End Date {!expFormData.is_current && <span style={{ color: '#64748B', fontWeight: 400 }}>(or select Present)</span>}
                  </label>
                  <DatePicker
                    disabled={expFormData.is_current}
                    value={expFormData.is_current ? '' : (expFormData.end_date || '')}
                    minDate={expFormData.start_date || undefined}
                    onChange={(val) => setExpFormData({ ...expFormData, end_date: val })}
                    placeholder={expFormData.is_current ? 'Present' : 'dd-mm-yyyy'}
                    ariaLabel="Experience End Date"
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={expFormData.is_current}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setExpFormData({
                          ...expFormData,
                          is_current: checked,
                          end_date: checked ? '' : expFormData.end_date
                        });
                      }}
                    />
                    Currently working here (Present)
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Description / Responsibilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize your key responsibilities, contributions, or achievements..."
                  value={expFormData.description}
                  onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Skills Used in this Role
                </label>
                <ExperienceSkillsSelector
                  selectedSkills={expFormData.skills}
                  onChange={(newSkills) => setExpFormData({ ...expFormData, skills: newSkills })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleCloseExpModal}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExp}
                  className="btn-wizard-primary"
                  style={{ padding: '8px 22px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', opacity: savingExp ? 0.7 : 1 }}
                >
                  {savingExp ? 'Saving...' : (editingExpId ? 'Update Experience' : 'Save Experience')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
