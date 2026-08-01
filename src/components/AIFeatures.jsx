import React from 'react';
import { GraduationCap, UserCheck, BarChart3, FileCheck, ShieldAlert, Calendar, Users, Shield } from 'lucide-react';
import './AIFeatures.css';

export default function AIFeatures({ role = 'officer' }) {
  const isRecruiter = role === 'recruiter';
  const isOfficer = role === 'officer';

  const featuresStudent = [
    {
      id: 1,
      title: 'AI Resume Analyzer',
      desc: 'Extracts key skills and evaluates candidate potential.',
      icon: <GraduationCap size={24} />,
      colorClass: 'feat-green'
    },
    {
      id: 2,
      title: 'Smart Candidate Matching',
      desc: 'Matches candidates with the most relevant job opportunities.',
      icon: <UserCheck size={24} />,
      colorClass: 'feat-purple'
    },
    {
      id: 3,
      title: 'Placement Analytics',
      desc: 'Real-time dashboards and insights for better decision making.',
      icon: <BarChart3 size={24} />,
      colorClass: 'feat-blue'
    },
    {
      id: 4,
      title: 'Automated Shortlisting',
      desc: 'AI automatically shortlists the best candidates for recruiters.',
      icon: <FileCheck size={24} />,
      colorClass: 'feat-orange'
    },
    {
      id: 5,
      title: 'Fraud & Plagiarism Detection',
      desc: 'Ensures authenticity and integrity of resumes and documents.',
      icon: <ShieldAlert size={24} />,
      colorClass: 'feat-red'
    }
  ];

  const featuresRecruiter = [
    {
      id: 1,
      title: 'AI Resume Analyzer',
      desc: 'Extracts key skills and evaluates candidate potential.',
      icon: <GraduationCap size={24} />,
      colorClass: 'feat-green'
    },
    {
      id: 2,
      title: 'Smart Candidate Matching',
      desc: 'Matches candidates with the most relevant job opportunities.',
      icon: <UserCheck size={24} />,
      colorClass: 'feat-purple'
    },
    {
      id: 3,
      title: 'Candidate Ranking',
      desc: 'AI ranks candidates based on skills, experience, and role fit.',
      icon: <BarChart3 size={24} />,
      colorClass: 'feat-blue'
    },
    {
      id: 4,
      title: 'Automated Shortlisting',
      desc: 'Automatically shortlists the best candidates for recruiters.',
      icon: <FileCheck size={24} />,
      colorClass: 'feat-orange'
    },
    {
      id: 5,
      title: 'Diversity & Inclusion',
      desc: 'Build diverse teams with bias-free and inclusive hiring.',
      icon: <ShieldAlert size={24} />,
      colorClass: 'feat-red'
    }
  ];

  const featuresOfficer = [
    {
      id: 1,
      title: 'Student Verification',
      desc: 'Verify student eligibility and documents securely.',
      icon: <GraduationCap size={24} />,
      colorClass: 'feat-green'
    },
    {
      id: 2,
      title: 'Drive Management',
      desc: 'Create, manage, and track placement drives effortlessly.',
      icon: <Calendar size={24} />,
      colorClass: 'feat-purple'
    },
    {
      id: 3,
      title: 'Placement Analytics',
      desc: 'Real-time analytics and reports for data-driven decisions.',
      icon: <BarChart3 size={24} />,
      colorClass: 'feat-blue'
    },
    {
      id: 4,
      title: 'Student Shortlisting',
      desc: 'Shortlist students based on skills, criteria, and company needs.',
      icon: <Users size={24} />,
      colorClass: 'feat-orange'
    },
    {
      id: 5,
      title: 'Compliance & Security',
      desc: 'Ensure data security, compliance, and privacy at every step.',
      icon: <ShieldAlert size={24} />,
      colorClass: 'feat-red'
    }
  ];

  const currentFeatures = isOfficer ? featuresOfficer : isRecruiter ? featuresRecruiter : featuresStudent;

  return (
    <section className="ai-features-section">
      <div className="container">
        {/* Header Badge */}
        <div className="text-center">
          <div className="section-tag-sparkles">
            <span className="sparkle-diamond">✨</span>
            <span className="section-tag-text">AI-Powered Features</span>
            <span className="sparkle-diamond">✨</span>
          </div>
        </div>

        {/* 5-Cards Grid */}
        <div className="ai-features-grid">
          {currentFeatures.map((feat) => (
            <div className="ai-feature-card" key={feat.id}>
              <div className={`feature-icon-tile ${feat.colorClass}`}>
                {feat.icon}
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
