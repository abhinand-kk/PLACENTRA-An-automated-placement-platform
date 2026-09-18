import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Landmark, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  Users, 
  FileCheck, 
  Percent, 
  Shield, 
  Sparkles,
  Search,
  FileText,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChangePasswordCard from '../common/ChangePasswordCard';
import './OfficerDashboard.css';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Drive Creation Modal State
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [submittingDrive, setSubmittingDrive] = useState(false);
  const [driveFormError, setDriveFormError] = useState(null);
  const [driveSuccessMsg, setDriveSuccessMsg] = useState('');
  
  const [driveFormData, setDriveFormData] = useState({
    drive_title: '',
    drive_date: '',
    drive_time: '09:30',
    venue: '',
    description: ''
  });

  // Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');

  // Backend Data States
  const [profile, setProfile] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [officerStats, setOfficerStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);

  // Fetch placement officer data on mount
  const fetchOfficerDashboardData = async () => {
    setLoading(true);
    try {
      const [
        profRes,
        instRes,
        dashRes,
        studentsRes,
        drivesRes,
        jobsRes,
        appsRes,
        notifsRes,
        loginActRes
      ] = await Promise.allSettled([
        api.get('/api/v1/placement-officers/profile/'),
        api.get('/api/v1/placement-officers/institution/'),
        api.get('/api/v1/placement-officers/dashboard/'),
        api.get('/api/v1/placement-officers/students/'),
        api.get('/api/v1/placement-drives/my-institution/'),
        api.get('/api/v1/jobs/'),
        api.get('/api/v1/applications/'),
        api.get('/api/v1/notifications/'),
        api.get('/api/v1/placement-officers/students/login-activity/')
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (instRes.status === 'fulfilled') setInstitution(instRes.value.data);
      if (dashRes.status === 'fulfilled') setOfficerStats(dashRes.value.data);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.data.results || studentsRes.value.data || []);
      if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data.results || drivesRes.value.data || []);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.results || jobsRes.value.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.results || appsRes.value.data || []);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data.results || notifsRes.value.data || []);
      if (loginActRes.status === 'fulfilled') setLoginActivity(loginActRes.value.data.results || loginActRes.value.data || []);
    } catch (err) {
      console.warn("Placement officer data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateDriveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingDrive(true);
    setDriveFormError(null);
    setDriveSuccessMsg('');

    try {
      let formattedDate = driveFormData.drive_date;
      if (formattedDate && formattedDate.includes('-')) {
        const parts = formattedDate.split('-');
        if (parts[0].length === 2 && parts[2].length === 4) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      const payload = {
        drive_title: driveFormData.drive_title,
        drive_date: formattedDate,
        drive_time: driveFormData.drive_time || '09:30:00',
        venue: driveFormData.venue || 'Campus Auditorium',
        description: driveFormData.description || '',
        status: 'Upcoming'
      };

      await api.post('/api/v1/placement-drives/', payload);
      setDriveSuccessMsg('Placement drive scheduled successfully!');
      setDriveFormData({
        drive_title: '',
        drive_date: '',
        drive_time: '09:30',
        venue: '',
        description: ''
      });
      fetchOfficerDashboardData();
      setTimeout(() => {
        setShowDriveModal(false);
        setDriveSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error("Drive creation error:", err);
      setDriveFormError(err.response?.data?.error || 'Failed to create placement drive. Please check all fields.');
    } finally {
      setSubmittingDrive(false);
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
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'recruiters', label: 'Recruiters & Companies', icon: Building2 },
    { id: 'jobs', label: 'Job Opportunities', icon: Briefcase },
    { id: 'drives', label: 'Placement Drives', icon: Calendar },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'placements', label: 'Placements', icon: CheckCircle2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="officer-dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state-box" style={{ border: 'none', background: 'transparent' }}>
          <Sparkles size={28} className="spin-gear-icon" color="#10B981" />
          <p>Loading Placement Cell Workspace...</p>
        </div>
      </div>
    );
  }

  const institutionName = institution?.institution_name || profile?.institution_detail?.institution_name || 'Campus Institution';
  const officerName = profile?.full_name || user?.username || 'Placement Officer';

  // Derived counts for Overview Cards
  const regStudentsCount = officerStats?.total_registered_students ?? students.length;
  const recruitersCount = officerStats?.total_recruiters ?? 0;
  const upcomingDrivesCount = officerStats?.upcoming_placement_drives ?? drives.filter(d => d.status === 'Upcoming').length;
  const placedStudentsCount = officerStats?.selected_students ?? applications.filter(a => a.status === 'Selected' || a.application_status === 'Selected').length;
  const totalAppsCount = officerStats?.total_applications ?? applications.length;

  const shortlistedAppsCount = applications.filter(a => (a.status || a.application_status) === 'Shortlisted').length;
  const interviewAppsCount = applications.filter(a => (a.status || a.application_status) === 'Interview Scheduled').length;

  // Filtered Students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.full_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.register_number || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.branch || '').toLowerCase().includes(studentSearch.toLowerCase());

    const matchesStatus = 
      studentStatusFilter === 'all' || 
      (studentStatusFilter === 'placed' && student.placement_status === 'Placed') ||
      (studentStatusFilter === 'seeking' && student.placement_status === 'Seeking');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="officer-dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="officer-sidebar">
        <div>
          <div className="officer-sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-amber" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/placentra-logo.png" alt="PLACENTRA Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <span className="brand-title-text">PLACENTRA</span>
          </div>

          <nav className="officer-nav-menu">
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
      <main className="officer-main-content">
        {/* Top Header Bar */}
        <header className="officer-top-header">
          <div className="header-welcome-title">
            <h2>{getGreeting()}, {officerName}</h2>
            <p>Manage campus placements, students, recruiters, drives and placement activities from one place.</p>
          </div>

          <div className="header-actions">
            <button className="btn-create-drive-header" onClick={() => setShowDriveModal(true)}>
              <PlusCircle size={18} />
              <span>+ Create Placement Drive</span>
            </button>
            <div className="officer-avatar-circle" title={institutionName}>
              {institutionName ? institutionName[0].toUpperCase() : 'I'}
            </div>
          </div>
        </header>

        {/* Dynamic Body Container */}
        <div className="dashboard-body-container">
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Primary Statistics / Overview Cards */}
              <div className="officer-stats-grid-4">
                {/* 1. Registered Students */}
                <div className="off-stat-card">
                  <div className="off-stat-header">
                    <span className="off-stat-lbl">Registered Students</span>
                    <div className="off-stat-icon ic-blue">
                      <GraduationCap size={22} />
                    </div>
                  </div>
                  <span className="off-stat-val">{regStudentsCount}</span>
                  <span className="off-stat-sub">Campus registered candidates</span>
                </div>

                {/* 2. Active Recruiters / Companies */}
                <div className="off-stat-card">
                  <div className="off-stat-header">
                    <span className="off-stat-lbl">Active Recruiters</span>
                    <div className="off-stat-icon ic-green">
                      <Building2 size={22} />
                    </div>
                  </div>
                  <span className="off-stat-val">{recruitersCount}</span>
                  <span className="off-stat-sub">Partner hiring companies</span>
                </div>

                {/* 3. Active Placement Drives */}
                <div className="off-stat-card">
                  <div className="off-stat-header">
                    <span className="off-stat-lbl">Active Placement Drives</span>
                    <div className="off-stat-icon ic-pink">
                      <Calendar size={22} />
                    </div>
                  </div>
                  <span className="off-stat-val">{upcomingDrivesCount}</span>
                  <span className="off-stat-sub">Upcoming & ongoing drives</span>
                </div>

                {/* 4. Students Placed */}
                <div className="off-stat-card">
                  <div className="off-stat-header">
                    <span className="off-stat-lbl">Students Placed</span>
                    <div className="off-stat-icon ic-emerald">
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                  <span className="off-stat-val">{placedStudentsCount}</span>
                  <span className="off-stat-sub">Hired with offers</span>
                </div>
              </div>

              {/* Placement Overview Summary Card */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Campus Placement Overview</h3>
                  <span className="overview-badge">Season 2026-2027</span>
                </div>
                <div className="placement-overview-grid">
                  <div className="overview-metric">
                    <span className="metric-val">{regStudentsCount}</span>
                    <span className="metric-lbl">Total Registered</span>
                  </div>
                  <div className="overview-metric">
                    <span className="metric-val">{institution?.eligible_final_year_students || regStudentsCount}</span>
                    <span className="metric-lbl">Eligible Students</span>
                  </div>
                  <div className="overview-metric">
                    <span className="metric-val">{totalAppsCount}</span>
                    <span className="metric-lbl">Students Applied</span>
                  </div>
                  <div className="overview-metric">
                    <span className="metric-val">{shortlistedAppsCount}</span>
                    <span className="metric-lbl">Shortlisted</span>
                  </div>
                  <div className="overview-metric">
                    <span className="metric-val">{placedStudentsCount}</span>
                    <span className="metric-lbl">Selected & Placed</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="quick-actions-card">
                <h4 className="quick-actions-title">Placement Cell Quick Actions</h4>
                <div className="quick-actions-grid">
                  <button className="btn-quick-action" onClick={() => setShowDriveModal(true)}>
                    <PlusCircle size={16} />
                    <span>Create Drive</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('students')}>
                    <GraduationCap size={16} />
                    <span>View Students</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('recruiters')}>
                    <Building2 size={16} />
                    <span>View Recruiters</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('jobs')}>
                    <Briefcase size={16} />
                    <span>View Jobs</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('applications')}>
                    <FileText size={16} />
                    <span>View Applications</span>
                  </button>
                  <button className="btn-quick-action" onClick={() => setActiveTab('reports')}>
                    <BarChart3 size={16} />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>

              {/* Phase 1 Placement Pipeline */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Campus Recruitment Pipeline</h3>
                  <span className="pipeline-badge">Live Progression</span>
                </div>
                <div className="pipeline-steps-container">
                  <div className="pipeline-step">
                    <div className="step-count">{totalAppsCount}</div>
                    <div className="step-name">Applications</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step">
                    <div className="step-count">{shortlistedAppsCount}</div>
                    <div className="step-name">Shortlisted</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step">
                    <div className="step-count">{interviewAppsCount}</div>
                    <div className="step-name">Interview</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step">
                    <div className="step-count">{placedStudentsCount}</div>
                    <div className="step-name">Selected</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step step-success">
                    <div className="step-count">{placedStudentsCount}</div>
                    <div className="step-name">Placed</div>
                  </div>
                </div>
              </div>

              {/* Upcoming Placement Drives Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Upcoming Placement Drives</h3>
                  {drives.length > 0 && (
                    <button className="btn-link-action" onClick={() => setActiveTab('drives')}>
                      View All Drives ({drives.length})
                    </button>
                  )}
                </div>

                {drives.length === 0 ? (
                  <div className="empty-state-box">
                    <Calendar size={36} color="#64748B" />
                    <p className="empty-state-text">No upcoming placement drives.</p>
                    <button className="btn-create-first-drive" onClick={() => setShowDriveModal(true)}>
                      <PlusCircle size={16} />
                      <span>Create Placement Drive</span>
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="officer-table">
                      <thead>
                        <tr>
                          <th>Drive Title</th>
                          <th>Company</th>
                          <th>Drive Date</th>
                          <th>Time</th>
                          <th>Venue</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drives.slice(0, 5).map((drive) => (
                          <tr key={drive.id}>
                            <td className="title-text">{drive.drive_title}</td>
                            <td>{drive.recruiter_detail?.company_name || 'Employer Partner'}</td>
                            <td>{drive.drive_date}</td>
                            <td>{drive.drive_time || '09:30 AM'}</td>
                            <td>{drive.venue || 'Campus Auditorium'}</td>
                            <td>
                              <span className={`status-pill ${drive.status === 'Upcoming' ? 'pill-upcoming' : drive.status === 'Completed' ? 'pill-completed' : 'pill-ongoing'}`}>
                                {drive.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn-table-action" onClick={() => setActiveTab('drives')}>
                                <Eye size={14} />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Recruiters / Companies Overview */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Participating Employers & Recruiters</h3>
                  {jobs.length > 0 && (
                    <button className="btn-link-action" onClick={() => setActiveTab('recruiters')}>
                      View All Recruiters
                    </button>
                  )}
                </div>

                {jobs.length === 0 ? (
                  <div className="empty-state-box">
                    <Building2 size={36} color="#64748B" />
                    <p className="empty-state-text">No active recruiter listings registered.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="officer-table">
                      <thead>
                        <tr>
                          <th>Company Name</th>
                          <th>Recruiter Contact</th>
                          <th>Active Role</th>
                          <th>Package</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.slice(0, 5).map((job) => (
                          <tr key={job.id}>
                            <td className="title-text">{job.recruiter_detail?.company_name || 'Employer'}</td>
                            <td>{job.recruiter_detail?.recruiter_name || 'HR Lead'}</td>
                            <td>{job.job_title}</td>
                            <td>{job.package_lpa ? `${job.package_lpa} LPA` : 'Competitive'}</td>
                            <td>
                              <span className="status-pill pill-completed">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Application Activity Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Recent Application Activity</h3>
                  {applications.length > 0 && (
                    <button className="btn-link-action" onClick={() => setActiveTab('applications')}>
                      View All Applications
                    </button>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="empty-state-box">
                    <FileText size={36} color="#64748B" />
                    <p className="empty-state-text">No recent application activity.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="officer-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Applied Job</th>
                          <th>Company</th>
                          <th>Application Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 5).map((app) => (
                          <tr key={app.id}>
                            <td>{app.student_name || app.student?.full_name || 'Student Candidate'}</td>
                            <td className="title-text">{app.job_title || app.job?.job_title}</td>
                            <td>{app.company_name || app.job?.recruiter_detail?.company_name || 'Partner Employer'}</td>
                            <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}</td>
                            <td>
                              <span className={`status-pill pill-${(app.status || app.application_status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                                {app.status || app.application_status || 'Applied'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Student Login Activity Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Student Login Activity</h3>
                  {loginActivity.length > 0 && (
                    <button className="btn-link-action" onClick={() => setActiveTab('students')}>
                      View All Students ({students.length})
                    </button>
                  )}
                </div>

                {loginActivity.length === 0 ? (
                  <div className="empty-state-box">
                    <UserCheck size={36} color="#64748B" />
                    <p className="empty-state-text">No student login activity available yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="officer-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Course / Program</th>
                          <th>Login Status</th>
                          <th>Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginActivity.slice(0, 5).map((st) => (
                          <tr key={st.id}>
                            <td className="title-text">{st.student_name}</td>
                            <td>{st.email}</td>
                            <td>{st.course}</td>
                            <td>
                              <span className={`status-pill ${st.login_status === 'Active' ? 'pill-completed' : 'pill-upcoming'}`}>
                                {st.login_status}
                              </span>
                            </td>
                            <td>{st.last_login}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Student Directory</h3>
              </div>

              {/* Search & Status Filter */}
              <div className="student-filter-bar">
                <div className="search-input-box">
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Search by student name, register number, or branch..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <div className="status-filter-buttons">
                  <button 
                    className={`filter-btn ${studentStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStudentStatusFilter('all')}
                  >
                    All ({students.length})
                  </button>
                  <button 
                    className={`filter-btn ${studentStatusFilter === 'seeking' ? 'active' : ''}`}
                    onClick={() => setStudentStatusFilter('seeking')}
                  >
                    Seeking
                  </button>
                  <button 
                    className={`filter-btn ${studentStatusFilter === 'placed' ? 'active' : ''}`}
                    onClick={() => setStudentStatusFilter('placed')}
                  >
                    Placed
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="empty-state-box">
                  <GraduationCap size={36} color="#64748B" />
                  <p className="empty-state-text">No registered students found matching your filter criteria.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Register Number</th>
                        <th>Student Name</th>
                        <th>Program / Branch</th>
                        <th>CGPA</th>
                        <th>Profile Completion</th>
                        <th>Placement Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((st) => (
                        <tr key={st.id}>
                          <td><strong>{st.register_number || 'N/A'}</strong></td>
                          <td className="title-text">{st.full_name}</td>
                          <td>{st.program} ({st.branch})</td>
                          <td>{st.cgpa ? `${st.cgpa} / 10.0` : 'N/A'}</td>
                          <td>
                            <div className="completion-bar-cell">
                              <span className="comp-val">{st.profile_completion || 0}%</span>
                              <div className="comp-progress">
                                <div className="comp-fill" style={{ width: `${st.profile_completion || 0}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${st.placement_status === 'Placed' ? 'pill-completed' : 'pill-upcoming'}`}>
                              {st.placement_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recruiters & Companies Tab */}
          {activeTab === 'recruiters' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Partner Employers & Recruiters</h3>
              </div>
              {jobs.length === 0 ? (
                <div className="empty-state-box">
                  <Building2 size={36} color="#64748B" />
                  <p className="empty-state-text">No active recruiters registered.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact Lead</th>
                        <th>Work Mode</th>
                        <th>Active Job Posting</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td className="title-text">{job.recruiter_detail?.company_name || 'Employer'}</td>
                          <td>{job.recruiter_detail?.recruiter_name || 'HR Representative'}</td>
                          <td>{job.location || 'On-Site / Hybrid'}</td>
                          <td>{job.job_title} ({job.package_lpa ? `${job.package_lpa} LPA` : 'Open'})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Job Opportunities Tab */}
          {activeTab === 'jobs' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Job Opportunities Directory</h3>
              </div>
              {jobs.length === 0 ? (
                <div className="empty-state-box">
                  <Briefcase size={36} color="#64748B" />
                  <p className="empty-state-text">No active job postings for this institution.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Employer</th>
                        <th>Package (LPA)</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td className="title-text">{job.job_title}</td>
                          <td>{job.recruiter_detail?.company_name || 'Recruiter'}</td>
                          <td>{job.package_lpa ? `${job.package_lpa} LPA` : 'Competitive'}</td>
                          <td>{job.application_deadline || 'Open'}</td>
                          <td>
                            <span className={`status-pill ${job.status === 'Open' ? 'pill-completed' : 'pill-upcoming'}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                <h3>Campus Placement Drives Schedule</h3>
                <button className="btn-create-drive-header" onClick={() => setShowDriveModal(true)}>
                  <PlusCircle size={16} />
                  <span>Create Placement Drive</span>
                </button>
              </div>
              {drives.length === 0 ? (
                <div className="empty-state-box">
                  <Calendar size={36} color="#64748B" />
                  <p className="empty-state-text">No placement drives currently scheduled.</p>
                  <button className="btn-create-first-drive" onClick={() => setShowDriveModal(true)}>
                    <PlusCircle size={16} />
                    <span>Create Placement Drive</span>
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Drive Title</th>
                        <th>Employer Partner</th>
                        <th>Drive Date</th>
                        <th>Venue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drives.map((drive) => (
                        <tr key={drive.id}>
                          <td className="title-text">{drive.drive_title}</td>
                          <td>{drive.recruiter_detail?.company_name || 'Employer'}</td>
                          <td>{drive.drive_date}</td>
                          <td>{drive.venue || 'Campus Auditorium'}</td>
                          <td>
                            <span className={`status-pill ${drive.status === 'Upcoming' ? 'pill-upcoming' : 'pill-completed'}`}>
                              {drive.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Application Monitoring</h3>
              </div>
              {applications.length === 0 ? (
                <div className="empty-state-box">
                  <FileText size={36} color="#64748B" />
                  <p className="empty-state-text">No student applications recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Applied Position</th>
                        <th>Employer</th>
                        <th>Application Date</th>
                        <th>Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td className="title-text">{app.student_name || app.student?.full_name || 'Student Candidate'}</td>
                          <td>{app.job_title || app.job?.job_title}</td>
                          <td>{app.company_name || app.job?.recruiter_detail?.company_name || 'Employer'}</td>
                          <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span className={`status-pill pill-${(app.status || app.application_status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                              {app.status || app.application_status || 'Applied'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Successful Student Placements</h3>
              </div>
              {applications.filter(a => (a.status || a.application_status) === 'Selected').length === 0 ? (
                <div className="empty-state-box">
                  <CheckCircle2 size={36} color="#64748B" />
                  <p className="empty-state-text">No final placement offers confirmed yet for this season.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Placed Student</th>
                        <th>Hiring Employer</th>
                        <th>Role Title</th>
                        <th>Package (LPA)</th>
                        <th>Offer Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.filter(a => (a.status || a.application_status) === 'Selected').map((app) => (
                        <tr key={app.id}>
                          <td className="title-text">{app.student_name || app.student?.full_name || 'Placed Candidate'}</td>
                          <td>{app.company_name || app.job?.recruiter_detail?.company_name || 'Partner Company'}</td>
                          <td>{app.job_title || app.job?.job_title}</td>
                          <td>{app.job?.package_lpa ? `${app.job.package_lpa} LPA` : 'Offered'}</td>
                          <td>
                            <span className="status-pill pill-completed">
                              Confirmed Offer
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Institutional Placement Reports & Statistics</h3>
              </div>
              <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="info-item">
                  <span className="info-label">Total Student Roster</span>
                  <span className="info-val">{regStudentsCount} Candidates</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Participating Employers</span>
                  <span className="info-val">{recruitersCount} Companies</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Scheduled Placement Drives</span>
                  <span className="info-val">{drives.length} Drives</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Applications Submitted</span>
                  <span className="info-val">{totalAppsCount} Submissions</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Confirmed Hires</span>
                  <span className="info-val">{placedStudentsCount} Placements</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Season Status</span>
                  <span className="info-val">Active Placement Season</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Placement Cell Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="empty-state-box">
                  <Bell size={36} color="#64748B" />
                  <p className="empty-state-text">No notifications available.</p>
                </div>
              ) : (
                <div>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <strong>{n.title}</strong>: {n.message}
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
                    <h3>Placement Cell Account & Security Settings</h3>
                    <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                      Manage your placement officer account credentials, institution details, and cell security.
                    </p>
                  </div>
                </div>

                <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div className="info-item">
                    <span className="info-label">Placement Officer Name</span>
                    <span className="info-val">{profile?.full_name || user?.username || 'Placement Officer'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Officer Designation</span>
                    <span className="info-val">{profile?.designation || 'Head of Campus Placements'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Official Work Email</span>
                    <span className="info-val">{profile?.official_email || user?.email || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Mobile Contact</span>
                    <span className="info-val">{profile?.mobile_number || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Account Role</span>
                    <span className="info-val">Placement Officer</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Institution Name</span>
                    <span className="info-val">{institutionName}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Placement Cell Email</span>
                    <span className="info-val">{institution?.placement_email || profile?.official_email || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Placement Cell Phone</span>
                    <span className="info-val">{institution?.placement_phone || profile?.mobile_number || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Placement Season</span>
                    <span className="info-val">{institution?.placement_season || '2026-2027'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Account Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className="status-pill pill-completed">Active Manager</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Change Password Module */}
              <ChangePasswordCard />

              {/* Placement Cell System Notifications */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Placement Cell System Preferences</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Campus Placement Alerts</strong>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Receive real-time updates when corporate recruiters post jobs or student applications arrive.</span>
                    </div>
                    <span className="status-pill pill-completed">Enabled</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Recruiter Onboarding Notifications</strong>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>Receive notifications when new corporate employers register on PLACENTRA.</span>
                    </div>
                    <span className="status-pill pill-completed">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Placement Drive Modal */}
      {showDriveModal && (
        <div className="modal-backdrop">
          <div className="drive-modal-content">
            <div className="modal-header">
              <h3>Create Placement Drive</h3>
              <button className="btn-close-modal" onClick={() => setShowDriveModal(false)}>
                <X size={20} />
              </button>
            </div>

            {driveSuccessMsg && (
              <div className="modal-success-banner">
                <CheckCircle2 size={18} />
                <span>{driveSuccessMsg}</span>
              </div>
            )}

            {driveFormError && (
              <div className="modal-error-banner">
                <AlertCircle size={18} />
                <span>{driveFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDriveSubmit} className="drive-form">
              <div className="form-group">
                <label>Placement Drive Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Annual Campus Placement Drive 2026"
                  value={driveFormData.drive_title}
                  onChange={(e) => setDriveFormData({ ...driveFormData, drive_title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Drive Date *</label>
                  <input 
                    type="date"
                    required
                    value={driveFormData.drive_date}
                    onChange={(e) => setDriveFormData({ ...driveFormData, drive_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Drive Time</label>
                  <input 
                    type="time"
                    value={driveFormData.drive_time}
                    onChange={(e) => setDriveFormData({ ...driveFormData, drive_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Venue / Location</label>
                <input 
                  type="text"
                  placeholder="e.g. Main Auditorium / Seminar Hall A"
                  value={driveFormData.venue}
                  onChange={(e) => setDriveFormData({ ...driveFormData, venue: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Drive Description & Schedule</label>
                <textarea 
                  rows="3"
                  placeholder="Brief agenda, eligibility requirements, and schedule details..."
                  value={driveFormData.description}
                  onChange={(e) => setDriveFormData({ ...driveFormData, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowDriveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit" disabled={submittingDrive}>
                  {submittingDrive ? 'Scheduling...' : 'Schedule Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
