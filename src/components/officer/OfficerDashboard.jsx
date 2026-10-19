import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  Sparkles,
  Search,
  FileText,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  Check,
  CheckCheck,
  TrendingUp
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

  // Filter & Search States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');

  const [interviewSearch, setInterviewSearch] = useState('');
  const [interviewTypeFilter, setInterviewTypeFilter] = useState('All');
  const [interviewStatusFilter, setInterviewStatusFilter] = useState('All');
  const [interviewViewMode, setInterviewViewMode] = useState('all'); // 'all' | 'upcoming'

  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [recruiterStatusFilter, setRecruiterStatusFilter] = useState('All');

  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('All');

  // Backend Data States
  const [profile, setProfile] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [officerStats, setOfficerStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [officerRecruiters, setOfficerRecruiters] = useState([]);
  const [officerJobs, setOfficerJobs] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Notification & Report Interactive States
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' | 'unread'
  const [markingReadId, setMarkingReadId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [reportTimeFilter, setReportTimeFilter] = useState('all'); // 'all' | 'year' | '90days' | '30days'

  // Modal States
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [selectedRecruiterDetail, setSelectedRecruiterDetail] = useState(null);
  const [loadingRecruiterDetail, setLoadingRecruiterDetail] = useState(false);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  const [showAppModal, setShowAppModal] = useState(false);
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedInterviewDetail, setSelectedInterviewDetail] = useState(null);

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);

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
        appsRes,
        interviewsRes,
        activitiesRes,
        notifsRes,
        officerRecruitersRes,
        officerJobsRes
      ] = await Promise.allSettled([
        api.get('/api/v1/placement-officers/profile/'),
        api.get('/api/v1/placement-officers/institution/'),
        api.get('/api/v1/placement-officers/dashboard/'),
        api.get('/api/v1/placement-officers/students/'),
        api.get('/api/v1/placement-drives/my-institution/'),
        api.get('/api/v1/applications/'),
        api.get('/api/v1/interviews/'),
        api.get('/api/v1/placement-officers/activity/'),
        api.get('/api/v1/notifications/'),
        api.get('/api/v1/placement-officers/recruiters/'),
        api.get('/api/v1/placement-officers/jobs/')
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (instRes.status === 'fulfilled') setInstitution(instRes.value.data);
      if (dashRes.status === 'fulfilled') setOfficerStats(dashRes.value.data);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.data.results || studentsRes.value.data || []);
      if (drivesRes.status === 'fulfilled') setDrives(drivesRes.value.data.results || drivesRes.value.data || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.results || appsRes.value.data || []);
      if (interviewsRes.status === 'fulfilled') setInterviews(interviewsRes.value.data.results || interviewsRes.value.data || []);
      if (activitiesRes.status === 'fulfilled') setActivities(activitiesRes.value.data.results || activitiesRes.value.data || []);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data.results || notifsRes.value.data || []);
      if (officerRecruitersRes.status === 'fulfilled') setOfficerRecruiters(officerRecruitersRes.value.data.results || officerRecruitersRes.value.data || []);
      if (officerJobsRes.status === 'fulfilled') setOfficerJobs(officerJobsRes.value.data.results || officerJobsRes.value.data || []);
    } catch (err) {
      console.warn("Placement officer data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    setMarkingReadId(notifId);
    try {
      await api.patch(`/api/v1/notifications/${notifId}/read/`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setMarkingAllRead(true);
    try {
      await api.patch('/api/v1/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleViewRecruiterDetails = async (recruiterId) => {
    setLoadingRecruiterDetail(true);
    setShowRecruiterModal(true);
    try {
      const res = await api.get(`/api/v1/placement-officers/recruiters/${recruiterId}/`);
      setSelectedRecruiterDetail(res.data);
    } catch (err) {
      console.error("Failed to fetch recruiter details:", err);
      alert(err.response?.data?.error || "Could not load recruiter details.");
      setShowRecruiterModal(false);
    } finally {
      setLoadingRecruiterDetail(false);
    }
  };

  const handleViewStudentDetails = async (studentId) => {
    setLoadingStudentDetail(true);
    setShowStudentModal(true);
    try {
      const res = await api.get(`/api/v1/placement-officers/students/${studentId}/`);
      setSelectedStudentDetail(res.data);
    } catch (err) {
      console.error("Failed to fetch student placement details:", err);
      alert(err.response?.data?.error || "Could not load student placement details.");
      setShowStudentModal(false);
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  const handleUpdateRecruiterApproval = async (recruiterId, newStatus) => {
    setActionLoadingId(`recruiter-${recruiterId}`);
    try {
      await api.patch(`/api/v1/placement-officers/recruiters/${recruiterId}/approval/`, {
        status: newStatus
      });
      await fetchOfficerDashboardData();
    } catch (err) {
      console.error("Failed to update recruiter approval:", err);
      alert(err.response?.data?.error || "Failed to update recruiter status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateJobApproval = async (jobId, newStatus) => {
    setActionLoadingId(`job-${jobId}`);
    try {
      await api.patch(`/api/v1/placement-officers/jobs/${jobId}/approval/`, {
        status: newStatus
      });
      await fetchOfficerDashboardData();
    } catch (err) {
      console.error("Failed to update job approval:", err);
      alert(err.response?.data?.error || "Failed to update job status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadResume = async (appId) => {
    try {
      const response = await api.get(`/api/v1/applications/${appId}/resume/`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Candidate_Resume_${appId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Resume download error:", err);
      alert(err.response?.data?.error || "Failed to download candidate resume.");
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

  const institutionName = institution?.institution_name || profile?.institution_detail?.institution_name || 'Campus Institution';
  const officerName = profile?.full_name || user?.username || 'Placement Officer';

  // Derived REAL counts for Overview Cards
  const regStudentsCount = officerStats?.total_registered_students ?? students.length;
  const studentsAppliedCount = officerStats?.students_applied ?? applications.reduce((acc, a) => acc.add(a.student), new Set()).size;
  const totalAppsCount = officerStats?.total_applications ?? applications.length;
  const shortlistedAppsCount = officerStats?.shortlisted_applications ?? applications.filter(a => ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(a.status || a.application_status)).length;
  const interviewsScheduledCount = officerStats?.interviews_scheduled ?? interviews.filter(i => i.status !== 'Cancelled').length;
  const techInterviewsCount = officerStats?.technical_interviews_count ?? interviews.filter(i => i.interview_type === 'Technical Interview' && i.status !== 'Cancelled').length;
  const hrInterviewsCount = officerStats?.hr_interviews_count ?? interviews.filter(i => i.interview_type === 'HR Interview' && i.status !== 'Cancelled').length;
  // Application selections / total offers issued
  const totalOffersCount = officerStats?.selected_students ?? applications.filter(a => (a.status || a.application_status) === 'Selected').length;
  // Unique placed students (candidates with at least one selection offer)
  const uniquePlacedCount = students.length > 0
    ? students.filter(s => s.placement_status === 'Placed' || (s.selected_count && s.selected_count > 0)).length
    : totalOffersCount;
  const rejectedStudentsCount = officerStats?.rejected_students ?? applications.filter(a => (a.status || a.application_status) === 'Rejected').length;
  
  const recruitersCount = officerStats?.total_recruiters ?? officerRecruiters.length;
  const approvedCompaniesCount = officerStats?.approved_companies ?? officerRecruiters.filter(r => r.approval_status === 'Approved').length;
  const pendingRecruiterCount = officerStats?.pending_recruiter_approvals ?? officerRecruiters.filter(r => r.approval_status === 'Pending').length;
  const activeJobsCount = officerStats?.active_jobs ?? officerJobs.filter(j => j.status === 'Open').length;
  const pendingJobCount = officerStats?.pending_job_approvals ?? officerJobs.filter(j => j.status === 'Pending Approval').length;
  const upcomingDrivesCount = officerStats?.upcoming_placement_drives ?? drives.filter(d => d.status === 'Upcoming').length;
  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    if (notificationFilter === 'unread') return !n.is_read;
    return true;
  });

  // Grouped Navigation for Sidebar
  const navGroups = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Candidate Management',
      items: [
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'placements', label: 'Placements', icon: CheckCircle2 }
      ]
    },
    {
      title: 'Recruitment Management',
      items: [
        { 
          id: 'recruiters', 
          label: 'Recruiters & Companies', 
          icon: Building2,
          badge: pendingRecruiterCount > 0 ? pendingRecruiterCount : null
        },
        { 
          id: 'jobs', 
          label: 'Job Opportunities', 
          icon: Briefcase,
          badge: pendingJobCount > 0 ? pendingJobCount : null
        },
        { id: 'drives', label: 'Placement Drives', icon: Calendar },
        { id: 'interviews', label: 'Interview Monitoring', icon: Clock }
      ]
    },
    {
      title: 'Insights',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          id: 'notifications', 
          label: 'Notifications', 
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
          badgeGreen: true
        },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  // CSV Export utility (RFC 4180 compliant client-side Blob generation)
  const exportToCsv = (filename, headers, rows) => {
    const escapeCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    
    const csvContent = [
      headers.map(escapeCell).join(','),
      ...rows.map(row => row.map(escapeCell).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Department / Program-wise analysis from registered student profile records
  const departmentStats = useMemo(() => {
    if (!students || students.length === 0) return [];
    const map = {};
    students.forEach(st => {
      const prog = st.program && st.program !== 'N/A' ? st.program : 'General';
      const br = st.branch && st.branch !== 'N/A' ? st.branch : 'All Branches';
      const key = `${prog}__${br}`;
      if (!map[key]) {
        map[key] = {
          program: prog,
          branch: br,
          total: 0,
          placed: 0,
          seeking: 0,
          applications: 0
        };
      }
      map[key].total += 1;
      if (st.placement_status === 'Placed' || (st.selected_count && st.selected_count > 0)) {
        map[key].placed += 1;
      } else {
        map[key].seeking += 1;
      }
      map[key].applications += (st.applications_count || 0);
    });

    return Object.values(map).map(item => ({
      ...item,
      placementRate: item.total > 0 ? ((item.placed / item.total) * 100).toFixed(1) : '0.0'
    })).sort((a, b) => b.total - a.total);
  }, [students]);

  // Employer / Company recruitment outcomes from officerRecruiters
  const companyStats = useMemo(() => {
    if (!officerRecruiters || officerRecruiters.length === 0) return [];
    return officerRecruiters.map(r => ({
      id: r.id,
      company_name: r.company_name || 'Partner Employer',
      recruiter_name: r.recruiter_name || 'N/A',
      approval_status: r.approval_status || 'Pending',
      jobs_count: r.posted_jobs_count || 0,
      applications_count: r.applications_count || 0,
      shortlisted_count: r.shortlisted_count || 0,
      interviews_count: r.interviews_count || 0,
      selected_count: r.selected_count || 0
    })).sort((a, b) => (b.selected_count - a.selected_count) || (b.applications_count - a.applications_count));
  }, [officerRecruiters]);

  // Salary package stats calculated from officerJobs and applications
  const packageStats = useMemo(() => {
    const packages = [];
    if (officerJobs && officerJobs.length > 0) {
      officerJobs.forEach(j => {
        if (j.package_lpa && Number(j.package_lpa) > 0) {
          packages.push({
            job_title: j.job_title,
            company_name: j.company_name,
            package_lpa: Number(j.package_lpa)
          });
        }
      });
    }
    if (applications && applications.length > 0) {
      applications.forEach(app => {
        const pkg = app.job_detail?.package_lpa;
        const comp = app.company_name || app.job_detail?.recruiter_detail?.company_name || 'Employer';
        const role = app.job_title || app.job_detail?.job_title;
        if (pkg && Number(pkg) > 0 && !packages.some(p => p.job_title === role && p.company_name === comp)) {
          packages.push({
            job_title: role,
            company_name: comp,
            package_lpa: Number(pkg)
          });
        }
      });
    }

    if (packages.length === 0) {
      return { hasData: false, max: 0, min: 0, avg: '0.00', list: [] };
    }

    const values = packages.map(p => p.package_lpa);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2);

    return {
      hasData: true,
      max,
      min,
      avg,
      list: packages.sort((a, b) => b.package_lpa - a.package_lpa)
    };
  }, [officerJobs, applications]);

  // Handlers for CSV Downloads
  const handleExportInstitutionalCSV = () => {
    const headers = ['Metric', 'Value', 'Context / Calculation'];
    const placementRateStr = regStudentsCount > 0 ? ((uniquePlacedCount / regStudentsCount) * 100).toFixed(1) + '%' : '0.0%';
    const rows = [
      ['Institution Name', institutionName, 'Campus Placement Cell'],
      ['Total Registered Students', regStudentsCount, 'Campus registered candidates'],
      ['Students Applied', studentsAppliedCount, 'Candidates who submitted at least one application'],
      ['Total Applications', totalAppsCount, 'Total job applications submitted'],
      ['Shortlisted Applications', shortlistedAppsCount, 'Applications reaching shortlist/interview/selection'],
      ['Total Interviews Scheduled', interviewsScheduledCount, 'Total non-cancelled interview rounds'],
      ['Technical Interviews', techInterviewsCount, 'Scheduled technical rounds'],
      ['HR Interviews', hrInterviewsCount, 'Scheduled HR rounds'],
      ['Selected Candidates (Placed)', uniquePlacedCount, 'Unique students with at least one job selection'],
      ['Total Job Selection Offers', totalOffersCount, 'Total candidate application selections across all roles'],
      ['Rejected Applications', rejectedStudentsCount, 'Applications not progressing to offer'],
      ['Placement Rate', placementRateStr, 'Unique placed candidates ÷ Total registered students'],
      ['Active Approved Companies', approvedCompaniesCount, 'Verified and approved employers'],
      ['Active Campus Jobs', activeJobsCount, 'Current open campus job postings'],
      ['Scheduled Drives', upcomingDrivesCount, 'Upcoming campus placement drives']
    ];
    exportToCsv('Campus_Placement_Institutional_Report.csv', headers, rows);
  };

  const handleExportDepartmentCSV = () => {
    const headers = ['Program / Degree', 'Branch / Specialization', 'Total Registered', 'Placed Students', 'Seeking Students', 'Placement Rate (%)'];
    const rows = departmentStats.map(d => [
      d.program,
      d.branch,
      d.total,
      d.placed,
      d.seeking,
      `${d.placementRate}%`
    ]);
    exportToCsv('Campus_Placement_Department_Summary.csv', headers, rows);
  };

  const handleExportCompanyCSV = () => {
    const headers = ['Company Name', 'Recruiter Contact', 'Approval Status', 'Jobs Posted', 'Applications Received', 'Candidates Shortlisted', 'Interviews Scheduled', 'Offers Confirmed'];
    const rows = companyStats.map(c => [
      c.company_name,
      c.recruiter_name,
      c.approval_status,
      c.jobs_count,
      c.applications_count,
      c.shortlisted_count,
      c.interviews_count,
      c.selected_count
    ]);
    exportToCsv('Campus_Placement_Company_Outcomes.csv', headers, rows);
  };

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

  // Filtered Lists
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.full_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.register_number || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.branch || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.program || '').toLowerCase().includes(studentSearch.toLowerCase());

    const matchesStatus = 
      studentStatusFilter === 'all' || 
      (studentStatusFilter === 'placed' && student.placement_status === 'Placed') ||
      (studentStatusFilter === 'seeking' && student.placement_status === 'Seeking');

    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter(app => {
    const sName = (app.student_name || app.student_detail?.first_name || '').toLowerCase();
    const regNum = (app.register_number || app.student_detail?.register_number || '').toLowerCase();
    const jobTitle = (app.job_title || app.job_detail?.job_title || '').toLowerCase();
    const compName = (app.job_detail?.recruiter_detail?.company_name || app.company_name || '').toLowerCase();

    const matchesSearch = 
      sName.includes(appSearch.toLowerCase()) ||
      regNum.includes(appSearch.toLowerCase()) ||
      jobTitle.includes(appSearch.toLowerCase()) ||
      compName.includes(appSearch.toLowerCase());

    const statusVal = app.status || app.application_status || 'Applied';
    const matchesStatus = appStatusFilter === 'All' || statusVal.toLowerCase() === appStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredInterviews = interviews.filter(item => {
    const candName = (item.candidate_name || '').toLowerCase();
    const regNum = (item.register_number || '').toLowerCase();
    const jTitle = (item.job_title || '').toLowerCase();
    const cName = (item.company_name || '').toLowerCase();

    const matchesSearch = 
      candName.includes(interviewSearch.toLowerCase()) ||
      regNum.includes(interviewSearch.toLowerCase()) ||
      jTitle.includes(interviewSearch.toLowerCase()) ||
      cName.includes(interviewSearch.toLowerCase());

    const matchesType = interviewTypeFilter === 'All' || item.interview_type === interviewTypeFilter;
    const matchesStatus = interviewStatusFilter === 'All' || item.status === interviewStatusFilter;

    let matchesView = true;
    if (interviewViewMode === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      matchesView = item.interview_date >= today && item.status !== 'Cancelled';
    }

    return matchesSearch && matchesType && matchesStatus && matchesView;
  });

  return (
    <div className="officer-dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="officer-sidebar">
        <div className="officer-sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-amber" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/placentra-logo.png" alt="PLACENTRA Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <span className="brand-title-text">PLACENTRA</span>
        </div>

        <div className="officer-sidebar-nav-wrap">
          <nav className="officer-nav-menu">
            {navGroups.map((group) => (
              <div key={group.title} className="nav-group-section">
                <div className="nav-group-title">{group.title}</div>
                {group.items.map((item) => {
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
                      {item.badge != null && (
                        <span className={`nav-item-badge ${item.badgeGreen ? 'badge-green' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
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
            {(activeTab === 'dashboard' || activeTab === 'drives') && (
              <button className="btn-create-drive-header" onClick={() => setShowDriveModal(true)}>
                <PlusCircle size={18} />
                <span>Create Placement Drive</span>
              </button>
            )}
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
                  <span className="off-stat-val">{approvedCompaniesCount} <span style={{ fontSize: '18px', fontWeight: 600, color: '#64748B' }}>/ {recruitersCount}</span></span>
                  <span className="off-stat-sub">
                    {pendingRecruiterCount > 0 ? (
                      <span style={{ color: '#D97706', fontWeight: 700 }}>{pendingRecruiterCount} Pending Approvals</span>
                    ) : (
                      'All accounts approved'
                    )}
                  </span>
                </div>

                {/* 3. Active Placement Drives */}
                <div className="off-stat-card">
                  <div className="off-stat-header">
                    <span className="off-stat-lbl">Scheduled Drives</span>
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
                  <span className="off-stat-val">{uniquePlacedCount}</span>
                  <span className="off-stat-sub">
                    {totalOffersCount > uniquePlacedCount 
                      ? `${totalOffersCount} total selection offers`
                      : 'Candidates with job selections'}
                  </span>
                </div>
              </div>

              {/* Action-Oriented Pending Verification & Approvals Section */}
              {(pendingRecruiterCount > 0 || pendingJobCount > 0) ? (
                <div className="pending-approvals-panel">
                  <div className="pending-panel-header">
                    <div className="pending-panel-title">
                      <AlertCircle size={18} color="#D97706" />
                      <span>Action Items Requiring Officer Review</span>
                    </div>
                    <span className="pending-count-badge">
                      {(pendingRecruiterCount || 0) + (pendingJobCount || 0)} Pending
                    </span>
                  </div>
                  <div className="pending-items-grid">
                    {pendingRecruiterCount > 0 && (
                      <div className="pending-item-card">
                        <div className="pending-item-info">
                          <div className="pending-item-title">
                            <Building2 size={16} color="#D97706" />
                            <span>Recruiter Approvals Pending</span>
                          </div>
                          <p className="pending-item-desc">
                            <strong>{pendingRecruiterCount}</strong> company registration{pendingRecruiterCount === 1 ? '' : 's'} awaiting verification.
                          </p>
                        </div>
                        <button 
                          className="btn-pending-action"
                          onClick={() => {
                            setRecruiterStatusFilter('Pending');
                            setActiveTab('recruiters');
                          }}
                        >
                          Review Recruiters
                        </button>
                      </div>
                    )}
                    {pendingJobCount > 0 && (
                      <div className="pending-item-card">
                        <div className="pending-item-info">
                          <div className="pending-item-title">
                            <Briefcase size={16} color="#D97706" />
                            <span>Job Postings Awaiting Approval</span>
                          </div>
                          <p className="pending-item-desc">
                            <strong>{pendingJobCount}</strong> campus job opportunity{pendingJobCount === 1 ? '' : 'ies'} awaiting authorization.
                          </p>
                        </div>
                        <button 
                          className="btn-pending-action"
                          onClick={() => {
                            setJobStatusFilter('Pending Approval');
                            setActiveTab('jobs');
                          }}
                        >
                          Review Jobs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pending-status-clean-bar">
                  <CheckCircle2 size={18} color="#10B981" />
                  <span>All recruiter registrations and job postings are reviewed and up to date.</span>
                </div>
              )}

              {/* Campus Recruitment Pipeline */}
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
                    <div className="step-count" style={{ color: '#7C3AED' }}>{techInterviewsCount}</div>
                    <div className="step-name">Tech Interviews</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step">
                    <div className="step-count" style={{ color: '#047857' }}>{hrInterviewsCount}</div>
                    <div className="step-name">HR Interviews</div>
                  </div>
                  <ChevronRight size={20} className="pipeline-arrow" />
                  <div className="pipeline-step step-success">
                    <div className="step-count">{totalOffersCount}</div>
                    <div className="step-name">Selected (Offers)</div>
                  </div>
                </div>
              </div>

              {/* Recent Placement Activity Section */}
              <div className="dashboard-card-panel">
                <div className="panel-header">
                  <h3>Recent Placement Activity</h3>
                  <span className="overview-badge" style={{ background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' }}>
                    Recent Activity
                  </span>
                </div>
                {activities.length === 0 ? (
                  <div className="empty-state-box compact">
                    <Clock size={32} color="#94A3B8" />
                    <p className="empty-state-text">No placement activity recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activities.map(act => (
                      <div 
                        key={act.id} 
                        className="activity-item-compact"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            background: act.type === 'selection' ? '#10B981' : act.type === 'interview' ? '#F59E0B' : act.type === 'shortlist' ? '#8B5CF6' : act.type === 'rejection' ? '#EF4444' : '#3B82F6'
                          }} />
                          <span style={{ fontSize: '13.5px', color: '#0F172A', fontWeight: 500 }}>{act.text}</span>
                        </div>
                        {act.date && (
                          <span style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', marginLeft: '12px', flexShrink: 0 }}>
                            {act.date}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                  <div className="empty-state-box compact">
                    <Calendar size={32} color="#94A3B8" />
                    <p className="empty-state-text">No upcoming placement drives scheduled for this campus.</p>
                    <button className="btn-create-first-drive" onClick={() => setShowDriveModal(true)}>
                      <PlusCircle size={15} />
                      <span>Schedule Placement Drive</span>
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
                              <button className="btn-table-action" onClick={() => setActiveTab('drives')} title="Manage in Placement Drives">
                                <ExternalLink size={14} />
                                <span>Manage Drive</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Students Tab — Student Placement Monitoring */}
          {activeTab === 'students' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Student Placement Monitoring</h3>
                <span className="overview-badge">{filteredStudents.length} Students</span>
              </div>

              {/* Search & Status Filter */}
              <div className="student-filter-bar">
                <div className="search-input-box">
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Search by student name, register number, program, or branch..."
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
                  <p className="empty-state-text">No registered students found matching your search or filter criteria.</p>
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
                        <th>Apps</th>
                        <th>Shortlisted</th>
                        <th>Interviews</th>
                        <th>Placement Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((st) => (
                        <tr key={st.id}>
                          <td><strong>{st.register_number || 'N/A'}</strong></td>
                          <td className="title-text">{st.full_name}</td>
                          <td>{st.program} ({st.branch})</td>
                          <td>{st.cgpa ? `${st.cgpa} / 10.0` : 'N/A'}</td>
                          <td><span className="status-pill pill-applied">{st.applications_count || 0}</span></td>
                          <td><span className="status-pill pill-shortlisted">{st.shortlisted_count || 0}</span></td>
                          <td><span className="status-pill pill-upcoming">{st.interviews_count || 0}</span></td>
                          <td>
                            <span className={`status-pill ${st.placement_status === 'Placed' ? 'pill-completed' : 'pill-ongoing'}`}>
                              {st.placement_status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-table-action"
                              onClick={() => handleViewStudentDetails(st.id)}
                            >
                              <Eye size={14} />
                              <span>View Journey</span>
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

          {/* Recruiters & Companies Tab */}
          {activeTab === 'recruiters' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Partner Employers & Corporate Recruiters</h3>
              </div>

              {/* Recruiter Status Filter Bar */}
              <div className="student-filter-bar" style={{ marginBottom: '20px' }}>
                <div className="search-input-box">
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Search by company or recruiter name..."
                    value={recruiterSearch}
                    onChange={(e) => setRecruiterSearch(e.target.value)}
                  />
                </div>

                <div className="status-filter-buttons">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => {
                    const count = status === 'All' 
                      ? officerRecruiters.length 
                      : officerRecruiters.filter(r => (r.approval_status || 'Pending').toLowerCase() === status.toLowerCase()).length;
                    return (
                      <button
                        key={status}
                        className={`filter-btn ${recruiterStatusFilter === status ? 'active' : ''}`}
                        onClick={() => setRecruiterStatusFilter(status)}
                      >
                        {status} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {officerRecruiters.filter(r => {
                const matchesSearch = r.company_name?.toLowerCase().includes(recruiterSearch.toLowerCase()) || r.recruiter_name?.toLowerCase().includes(recruiterSearch.toLowerCase());
                const matchesStatus = recruiterStatusFilter === 'All' || (r.approval_status || 'Pending').toLowerCase() === recruiterStatusFilter.toLowerCase();
                return matchesSearch && matchesStatus;
              }).length === 0 ? (
                <div className="empty-state-box">
                  <Building2 size={36} color="#64748B" />
                  <p className="empty-state-text">No recruiters found matching status filter "{recruiterStatusFilter}".</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact Lead</th>
                        <th>Email / Mobile</th>
                        <th>Jobs</th>
                        <th>Applications</th>
                        <th>Shortlisted</th>
                        <th>Selected</th>
                        <th>Approval Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officerRecruiters
                        .filter(r => {
                          const matchesSearch = r.company_name?.toLowerCase().includes(recruiterSearch.toLowerCase()) || r.recruiter_name?.toLowerCase().includes(recruiterSearch.toLowerCase());
                          const matchesStatus = recruiterStatusFilter === 'All' || (r.approval_status || 'Pending').toLowerCase() === recruiterStatusFilter.toLowerCase();
                          return matchesSearch && matchesStatus;
                        })
                        .map((recruiter) => (
                          <tr key={recruiter.id}>
                            <td className="title-text">{recruiter.company_name}</td>
                            <td>{recruiter.recruiter_name}</td>
                            <td>
                              <div>{recruiter.official_email}</div>
                              {recruiter.mobile_number && <small style={{ color: '#64748B' }}>{recruiter.mobile_number}</small>}
                            </td>
                            <td><strong>{recruiter.posted_jobs_count || 0}</strong></td>
                            <td><span className="status-pill pill-applied">{recruiter.applications_count || 0}</span></td>
                            <td><span className="status-pill pill-shortlisted">{recruiter.shortlisted_count || 0}</span></td>
                            <td><span className="status-pill pill-completed">{recruiter.selected_count || 0}</span></td>
                            <td>
                              <span className={`status-pill pill-${(recruiter.approval_status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                                {recruiter.approval_status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="btn-table-action"
                                  onClick={() => handleViewRecruiterDetails(recruiter.id)}
                                >
                                  <Eye size={14} />
                                  <span>Details</span>
                                </button>
                                {recruiter.approval_status !== 'Approved' && (
                                  <button
                                    className="btn-approve-sm"
                                    disabled={actionLoadingId === `recruiter-${recruiter.id}`}
                                    onClick={() => handleUpdateRecruiterApproval(recruiter.id, 'Approved')}
                                  >
                                    Approve
                                  </button>
                                )}
                                {recruiter.approval_status !== 'Rejected' && (
                                  <button
                                    className="btn-reject-sm"
                                    disabled={actionLoadingId === `recruiter-${recruiter.id}`}
                                    onClick={() => handleUpdateRecruiterApproval(recruiter.id, 'Rejected')}
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
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
                <h3>Campus Job Opportunities & Posting Approvals</h3>
              </div>

              {/* Job Status Filter Bar */}
              <div className="student-filter-bar" style={{ marginBottom: '20px' }}>
                <div className="search-input-box">
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Search by job title or employer name..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                  />
                </div>

                <div className="status-filter-buttons">
                  {['All', 'Pending Approval', 'Open', 'Rejected', 'Closed'].map(status => {
                    const count = status === 'All'
                      ? officerJobs.length
                      : officerJobs.filter(j => (j.status || 'Pending Approval').toLowerCase() === status.toLowerCase()).length;
                    return (
                      <button
                        key={status}
                        className={`filter-btn ${jobStatusFilter === status ? 'active' : ''}`}
                        onClick={() => setJobStatusFilter(status)}
                      >
                        {status} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {officerJobs.filter(j => {
                const matchesSearch = j.job_title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.company_name?.toLowerCase().includes(jobSearch.toLowerCase());
                const matchesStatus = jobStatusFilter === 'All' || (j.status || 'Pending Approval').toLowerCase() === jobStatusFilter.toLowerCase();
                return matchesSearch && matchesStatus;
              }).length === 0 ? (
                <div className="empty-state-box">
                  <Briefcase size={36} color="#64748B" />
                  <p className="empty-state-text">No job postings found matching status filter "{jobStatusFilter}".</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Employer</th>
                        <th>Package</th>
                        <th>Work Mode</th>
                        <th>Apps</th>
                        <th>Shortlisted</th>
                        <th>Selected</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officerJobs
                        .filter(j => {
                          const matchesSearch = j.job_title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.company_name?.toLowerCase().includes(jobSearch.toLowerCase());
                          const matchesStatus = jobStatusFilter === 'All' || (j.status || 'Pending Approval').toLowerCase() === jobStatusFilter.toLowerCase();
                          return matchesSearch && matchesStatus;
                        })
                        .map((job) => (
                          <tr key={job.id}>
                            <td className="title-text">{job.job_title}</td>
                            <td>{job.company_name}</td>
                            <td>{job.package_lpa ? `${job.package_lpa} LPA` : 'Competitive'}</td>
                            <td>{job.work_mode || 'N/A'}</td>
                            <td><span className="status-pill pill-applied">{job.applications_count || 0}</span></td>
                            <td><span className="status-pill pill-shortlisted">{job.shortlisted_count || 0}</span></td>
                            <td><span className="status-pill pill-completed">{job.selected_count || 0}</span></td>
                            <td>
                              <span className={`status-pill pill-${(job.status || 'Pending Approval').toLowerCase().replace(/\s+/g, '-')}`}>
                                {job.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="btn-table-action"
                                  onClick={() => {
                                    setSelectedJobDetail(job);
                                    setShowJobModal(true);
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>Details</span>
                                </button>
                                {job.status !== 'Open' && (
                                  <button
                                    className="btn-approve-sm"
                                    disabled={actionLoadingId === `job-${job.id}`}
                                    onClick={() => handleUpdateJobApproval(job.id, 'Open')}
                                  >
                                    Approve
                                  </button>
                                )}
                                {job.status !== 'Rejected' && (
                                  <button
                                    className="btn-reject-sm"
                                    disabled={actionLoadingId === `job-${job.id}`}
                                    onClick={() => handleUpdateJobApproval(job.id, 'Rejected')}
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab — Application & Shortlist Monitoring */}
          {activeTab === 'applications' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Application & Shortlist Monitoring</h3>
                <span className="overview-badge">{filteredApplications.length} Submissions</span>
              </div>

              {/* Search & Status Filters */}
              <div className="student-filter-bar" style={{ marginBottom: '20px' }}>
                <div className="search-input-box">
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Search by candidate name, register number, job title, or company..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                  />
                </div>

                <div className="status-filter-buttons" style={{ flexWrap: 'wrap' }}>
                  {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].map(st => {
                    const count = st === 'All'
                      ? applications.length
                      : applications.filter(a => (a.status || a.application_status || 'Applied').toLowerCase() === st.toLowerCase()).length;
                    return (
                      <button
                        key={st}
                        className={`filter-btn ${appStatusFilter === st ? 'active' : ''}`}
                        onClick={() => setAppStatusFilter(st)}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="empty-state-box">
                  <FileText size={36} color="#64748B" />
                  <p className="empty-state-text">No student applications found matching your filter criteria.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Reg Number</th>
                        <th>Applied Position</th>
                        <th>Employer</th>
                        <th>Application Date</th>
                        <th>Current Status</th>
                        <th>Interviews</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => {
                        const hasTech = app.interviews?.some(i => i.interview_type === 'Technical Interview');
                        const hasHR = app.interviews?.some(i => i.interview_type === 'HR Interview');
                        return (
                          <tr key={app.id}>
                            <td className="title-text">{app.student_name || app.student_detail?.first_name || 'Candidate'}</td>
                            <td><strong>{app.register_number || app.student_detail?.register_number || 'N/A'}</strong></td>
                            <td>{app.job_title || app.job_detail?.job_title}</td>
                            <td>{app.company_name || app.job_detail?.recruiter_detail?.company_name || 'Employer'}</td>
                            <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <span className={`status-pill pill-${(app.status || app.application_status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                                {app.status || app.application_status || 'Applied'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {hasTech && <span className="badge-tech-interview" style={{ fontSize: '11px', padding: '2px 6px' }}>Tech</span>}
                                {hasHR && <span className="badge-hr-interview" style={{ fontSize: '11px', padding: '2px 6px' }}>HR</span>}
                                {!hasTech && !hasHR && <span style={{ fontSize: '12px', color: '#94A3B8' }}>None</span>}
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="btn-table-action"
                                  onClick={() => {
                                    setSelectedAppDetail(app);
                                    setShowAppModal(true);
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>Details</span>
                                </button>
                                {app.student_detail?.documents?.resume && (
                                  <button
                                    className="btn-table-action"
                                    title="Download Candidate Resume"
                                    onClick={() => handleDownloadResume(app.id)}
                                  >
                                    <Download size={14} color="#10B981" />
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

          {/* Interviews Tab — Comprehensive Interview Monitoring */}
          {activeTab === 'interviews' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Technical & HR Interview Monitoring</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`filter-btn ${interviewViewMode === 'all' ? 'active' : ''}`}
                    onClick={() => setInterviewViewMode('all')}
                  >
                    All Interviews ({interviews.length})
                  </button>
                  <button 
                    className={`filter-btn ${interviewViewMode === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setInterviewViewMode('upcoming')}
                  >
                    Upcoming Interviews ({interviews.filter(i => i.status !== 'Cancelled').length})
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="student-filter-bar" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="search-input-box" style={{ minWidth: '260px' }}>
                  <Search size={16} color="#64748B" />
                  <input 
                    type="text"
                    placeholder="Search candidate, reg number, job, or company..."
                    value={interviewSearch}
                    onChange={(e) => setInterviewSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Type:</span>
                  <select 
                    value={interviewTypeFilter}
                    onChange={(e) => setInterviewTypeFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="All">All Types</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="HR Interview">HR Interview</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Status:</span>
                  <select 
                    value={interviewStatusFilter}
                    onChange={(e) => setInterviewStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredInterviews.length === 0 ? (
                <div className="empty-state-box">
                  <Clock size={36} color="#64748B" />
                  <p className="empty-state-text">No interview records found matching your filter criteria.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="officer-table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Reg Number</th>
                        <th>Interview Round</th>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Date & Time</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInterviews.map((item) => (
                        <tr key={item.id}>
                          <td className="title-text">{item.candidate_name}</td>
                          <td><strong>{item.register_number || 'N/A'}</strong></td>
                          <td>
                            <span className={item.interview_type === 'Technical Interview' ? 'badge-tech-interview' : 'badge-hr-interview'}>
                              {item.interview_type}
                            </span>
                          </td>
                          <td>{item.company_name}</td>
                          <td>{item.job_title}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.interview_date}</div>
                            <small style={{ color: '#64748B' }}>{item.interview_time} ({item.duration_minutes} mins)</small>
                          </td>
                          <td>{item.mode}</td>
                          <td>
                            <span className={`status-pill pill-${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-table-action"
                              onClick={() => {
                                setSelectedInterviewDetail(item);
                                setShowInterviewModal(true);
                              }}
                            >
                              <Eye size={14} />
                              <span>Details</span>
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

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="dashboard-card-panel">
              <div className="panel-header">
                <h3>Campus Student Placement Selections</h3>
                <span className="overview-badge">
                  {uniquePlacedCount} Placed Candidates {totalOffersCount > uniquePlacedCount ? `(${totalOffersCount} Offers)` : ''}
                </span>
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
                        <th>Reg Number</th>
                        <th>Hiring Employer</th>
                        <th>Role Title</th>
                        <th>Package (LPA)</th>
                        <th>Offer Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.filter(a => (a.status || a.application_status) === 'Selected').map((app) => (
                        <tr key={app.id}>
                          <td className="title-text">{app.student_name || app.student_detail?.first_name || 'Placed Candidate'}</td>
                          <td><strong>{app.register_number || app.student_detail?.register_number || 'N/A'}</strong></td>
                          <td>{app.company_name || app.job_detail?.recruiter_detail?.company_name || 'Partner Company'}</td>
                          <td>{app.job_title || app.job_detail?.job_title}</td>
                          <td>{app.job_detail?.package_lpa ? `${app.job_detail.package_lpa} LPA` : 'Offered'}</td>
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
            <div className="reports-page-wrapper">
              {/* Header and Toolbar */}
              <div className="reports-toolbar">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Institutional Placement Analytics & Reports
                  </h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    Authoritative campus metrics verified for {institutionName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="reports-time-filter">
                    <span className="reports-filter-label">Filter:</span>
                    {['all', 'year', '90days', '30days'].map(f => (
                      <button
                        key={f}
                        className={`notif-filter-btn ${reportTimeFilter === f ? 'active' : ''}`}
                        onClick={() => setReportTimeFilter(f)}
                      >
                        {f === 'all' ? 'All Time' : f === 'year' ? 'This Year' : f === '90days' ? 'Last 90 Days' : 'Last 30 Days'}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="btn-export-csv"
                    onClick={handleExportInstitutionalCSV}
                    title="Export institutional placement summary to CSV"
                  >
                    <Download size={15} />
                    <span>Export Summary CSV</span>
                  </button>
                </div>
              </div>

              {/* Executive KPI Summary Cards */}
              <div className="reports-kpi-grid">
                <div className="report-kpi-card">
                  <div className="report-kpi-header">
                    <span className="report-kpi-label">Registered Candidates</span>
                    <GraduationCap size={18} color="#3B82F6" />
                  </div>
                  <span className="report-kpi-val">{regStudentsCount}</span>
                  <span className="report-kpi-sub">Total student profiles</span>
                </div>

                <div className="report-kpi-card">
                  <div className="report-kpi-header">
                    <span className="report-kpi-label">Active Applicants</span>
                    <FileText size={18} color="#6366F1" />
                  </div>
                  <span className="report-kpi-val">{studentsAppliedCount}</span>
                  <span className="report-kpi-sub">{totalAppsCount} applications submitted</span>
                </div>

                <div className="report-kpi-card kpi-accent">
                  <div className="report-kpi-header">
                    <span className="report-kpi-label">Selected Candidates</span>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>
                  <span className="report-kpi-val">{uniquePlacedCount}</span>
                  <span className="report-kpi-sub">
                    {totalOffersCount > uniquePlacedCount 
                      ? `${totalOffersCount} total selection offers`
                      : 'Candidates with job selections'}
                  </span>
                </div>

                <div className="report-kpi-card kpi-accent">
                  <div className="report-kpi-header">
                    <span className="report-kpi-label">Placement Rate</span>
                    <TrendingUp size={18} color="#059669" />
                  </div>
                  <span className="report-kpi-val">
                    {regStudentsCount > 0 ? ((uniquePlacedCount / regStudentsCount) * 100).toFixed(1) + '%' : '0.0%'}
                  </span>
                  <span className="report-kpi-sub">
                    Placed Candidates ÷ Registered ({uniquePlacedCount}/{regStudentsCount || 0})
                  </span>
                </div>
              </div>

              {/* Department & Program-Wise Placement Performance */}
              <div className="reports-section-wrapper">
                <div className="reports-section-header">
                  <div className="reports-section-title-group">
                    <h4>Department & Program Placement Breakdown</h4>
                    <p>Aggregated from verified candidate profiles and confirmed selections.</p>
                  </div>
                  {departmentStats.length > 0 && (
                    <button 
                      className="btn-export-csv"
                      onClick={handleExportDepartmentCSV}
                      title="Download Department-wise Breakdown CSV"
                    >
                      <Download size={14} />
                      <span>Export Department CSV</span>
                    </button>
                  )}
                </div>

                {departmentStats.length === 0 ? (
                  <div className="empty-state-box compact">
                    <GraduationCap size={32} color="#94A3B8" />
                    <p className="empty-state-text">No departmental candidate data available to aggregate.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="officer-table">
                      <thead>
                        <tr>
                          <th>Program / Degree</th>
                          <th>Branch / Specialization</th>
                          <th>Registered Candidates</th>
                          <th>Placed Offers</th>
                          <th>Seeking Placement</th>
                          <th>Placement Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((item, idx) => (
                          <tr key={`${item.program}-${item.branch}-${idx}`}>
                            <td className="title-text">{item.program}</td>
                            <td>{item.branch}</td>
                            <td><strong>{item.total}</strong></td>
                            <td><span style={{ color: '#059669', fontWeight: 700 }}>{item.placed}</span></td>
                            <td><span style={{ color: '#D97706', fontWeight: 600 }}>{item.seeking}</span></td>
                            <td>
                              <div className="progress-cell-wrap">
                                <div className="progress-track">
                                  <div 
                                    className="progress-fill" 
                                    style={{ width: `${Math.min(Number(item.placementRate), 100)}%` }} 
                                  />
                                </div>
                                <span className="progress-pct-text">{item.placementRate}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Employer / Company Recruitment Outcomes */}
              <div className="reports-section-wrapper">
                <div className="reports-section-header">
                  <div className="reports-section-title-group">
                    <h4>Employer Recruitment Outcomes</h4>
                    <p>Hiring activity, application volumes, and student selections by recruiting organization.</p>
                  </div>
                  {companyStats.length > 0 && (
                    <button 
                      className="btn-export-csv"
                      onClick={handleExportCompanyCSV}
                      title="Download Employer Outcomes CSV"
                    >
                      <Download size={14} />
                      <span>Export Employer CSV</span>
                    </button>
                  )}
                </div>

                {companyStats.length === 0 ? (
                  <div className="empty-state-box compact">
                    <Building2 size={32} color="#94A3B8" />
                    <p className="empty-state-text">No recruiting partners registered yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="officer-table">
                      <thead>
                        <tr>
                          <th>Recruiting Organization</th>
                          <th>Official Representative</th>
                          <th>Approval Status</th>
                          <th>Jobs Posted</th>
                          <th>Applications Received</th>
                          <th>Shortlisted</th>
                          <th>Interviews</th>
                          <th>Confirmed Selections</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyStats.map((comp) => (
                          <tr key={comp.id}>
                            <td className="title-text">{comp.company_name}</td>
                            <td>{comp.recruiter_name}</td>
                            <td>
                              <span className={`status-pill ${comp.approval_status === 'Approved' ? 'pill-completed' : comp.approval_status === 'Pending' ? 'pill-upcoming' : 'pill-rejected'}`}>
                                {comp.approval_status}
                              </span>
                            </td>
                            <td><strong>{comp.jobs_count}</strong></td>
                            <td>{comp.applications_count}</td>
                            <td>{comp.shortlisted_count}</td>
                            <td>{comp.interviews_count}</td>
                            <td>
                              <span style={{ color: comp.selected_count > 0 ? '#059669' : '#64748B', fontWeight: 700 }}>
                                {comp.selected_count}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Salary Package Analysis */}
              <div className="reports-section-wrapper">
                <div className="reports-section-header">
                  <div className="reports-section-title-group">
                    <h4>Salary & Compensation Analysis (LPA)</h4>
                    <p>Annual package metrics computed from approved campus job postings and offer records.</p>
                  </div>
                </div>

                {packageStats.hasData ? (
                  <>
                    <div className="packages-grid">
                      <div className="package-kpi-card">
                        <span className="package-kpi-title">Highest Package Offered</span>
                        <span className="package-kpi-val" style={{ color: '#047857' }}>{packageStats.max} LPA</span>
                        <span className="package-kpi-sub">Maximum annual compensation</span>
                      </div>
                      <div className="package-kpi-card">
                        <span className="package-kpi-title">Average Package</span>
                        <span className="package-kpi-val" style={{ color: '#2563EB' }}>{packageStats.avg} LPA</span>
                        <span className="package-kpi-sub">Across documented job roles</span>
                      </div>
                      <div className="package-kpi-card">
                        <span className="package-kpi-title">Minimum Package</span>
                        <span className="package-kpi-val" style={{ color: '#475569' }}>{packageStats.min} LPA</span>
                        <span className="package-kpi-sub">Base threshold package</span>
                      </div>
                      <div className="package-kpi-card">
                        <span className="package-kpi-title">Package-Disclosed Roles</span>
                        <span className="package-kpi-val">{packageStats.list.length}</span>
                        <span className="package-kpi-sub">Roles with package specified</span>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="officer-table">
                        <thead>
                          <tr>
                            <th>Job Role Title</th>
                            <th>Hiring Organization</th>
                            <th>Offered Package (LPA)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {packageStats.list.slice(0, 8).map((p, pIdx) => (
                            <tr key={pIdx}>
                              <td className="title-text">{p.job_title}</td>
                              <td>{p.company_name}</td>
                              <td><strong>{p.package_lpa} LPA</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="empty-state-box compact" style={{ border: '1px dashed #CBD5E1' }}>
                    <Briefcase size={28} color="#94A3B8" />
                    <p className="empty-state-text" style={{ fontSize: '13.5px' }}>
                      No salary packages have been specified on job postings yet. Package analytics will automatically compute once employers disclose package figures (LPA).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="dashboard-card-panel">
              <div className="notifications-header-row">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Placement Cell Notifications
                  </h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    System alerts and communication log for {officerName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="notifications-filter-pills">
                    <button
                      className={`notif-filter-btn ${notificationFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setNotificationFilter('all')}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      className={`notif-filter-btn ${notificationFilter === 'unread' ? 'active' : ''}`}
                      onClick={() => setNotificationFilter('unread')}
                    >
                      Unread ({unreadNotifsCount})
                    </button>
                  </div>

                  {unreadNotifsCount > 0 && (
                    <button
                      className="btn-mark-all-read"
                      onClick={handleMarkAllNotificationsRead}
                      disabled={markingAllRead}
                      title="Mark all notifications as read"
                    >
                      <CheckCheck size={15} />
                      <span>{markingAllRead ? 'Updating...' : 'Mark All as Read'}</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredNotifications.length === 0 ? (
                <div className="empty-state-box compact">
                  <Bell size={32} color="#94A3B8" />
                  <p className="empty-state-text">
                    {notificationFilter === 'unread' 
                      ? 'You have caught up with all notifications.'
                      : 'No notifications available for your account.'}
                  </p>
                </div>
              ) : (
                <div className="notifications-list">
                  {filteredNotifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`notification-card ${!n.is_read ? 'unread' : ''}`}
                    >
                      <div className="notif-card-header">
                        <div className="notif-title-group">
                          {!n.is_read && (
                            <span 
                              style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: '#10B981', 
                                display: 'inline-block',
                                flexShrink: 0
                              }} 
                            />
                          )}
                          <span className="notif-title">{n.title}</span>
                          <span className="notif-type-tag">
                            {n.notification_type || 'General'}
                          </span>
                        </div>

                        <div className="notif-card-meta">
                          <span className="notif-time">
                            {n.created_at ? new Date(n.created_at).toLocaleString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </span>
                          {!n.is_read ? (
                            <button
                              className="btn-mark-read"
                              onClick={() => handleMarkNotificationRead(n.id)}
                              disabled={markingReadId === n.id}
                              title="Mark as read"
                            >
                              <Check size={13} />
                              <span>{markingReadId === n.id ? 'Saving...' : 'Mark as read'}</span>
                            </button>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11.5px', color: '#94A3B8' }}>
                              <CheckCheck size={13} color="#94A3B8" /> Read
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="notif-message">{n.message}</p>
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
                      Verified placement officer credentials and institutional profile details.
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
                    <span className="info-label">Institution Name</span>
                    <span className="info-val">{institutionName}</span>
                  </div>
                </div>
              </div>

              {/* Security & Change Password Module */}
              <ChangePasswordCard />
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

      {/* Student Detail & Placement Journey Modal */}
      {showStudentModal && (
        <div className="modal-backdrop" onClick={() => setShowStudentModal(false)}>
          <div className="drive-modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GraduationCap size={24} color="#10B981" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>
                    {selectedStudentDetail?.full_name || 'Student Placement Profile'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Register Number: <strong>{selectedStudentDetail?.register_number || 'N/A'}</strong>
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowStudentModal(false)}>
                <X size={20} />
              </button>
            </div>

            {loadingStudentDetail ? (
              <div className="empty-state-box" style={{ border: 'none', background: 'transparent', padding: '40px' }}>
                <Sparkles size={28} className="spin-gear-icon" color="#10B981" />
                <p>Loading candidate placement journey & history...</p>
              </div>
            ) : selectedStudentDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Academic & Contact Header Summary */}
                <div className="dashboard-card-panel" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                  <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', background: 'transparent', padding: 0, border: 'none' }}>
                    <div className="info-item">
                      <span className="info-label">Program & Branch</span>
                      <span className="info-val">{selectedStudentDetail.current_education?.program} ({selectedStudentDetail.current_education?.branch})</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">CGPA / Backlogs</span>
                      <span className="info-val">{selectedStudentDetail.current_education?.cgpa || 'N/A'} CGPA ({selectedStudentDetail.current_education?.active_backlogs || 0} Backlogs)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email & Contact</span>
                      <span className="info-val">{selectedStudentDetail.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Profile Completion</span>
                      <span className="info-val">{selectedStudentDetail.profile_completion || 0}%</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Institution</span>
                      <span className="info-val">{selectedStudentDetail.institution_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Resume Status</span>
                      <div>
                        {selectedStudentDetail.has_resume ? (
                          <span className="status-pill pill-completed">Uploaded</span>
                        ) : (
                          <span className="status-pill pill-ongoing">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Placement Timeline */}
                <div className="dashboard-card-panel" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#10B981" />
                    Student Placement Progress & History
                  </h4>
                  {selectedStudentDetail.timeline?.length === 0 ? (
                    <p style={{ fontSize: '13.5px', color: '#64748B' }}>No placement history recorded.</p>
                  ) : (
                    <div className="placement-timeline">
                      {selectedStudentDetail.timeline?.map((evt, idx) => (
                        <div key={idx} className="timeline-item">
                          <div className={`timeline-dot dot-${evt.type}`} />
                          <div className="timeline-header">
                            <span className="timeline-title">{evt.title}</span>
                            <span className="timeline-date">{evt.date}</span>
                          </div>
                          <span className="timeline-desc">{evt.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Candidate Applications & Interview Records */}
                <div className="dashboard-card-panel" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#10B981" />
                    Submitted Applications & Interview Details ({selectedStudentDetail.applications?.length || 0})
                  </h4>
                  {selectedStudentDetail.applications?.length === 0 ? (
                    <p style={{ fontSize: '13.5px', color: '#64748B' }}>Student has not submitted any job applications yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedStudentDetail.applications?.map(app => (
                        <div key={app.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '15px', color: '#0F172A' }}>{app.job_title}</strong>
                              <span style={{ fontSize: '13px', color: '#64748B', marginLeft: '8px' }}>at {app.company_name}</span>
                            </div>
                            <span className={`status-pill pill-${app.application_status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {app.application_status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '12px' }}>
                            Applied Date: <strong>{app.applied_at}</strong> | Location: <strong>{app.location || 'Remote'}</strong> | Package: <strong>{app.package_lpa ? `${app.package_lpa} LPA` : 'Competitive'}</strong>
                          </div>

                          {/* Interviews attached to this application */}
                          {app.interviews && app.interviews.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>Scheduled Interview Rounds:</span>
                              {app.interviews.map(inv => (
                                <div key={inv.id} style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span className={inv.interview_type === 'Technical Interview' ? 'badge-tech-interview' : 'badge-hr-interview'}>
                                        {inv.interview_type}
                                      </span>
                                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{inv.interview_date} at {inv.interview_time}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                                      Mode: <strong>{inv.mode}</strong> | Venue/Link: <strong>{inv.location_or_link}</strong> | Duration: {inv.duration_minutes} mins
                                    </div>
                                  </div>
                                  <span className={`status-pill pill-${inv.status.toLowerCase()}`}>{inv.status}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', marginTop: '4px' }}>
                              Interview Not Scheduled yet.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-modal-cancel" onClick={() => setShowStudentModal(false)}>
                    Close Profile
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#EF4444' }}>Student profile details unavailable.</p>
            )}
          </div>
        </div>
      )}

      {/* Recruiter / Company Details Review Modal */}
      {showRecruiterModal && (
        <div className="modal-backdrop" onClick={() => setShowRecruiterModal(false)}>
          <div className="drive-modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building2 size={24} color="#10B981" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>
                    {selectedRecruiterDetail?.company_name || 'Company Details'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Recruiter & Employer Profile Review
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowRecruiterModal(false)}>
                <X size={20} />
              </button>
            </div>

            {loadingRecruiterDetail ? (
              <div className="empty-state-box" style={{ border: 'none', background: 'transparent', padding: '40px' }}>
                <Sparkles size={28} className="spin-gear-icon" color="#10B981" />
                <p>Loading complete company details...</p>
              </div>
            ) : selectedRecruiterDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Status Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F8FAFC',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Verification Status:</span>
                    <span className={`status-pill pill-${(selectedRecruiterDetail.approval_status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedRecruiterDetail.approval_status || 'Pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                    Registered On: <strong>{selectedRecruiterDetail.created_at || 'N/A'}</strong>
                  </div>
                </div>

                {/* Overview */}
                <div className="dashboard-card-panel" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="#10B981" />
                    Company & Contact Lead Information
                  </h4>
                  <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: 'transparent', padding: 0, border: 'none' }}>
                    <div className="info-item">
                      <span className="info-label">Company Name</span>
                      <span className="info-val">{selectedRecruiterDetail.company_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">HR Contact Person</span>
                      <span className="info-val">{selectedRecruiterDetail.recruiter_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Designation</span>
                      <span className="info-val">{selectedRecruiterDetail.designation || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Official Work Email</span>
                      <span className="info-val">{selectedRecruiterDetail.official_email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mobile Number</span>
                      <span className="info-val">{selectedRecruiterDetail.mobile_number || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Expected Hiring Volume</span>
                      <span className="info-val">{selectedRecruiterDetail.hiring_volume || '10-50'}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Engagement Metrics */}
                <div className="dashboard-card-panel" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={16} color="#10B981" />
                    Institutional Candidate Engagement Metrics
                  </h4>
                  <div className="placement-overview-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 0, padding: '12px' }}>
                    <div className="overview-metric">
                      <span className="metric-val">{selectedRecruiterDetail.posted_jobs_count || 0}</span>
                      <span className="metric-lbl">Jobs Posted</span>
                    </div>
                    <div className="overview-metric">
                      <span className="metric-val">{selectedRecruiterDetail.applications_count || 0}</span>
                      <span className="metric-lbl">Applications</span>
                    </div>
                    <div className="overview-metric">
                      <span className="metric-val">{selectedRecruiterDetail.shortlisted_count || 0}</span>
                      <span className="metric-lbl">Shortlisted</span>
                    </div>
                    <div className="overview-metric">
                      <span className="metric-val">{selectedRecruiterDetail.selected_count || 0}</span>
                      <span className="metric-lbl">Selected</span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <button type="button" className="btn-modal-cancel" onClick={() => setShowRecruiterModal(false)}>
                    Close Review
                  </button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedRecruiterDetail.approval_status !== 'Approved' && (
                      <button
                        className="btn-approve-sm"
                        style={{ padding: '10px 18px', fontSize: '13.5px' }}
                        disabled={actionLoadingId === `recruiter-${selectedRecruiterDetail.id}`}
                        onClick={async () => {
                          await handleUpdateRecruiterApproval(selectedRecruiterDetail.id, 'Approved');
                          setSelectedRecruiterDetail(prev => prev ? { ...prev, approval_status: 'Approved', is_verified: true } : null);
                        }}
                      >
                        Approve Company
                      </button>
                    )}
                    {selectedRecruiterDetail.approval_status !== 'Rejected' && (
                      <button
                        className="btn-reject-sm"
                        style={{ padding: '10px 18px', fontSize: '13.5px' }}
                        disabled={actionLoadingId === `recruiter-${selectedRecruiterDetail.id}`}
                        onClick={async () => {
                          await handleUpdateRecruiterApproval(selectedRecruiterDetail.id, 'Rejected');
                          setSelectedRecruiterDetail(prev => prev ? { ...prev, approval_status: 'Rejected', is_verified: false } : null);
                        }}
                      >
                        Reject Company
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#EF4444' }}>Recruiter details unavailable.</p>
            )}
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showAppModal && selectedAppDetail && (
        <div className="modal-backdrop" onClick={() => setShowAppModal(false)}>
          <div className="drive-modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>
                  Application Details — {selectedAppDetail.job_title || selectedAppDetail.job_detail?.job_title}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Candidate: <strong>{selectedAppDetail.student_name || selectedAppDetail.student_detail?.first_name}</strong> ({selectedAppDetail.register_number || 'N/A'})
                </p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowAppModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', background: '#F8FAFC' }}>
                <div className="info-item">
                  <span className="info-label">Company / Employer</span>
                  <span className="info-val">{selectedAppDetail.company_name || selectedAppDetail.job_detail?.recruiter_detail?.company_name || 'Employer'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Application Date</span>
                  <span className="info-val">{selectedAppDetail.applied_at ? new Date(selectedAppDetail.applied_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Application Status</span>
                  <div>
                    <span className={`status-pill pill-${(selectedAppDetail.status || selectedAppDetail.application_status || 'Applied').toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedAppDetail.status || selectedAppDetail.application_status || 'Applied'}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Package (LPA)</span>
                  <span className="info-val">{selectedAppDetail.job_detail?.package_lpa ? `${selectedAppDetail.job_detail.package_lpa} LPA` : 'Competitive'}</span>
                </div>
              </div>

              {/* Scheduled Interviews Box */}
              <div className="dashboard-card-panel" style={{ padding: '16px', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#0F172A' }}>Interview Rounds & Status</h4>
                {selectedAppDetail.interviews && selectedAppDetail.interviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedAppDetail.interviews.map(inv => (
                      <div key={inv.id} style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className={inv.interview_type === 'Technical Interview' ? 'badge-tech-interview' : 'badge-hr-interview'}>
                            {inv.interview_type}
                          </span>
                          <span className={`status-pill pill-${inv.status.toLowerCase()}`}>{inv.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>
                          {inv.interview_date} at {inv.interview_time} ({inv.duration_minutes} mins)
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
                          Mode: <strong>{inv.mode}</strong> | Venue/Link: <span className="meeting-link-box">{inv.location_or_link || 'Pending'}</span>
                        </div>
                        {inv.instructions && (
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', fontStyle: 'italic' }}>
                            Instructions: {inv.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#64748B', padding: '10px', background: '#F8FAFC', borderRadius: '6px' }}>
                    Interview Not Scheduled. Candidate is currently in state <strong>{selectedAppDetail.status || selectedAppDetail.application_status}</strong>.
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAppModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Detail Modal */}
      {showInterviewModal && selectedInterviewDetail && (
        <div className="modal-backdrop" onClick={() => setShowInterviewModal(false)}>
          <div className="drive-modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={selectedInterviewDetail.interview_type === 'Technical Interview' ? 'badge-tech-interview' : 'badge-hr-interview'}>
                  {selectedInterviewDetail.interview_type}
                </span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '20px' }}>
                  {selectedInterviewDetail.candidate_name}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Register Number: <strong>{selectedInterviewDetail.register_number || 'N/A'}</strong>
                </p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowInterviewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', background: '#F8FAFC' }}>
                <div className="info-item">
                  <span className="info-label">Company Name</span>
                  <span className="info-val">{selectedInterviewDetail.company_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Applied Role</span>
                  <span className="info-val">{selectedInterviewDetail.job_title}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Scheduled Date</span>
                  <span className="info-val">{selectedInterviewDetail.interview_date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Scheduled Time & Duration</span>
                  <span className="info-val">{selectedInterviewDetail.interview_time} ({selectedInterviewDetail.duration_minutes} mins)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Interview Mode</span>
                  <span className="info-val">{selectedInterviewDetail.mode}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Interview Status</span>
                  <div>
                    <span className={`status-pill pill-${selectedInterviewDetail.status.toLowerCase()}`}>
                      {selectedInterviewDetail.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>Venue / Meeting Link:</span>
                <span style={{ fontSize: '14px', color: '#1E3A8A', wordBreak: 'break-all', fontWeight: 600 }}>
                  {selectedInterviewDetail.location_or_link || 'Details pending from recruiter.'}
                </span>
              </div>

              {selectedInterviewDetail.instructions && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Instructions:</span>
                  <span style={{ fontSize: '13.5px', color: '#1E293B' }}>
                    {selectedInterviewDetail.instructions}
                  </span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowInterviewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showJobModal && selectedJobDetail && (
        <div className="modal-backdrop" onClick={() => setShowJobModal(false)}>
          <div className="drive-modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>
                  {selectedJobDetail.job_title}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Employer: <strong>{selectedJobDetail.company_name}</strong>
                </p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowJobModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="company-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', background: '#F8FAFC' }}>
                <div className="info-item">
                  <span className="info-label">Package (LPA)</span>
                  <span className="info-val">{selectedJobDetail.package_lpa ? `${selectedJobDetail.package_lpa} LPA` : 'Competitive'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location / Work Mode</span>
                  <span className="info-val">{selectedJobDetail.location} ({selectedJobDetail.work_mode || 'N/A'})</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Application Deadline</span>
                  <span className="info-val">{selectedJobDetail.application_deadline || 'Open'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Job Approval Status</span>
                  <div>
                    <span className={`status-pill pill-${(selectedJobDetail.status || 'Pending Approval').toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedJobDetail.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="placement-overview-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 0, padding: '12px' }}>
                <div className="overview-metric">
                  <span className="metric-val">{selectedJobDetail.applications_count || 0}</span>
                  <span className="metric-lbl">Applications</span>
                </div>
                <div className="overview-metric">
                  <span className="metric-val">{selectedJobDetail.shortlisted_count || 0}</span>
                  <span className="metric-lbl">Shortlisted</span>
                </div>
                <div className="overview-metric">
                  <span className="metric-val">{selectedJobDetail.interviews_count || 0}</span>
                  <span className="metric-lbl">Interviews</span>
                </div>
                <div className="overview-metric">
                  <span className="metric-val">{selectedJobDetail.selected_count || 0}</span>
                  <span className="metric-lbl">Selected</span>
                </div>
              </div>

              {selectedJobDetail.job_description && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Job Description:</span>
                  <span style={{ fontSize: '13.5px', color: '#1E293B', whiteSpace: 'pre-line' }}>
                    {selectedJobDetail.job_description}
                  </span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowJobModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
