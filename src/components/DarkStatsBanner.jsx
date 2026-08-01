import React from 'react';
import { Users, Building2, GraduationCap, TrendingUp, FileText } from 'lucide-react';
import './DarkStatsBanner.css';

export default function DarkStatsBanner() {
  const stats = [
    {
      id: 1,
      icon: <Users size={24} />,
      number: '50K+',
      label: 'Students Registered'
    },
    {
      id: 2,
      icon: <Building2 size={24} />,
      number: '500+',
      label: 'Recruiting Companies'
    },
    {
      id: 3,
      icon: <GraduationCap size={24} />,
      number: '100+',
      label: 'Partner Universities'
    },
    {
      id: 4,
      icon: <TrendingUp size={24} />,
      number: '95%',
      label: 'Placement Success Rate'
    },
    {
      id: 5,
      icon: <FileText size={24} />,
      number: '2M+',
      label: 'Resumes Analyzed'
    }
  ];

  return (
    <section className="dark-stats-banner">
      <div className="container">
        <div className="dark-stats-wrapper">
          {stats.map((item) => (
            <div className="dark-stat-item" key={item.id}>
              <div className="dark-stat-icon">{item.icon}</div>
              <div className="dark-stat-info">
                <div className="dark-stat-number">{item.number}</div>
                <div className="dark-stat-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
