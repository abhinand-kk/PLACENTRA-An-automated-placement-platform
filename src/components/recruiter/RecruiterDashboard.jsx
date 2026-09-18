import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Users, 
  Sliders, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut, 
  PlusCircle, 
  FileCheck, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Search,
  X,
  FileText,
  GraduationCap,
  ChevronRight,
  Eye,
  Edit,
  UserX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChangePasswordCard from '../common/ChangePasswordCard';
import './RecruiterDashboard.css';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [showJobModal, setShowJobModal] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [jobFormError, setJobFormError] = useState(null);
  const [jobSuccessMsg, setJobSuccessMsg] = useState('');
  
  const [jobFormData, setJobFormData] = useState({
    job_title: '',
    location: '',
    package_lpa: '',
    work_mode: 'Hybrid',
    job_description: '',
    requirements: '',
    application_deadline: ''
  });

  // Backend Data States
  const [profile, setProfile] = useState(null);
  const [hiringPreferences, setHiringPreferences] = useState(null);
  const [recruiterStats, setRecruiterStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [actionMessage, setActionMessage] = useState('');

  // Fetch recruiter data on mount
  const fetchRecruiterDashboardData = async () => {
    setLoading(true);
    try {
      const [
        profRes,
        prefRes,
        dashRes,
        appDashRes,
        jobsRes,
        appsRes,
        drivesRes,
        notifsRes
      ] = await Promise.allSettled([
        api.get('/api/v1/recruiters/profile/'),
        api.get('/api/v1/recruiters/hiring-preferences/'),
        api.get('/api/v1/recruiters/dashboard/'),
        api.get('/api/v1/applications/recruiter-dashboard/'),
        api.get('/api/v1/jobs/my-jobs/'),
        api.get('/api/v1/applications/'),
        api.get('/api/v1/placement-drives/recruiter/'),
        api.get('/api/v1/notifications/')
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (prefRes.status === 'fulfilled') setHiringPreferences(prefRes.value.data);
      if (dashRes.status === 'fulfilled') setRecruiterStats(dashRes.value.data);
      if (appDashRes.status === 'fulfilled') setAppStats(appDashRes.value.data);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.results || jobsRes.value.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.results || appsRes.value.data || []);
      if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data.results || drivesRes.value.data || []);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data.results || notifsRes.value.data || []);
    } catch (err) {
      console.warn("Recruiter data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle Candidate Status Updates (Shortlist, Interview, Select, Reject)
  const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
    try {
      setActionMessage('');
      await api.patch(`/api/v1/applications/${applicationId}/status/`, { status: newStatus });
      setActionMessage(`Candidate status updated to ${newStatus}`);
      fetchRecruiterDashboardData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error("Failed to update status:", err);
      setActionMessage('Failed to update candidate status.');
    }
  };

  // Handle Post New Job Submit
  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    setSubmittingJob(true);
    setJobFormError(null);
    setJobSuccessMsg('');

    try {
      let formattedDeadline = jobFormData.application_deadline;
      if (formattedDeadline && formattedDeadline.includes('-')) {
        const parts = formattedDeadline.split('-');
        if (parts[0].length === 2 && parts[2].length === 4) {
          // Convert DD-MM-YYYY to YYYY-MM-DD
          formattedDeadline = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      const payload = {
        job_title: jobFormData.job_title,
        location: jobFormData.location || 'Remote',
        package_lpa: parseFloat(jobFormData.package_lpa) || 0.0,
        job_description: jobFormData.job_description,
        requirements: jobFormData.requirements,
        application_deadline: formattedDeadline || null,
        status: 'Open'
      };

      await api.post('/api/v1/jobs/', payload);
      setJobSuccessMsg('Job posting created successfully!');
      setJobFormData({
        job_title: '',
        location: '',
        package_lpa: '',
        work_mode: 'Hybrid',
        job_description: '',
        requirements: '',
        application_deadline: ''
      });
      fetchRecruiterDashboardData();
      setTimeout(() => {
        setShowJobModal(false);
        setJobSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error("Job creation error:", err);
      setJobFormError(err.response?.data?.error || 'Failed to post new job. Please check all fields.');
    } finally {
      setSubmittingJob(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'candidates', label: 'Candidates', icon: GraduationCap },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Company Profile', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="recruiter-dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state-box" style={{ border: 'none', background: 'transparent' }}>
          <Sparkles size={28} className="spin-gear-icon" color="#10B981" />
          <p>Loading Recruiter Portal...</p>
        </div>
      </div>
    );
  }

  const companyName = profile?.company_name || 'Partner Company';
  const recruiterName = profile?.recruiter_name || user?.username || 'Recruiter';

  // Derived counts for Overview Cards
  const activeJobsCount = recruiterStats?.active_jobs ?? jobs.filter(j => j.status === 'Open').length;
  const totalAppsCount = appStats?.total_applications ?? recruiterStats?.total_applications_received ?? applications.length;
  const shortlistedCount = appStats?.shortlisted ?? recruiterStats?.shortlisted_students ?? applications.filter(a => a.status === 'Shortlisted').length;
  const selectedCount = appStats?.selected ?? recruiterStats?.selected_candidates ?? applications.filter(a => a.status === 'Selected').length;
  const interviewsCount = appStats?.interview_scheduled ?? recruiterStats?.interviews_scheduled ?? applications.filter(a => a.status === 'Interview Scheduled').length;

  const upcomingInterviews = applications.filter(a => a.status === 'Interview Scheduled');

  return (
    <div className="recruiter-dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="recruiter-sidebar">
        <div>
          <div className="recruiter-sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-purple" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/placentra-logo.png" alt="PLACENTRA Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <span className="brand-title-text">PLACENTRA</span>
          </div>

          <nav className="recruiter-nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-user-footer">
          <button className="btn-sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="recruiter-main-content">
        {/* Top Header Bar */}
        <header className="recruiter-top-header">
          <div className="header-welcome-title">
            <h2>{getGreeting()}, {recruiterName}</h2>
            <p>Manage your job postings, applications, candidates and recruitment activities from one place.</p>
          </div>

          <div className="header-actions">
            <button className="btn-post-job-header" onClick={() => setShowJobModal(true)}>
              <PlusCircle size={18} />
              <span>+ Post New Job</span>
            </button>
            <div className="company-avatar-circle" title={companyName}>
              {companyName ? companyName[0].toUpperCase() : 'C'}
            </div>
          </div>
        </header>

        {/* Global Notification Banner */}
        {actionMessage && (
          <div className="action-toast-banner">
            <CheckCircle2 size={18} />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Dynamic Body Container */}
        <div className="dashboard-body-container">
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Statistics / Overview Cards */}
              <div className="recruiter-stats-grid-4">
                {/* 1. Active Job Postings */}
                <div className="rec-stat-card">
                  <div className="rec-stat-header">
                    <span className="rec-stat-lbl">Active Job Postings</span>
                    <div className="rec-stat-icon ic-green">
                      <Briefcase size={22} />
                    </div>
                  </div>
                  <span className="rec-stat-val">{activeJobsCount}</span>
                  <span className="rec-stat-sub">Currently open for applications</span>
                </div>

                {/* 2. Total Applications */}
                <div className="rec-stat-card">
                  <div className="rec-stat-header">
                    <span className="rec-stat-lbl">Total Applications</span>
                    <div className="rec-stat-icon ic-blue">
                      <FileText size={22} />
                    </div>
                  </div>
                  <span className="rec-stat-val">{totalAppsCount}</span>
                  <span className="rec-stat-sub">Candidates applied</span>
                </div>

                {/* 3. Shortlisted Candidates */}
                <div className="rec-stat-card">
                  <div className="rec-stat-header">
                    <span className="rec-stat-lbl">Shortlisted Candidates</span>
                    <div className="rec-stat-icon ic-purple">
                      <UserCheck size={22} />
                    </div>
                  </div>
                  <span className="rec-stat-val">{shortlistedCount}</span>
                  <span className="rec-stat-sub">Qualified for next rounds</span>
                </div>

                {/* 4. Selected Candidates */}
                <div className="rec-stat-card">
                  <div className="rec-stat-header">
                    <span className="rec-stat-lbl">Selected Candidates</span>
                    <div className="rec-stat-icon ic-emerald">
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                  <span className="rec-stat-val">{selectedCount}</span>
                  <span className="rec-stat-sub">Hired & offered roles</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="quick-actions-card">
                <h4 className="quick-actions-title">Quick Actions</h4>
                <div className="quick-actions-grid">
                  <button className="btn-quick-action" onClick={() => setShowJobModal(true)}>
                    <PlusCircle size={16} />
                    <span>Post New Job</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('applications')}>
                    <FileText size={16} />
                    <span>View Applications</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('candidates')}>
                    <GraduationCap size={16} />
                    <span>View Candidates</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('interviews')}>
                    <Calendar size={16} />
                    <span>Schedule Interview</span>
                  </button>
                </div>
              </div>

              {/* Phase 1 Recruitment Pipeline Overview */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Phase 1 Recruitment Pipeline</h3>
                  <span className="pipeline-badge">Live Status</span>
                </div>
                <div className="pipeline-steps-container">
                  <div className="pipeline-step">
                    <div className="step-count">{totalAppsCount}</div>
                    <div className="step-name">Applications</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step">
                    <div className="step-count">{shortlistedCount}</div>
                    <div className="step-name">Shortlisted</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step">
                    <div className="step-count">{interviewsCount}</div>
                    <div className="step-name">Interview Scheduled</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step step-success">
                    <div className="step-count">{selectedCount}</div>
                    <div className="step-name">Selected</div>
                  </div>
                </div>
              </div>

              {/* Active Job Postings Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Active Job Postings</h3>
                  {jobs.length > 0 && (
                    <button className="btn-link-action" onClick={() => setActiveTab('jobs')}>
                      View All Jobs ({jobs.length})
                    </button>
                  )}
                </div>

                {jobs.length === 0 ? (
                  <div className="empty-state-box">
                    <Briefcase size={36} color="#64748B" />
                    <p className="empty-state-text">No active job postings yet.</p>
                    <button className="btn-post-first-job" onClick={() => setShowJobModal(true)}>
                      <PlusCircle size={16} />
                      <span>Post Your First Job</span>
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="rec-jobs-table">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Package</th>
                          <th>Applicants</th>
                          <th>Deadline</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.slice(0, 5).map((job) => (
                          <tr key={job.id}>
                            <td className="job-title-text">{job.job_title}</td>
                            <td>{companyName}</td>
                            <td>{job.location || 'Remote'}</td>
                            <td>{job.package_lpa ? `${job.package_lpa} LPA` : 'Not Specified'}</td>
                            <td>
                              <span className="applicant-count-tag">
                                {job.expected_students || 0} Applied
                              </span>
                            </td>
                            <td>{job.application_deadline || 'Open'}</td>
                            <td>
                              <span className={`status-pill ${job.status === 'Open' ? 'pill-open' : 'pill-closed'}`}>
                                {job.status}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="btn-table-action" title="View Applications" onClick={() => setActiveTab('applications')}>
                                  <Eye size={15} />
                                  <span>View Apps</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Candidate Applications Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Recent Candidate Applications</h3>
                  {applications.length > 0 && (
                    <button className="btn-link-action" onClick={() => setActiveTab('applications')}>
                      View All Applications ({applications.length})
                    </button>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="empty-state-box">
                    <Users size={36} color="#64748B" />
                    <p className="empty-state-text">No applications received yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="rec-jobs-table">
                      <thead>
                        <tr>
                          <th>Candidate Name</th>
                          <th>Applied Job</th>
                          <th>Application Date</th>
                          <th>Status</th>
                          <th>Review Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 5).map((app) => (
                          <tr key={app.id}>
                            <td>
                              <div className="candidate-name-cell">
                                <strong>{app.student_name || app.student?.full_name || 'Candidate'}</strong>
                                <span className="sub-text">{app.register_number || 'Student ID'}</span>
                              </div>
                            </td>
                            <td>{app.job_title || app.job?.job_title || 'Position'}</td>
                            <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}</td>
                            <td>
                              <span className={`status-pill pill-${(app.status || app.application_status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                                {app.status || app.application_status || 'Applied'}
                              </span>
                            </td>
                            <td>
                              <div className="candidate-action-buttons">
                                <button 
                                  className="btn-action-shortlist" 
                                  title="Shortlist Candidate"
                                  onClick={() => handleUpdateApplicantStatus(app.id, 'Shortlisted')}
                                >
                                  <UserCheck size={14} />
                                  <span>Shortlist</span>
                                </button>

                                <button 
                                  className="btn-action-interview" 
                                  title="Schedule Interview"
                                  onClick={() => handleUpdateApplicantStatus(app.id, 'Interview Scheduled')}
                                >
                                  <Calendar size={14} />
                                  <span>Interview</span>
                                </button>

                                <button 
                                  className="btn-action-select" 
                                  title="Select Candidate"
                                  onClick={() => handleUpdateApplicantStatus(app.id, 'Selected')}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Select</span>
                                </button>

                                <button 
                                  className="btn-action-reject" 
                                  title="Reject Candidate"
                                  onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                                >
                                  <UserX size={14} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Upcoming Interviews Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Upcoming Interviews</h3>
                </div>

                {upcomingInterviews.length === 0 ? (
                  <div className="empty-state-box">
                    <Calendar size={36} color="#64748B" />
                    <p className="empty-state-text">No upcoming interviews.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="rec-jobs-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Job Role</th>
                          <th>Interview Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingInterviews.map((interview) => (
                          <tr key={interview.id}>
                            <td>{interview.student_name || 'Candidate'}</td>
                            <td>{interview.job_title || 'Software Role'}</td>
                            <td>
                              <span className="status-pill pill-interview-scheduled">
                                Scheduled
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-action-select" 
                                onClick={() => handleUpdateApplicantStatus(interview.id, 'Selected')}
                              >
                                Mark Selected
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recruiter Company Profile Summary Card */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Recruiter Company Information</h3>
                  <button className="btn-link-action" onClick={() => setActiveTab('profile')}>
                    View Full Profile
                  </button>
                </div>
                <div className="company-info-grid">
                  <div className="info-item">
                    <span className="info-label">Company Name</span>
                    <span className="info-val">{companyName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Recruiter Lead</span>
                    <span className="info-val">{recruiterName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Designation</span>
                    <span className="info-val">{profile?.designation || 'Talent Acquisition Manager'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Official Email</span>
                    <span className="info-val">{profile?.official_email || user?.email}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Job Postings Tab */}
          {activeTab === 'jobs' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>All Posted Jobs</h3>
                <button className="btn-post-job-header" onClick={() => setShowJobModal(true)}>
                  <PlusCircle size={16} />
                  <span>Post New Job</span>
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="empty-state-box">
                  <Briefcase size={36} color="#64748B" />
                  <p className="empty-state-text">No active job postings yet.</p>
                  <button className="btn-post-first-job" onClick={() => setShowJobModal(true)}>
                    <PlusCircle size={16} />
                    <span>Post Your First Job</span>
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="rec-jobs-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Location</th>
                        <th>Package (LPA)</th>
                        <th>Status</th>
                        <th>Application Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td className="job-title-text">{job.job_title}</td>
                          <td>{job.location || 'Remote'}</td>
                          <td>{job.package_lpa ? `${job.package_lpa} LPA` : 'Competitive'}</td>
                          <td>
                            <span className={`status-pill ${job.status === 'Open' ? 'pill-open' : 'pill-closed'}`}>
                              {job.status}
                            </span>
                          </td>
                          <td>{job.application_deadline || 'Open'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' || activeTab === 'candidates' ? (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>{activeTab === 'candidates' ? 'Candidate Profiles & Applications' : 'All Job Applications'}</h3>
              </div>

              {applications.length === 0 ? (
                <div className="empty-state-box">
                  <Users size={36} color="#64748B" />
                  <p className="empty-state-text">No candidate applications recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="rec-jobs-table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Applied Position</th>
                        <th>Applied Date</th>
                        <th>Current Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <div className="candidate-name-cell">
                              <strong>{app.student_name || app.student?.full_name || 'Candidate'}</strong>
                              <span className="sub-text">{app.register_number || app.student?.register_number || 'Student ID'}</span>
                            </div>
                          </td>
                          <td>{app.job_title || app.job?.job_title}</td>
                          <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className={`status-pill pill-${(app.status || app.application_status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                              {app.status || app.application_status || 'Applied'}
                            </span>
                          </td>
                          <td>
                            <div className="candidate-action-buttons">
                              <button 
                                className="btn-action-shortlist" 
                                onClick={() => handleUpdateApplicantStatus(app.id, 'Shortlisted')}
                              >
                                Shortlist
                              </button>
                              <button 
                                className="btn-action-interview" 
                                onClick={() => handleUpdateApplicantStatus(app.id, 'Interview Scheduled')}
                              >
                                Interview
                              </button>
                              <button 
                                className="btn-action-select" 
                                onClick={() => handleUpdateApplicantStatus(app.id, 'Selected')}
                              >
                                Select
                              </button>
                              <button 
                                className="btn-action-reject" 
                                onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Scheduled Interviews</h3>
              </div>

              {upcomingInterviews.length === 0 ? (
                <div className="empty-state-box">
                  <Calendar size={36} color="#64748B" />
                  <p className="empty-state-text">No upcoming interviews.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="rec-jobs-table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingInterviews.map((app) => (
                        <tr key={app.id}>
                          <td>{app.student_name || 'Candidate'}</td>
                          <td>{app.job_title || 'Position'}</td>
                          <td>
                            <span className="status-pill pill-interview-scheduled">
                              Interview Scheduled
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-action-select" 
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Selected')}
                            >
                              Mark Selected
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Company Profile Tab */}
          {activeTab === 'profile' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Company Profile Details</h3>
              </div>
              <div className="company-info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="info-item">
                  <span className="info-label">Company Name</span>
                  <span className="info-val">{companyName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Recruiter Lead</span>
                  <span className="info-val">{recruiterName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Designation</span>
                  <span className="info-val">{profile?.designation || 'Hiring Lead'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Official Email</span>
                  <span className="info-val">{profile?.official_email || user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-val">{profile?.mobile_number || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hiring Volume</span>
                  <span className="info-val">{profile?.hiring_volume || '10-50'} Graduates / Year</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Employer Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="empty-state-box">
                  <Bell size={36} color="#64748B" />
                  <p className="empty-state-text">No employer notifications at this time.</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => (
                    <div key={notif.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <strong>{notif.title}</strong>: {notif.message}
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
                    <h3>Employer Account & Security Settings</h3>
                    <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                      Manage your corporate recruiter credentials, company profile details, and security.
                    </p>
                  </div>
                </div>

                <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div className="info-item">
                    <span className="info-label">Recruiter Lead Name</span>
                    <span className="info-val">{profile?.recruiter_name || user?.username || 'HR Representative'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Designation</span>
                    <span className="info-val">{profile?.designation || 'HR Lead / Hiring Manager'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Official Work Email</span>
                    <span className="info-val">{profile?.official_email || user?.email || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Mobile Number</span>
                    <span className="info-val">{profile?.mobile_number || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Account Role</span>
                    <span className="info-val">Corporate Recruiter</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Company Name</span>
                    <span className="info-val">{profile?.company_name || 'Partner Employer'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Hiring Volume</span>
                    <span className="info-val">{profile?.hiring_volume || '1-10 Candidates'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Verification Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`status-pill ${profile?.is_verified ? 'pill-completed' : 'pill-ongoing'}`}>
                        {profile?.is_verified ? 'Verified Employer' : 'Active Employer'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Change Password Module */}
              <ChangePasswordCard />

              {/* Recruiter Notification & Alert Preferences */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Recruiter Notification Preferences</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Candidate Application Alerts</strong>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Receive instant alerts when candidates apply to your posted jobs.</span>
                    </div>
                    <span className="status-pill pill-completed">Enabled</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Placement Drive Schedules</strong>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Receive updates on campus placement drive dates and venues.</span>
                    </div>
                    <span className="status-pill pill-completed">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Post New Job Modal */}
      {showJobModal && (
        <div className="modal-backdrop">
          <div className="job-modal-content">
            <div className="modal-header">
              <h3>Post New Job Requirement</h3>
              <button className="btn-close-modal" onClick={() => setShowJobModal(false)}>
                <X size={20} />
              </button>
            </div>

            {jobSuccessMsg && (
              <div className="modal-success-banner">
                <CheckCircle2 size={18} />
                <span>{jobSuccessMsg}</span>
              </div>
            )}

            {jobFormError && (
              <div className="modal-error-banner">
                <AlertCircle size={18} />
                <span>{jobFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJobSubmit} className="job-form">
              <div className="form-group">
                <label>Job Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Associate Software Engineer"
                  value={jobFormData.job_title}
                  onChange={(e) => setJobFormData({ ...jobFormData, job_title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text"
                    placeholder="e.g. Bangalore / Hybrid"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Package (LPA)</label>
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.5"
                    value={jobFormData.package_lpa}
                    onChange={(e) => setJobFormData({ ...jobFormData, package_lpa: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea 
                  rows="3"
                  placeholder="Brief overview of the role and responsibilities..."
                  value={jobFormData.job_description}
                  onChange={(e) => setJobFormData({ ...jobFormData, job_description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Requirements & Eligibility</label>
                <textarea 
                  rows="3"
                  placeholder="Required skills, degree specialization, CGPA criteria..."
                  value={jobFormData.requirements}
                  onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Application Deadline</label>
                <input 
                  type="date"
                  value={jobFormData.application_deadline}
                  onChange={(e) => setJobFormData({ ...jobFormData, application_deadline: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowJobModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit" disabled={submittingJob}>
                  {submittingJob ? 'Publishing...' : 'Publish Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
