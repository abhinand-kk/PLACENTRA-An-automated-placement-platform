import React from 'react';
import { User, Cpu, Target, Building2, Trophy } from 'lucide-react';
import './PlacementJourney.css';

export default function PlacementJourney({ role = 'officer' }) {
  const isRecruiter = role === 'recruiter';
  const isOfficer = role === 'officer';

  const stepsStudent = [
    {
      id: 1,
      icon: <User size={24} className="journey-icon icon-teal" />,
      bgClass: 'bg-teal',
      title: 'Students',
      description: 'Build profile and upload resume'
    },
    {
      id: 2,
      icon: <Cpu size={24} className="journey-icon icon-green" />,
      bgClass: 'bg-green',
      title: 'AI Analysis',
      description: 'Smart resume parsing and skill evaluation'
    },
    {
      id: 3,
      icon: <Target size={24} className="journey-icon icon-purple" />,
      bgClass: 'bg-purple',
      title: 'Smart Matching',
      description: 'AI matches with the right opportunities'
    },
    {
      id: 4,
      icon: <Building2 size={24} className="journey-icon icon-blue" />,
      bgClass: 'bg-blue',
      title: 'Recruiters',
      description: 'Shortlist and connect with best talent'
    },
    {
      id: 5,
      icon: <Trophy size={24} className="journey-icon icon-orange" />,
      bgClass: 'bg-orange',
      title: 'Placement Success',
      description: 'Students get placed and build their future'
    }
  ];

  const stepsRecruiter = [
    {
      id: 1,
      icon: <User size={24} className="journey-icon icon-teal" />,
      bgClass: 'bg-teal',
      title: 'Students',
      description: 'Build profile and apply'
    },
    {
      id: 2,
      icon: <Cpu size={24} className="journey-icon icon-green" />,
      bgClass: 'bg-green',
      title: 'AI Analysis',
      description: 'Smart resume parsing and skill evaluation'
    },
    {
      id: 3,
      icon: <Target size={24} className="journey-icon icon-purple" />,
      bgClass: 'bg-purple',
      title: 'Smart Matching',
      description: 'AI matches with the right opportunities'
    },
    {
      id: 4,
      icon: <Building2 size={24} className="journey-icon icon-blue" />,
      bgClass: 'bg-blue',
      title: 'Recruiters',
      description: 'Shortlist and connect with best talent'
    },
    {
      id: 5,
      icon: <Trophy size={24} className="journey-icon icon-orange" />,
      bgClass: 'bg-orange',
      title: 'Successful Hiring',
      description: 'Hire top talent and build great teams'
    }
  ];

  const stepsOfficer = [
    {
      id: 1,
      icon: <User size={24} className="journey-icon icon-teal" />,
      bgClass: 'bg-teal',
      title: 'Students',
      description: 'Students register and build their profile'
    },
    {
      id: 2,
      icon: <Cpu size={24} className="journey-icon icon-green" />,
      bgClass: 'bg-green',
      title: 'AI Analysis',
      description: 'AI analyzes skills and career potential'
    },
    {
      id: 3,
      icon: <Target size={24} className="journey-icon icon-purple" />,
      bgClass: 'bg-purple',
      title: 'Smart Matching',
      description: 'Matches students with the right opportunities'
    },
    {
      id: 4,
      icon: <Building2 size={24} className="journey-icon icon-blue" />,
      bgClass: 'bg-blue',
      title: 'Recruiters',
      description: 'Recruiters connect and shortlist talent'
    },
    {
      id: 5,
      icon: <Trophy size={24} className="journey-icon icon-orange" />,
      bgClass: 'bg-orange',
      title: 'Placement Success',
      description: 'Successful placements and brighter futures'
    }
  ];

  const currentSteps = isOfficer ? stepsOfficer : isRecruiter ? stepsRecruiter : stepsStudent;

  return (
    <section className="journey-section">
      <div className="container">
        {/* Section Heading */}
        <h2 className="journey-title">
          One Platform. Every{' '}
          <span className="text-green">
            {isRecruiter ? 'Recruitment Journey.' : 'Placement Journey.'}
          </span>
        </h2>

        {/* 5-Step Process Row */}
        <div className="journey-flow-wrapper">
          {currentSteps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="journey-step-card">
                <div className={`journey-icon-circle ${step.bgClass}`}>
                  {step.icon}
                </div>
                <h3 className="journey-step-title">{step.title}</h3>
                <p className="journey-step-desc">{step.description}</p>
              </div>

              {/* Connecting arrow connector line */}
              {idx < currentSteps.length - 1 && (
                <div className="journey-connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow">›</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
