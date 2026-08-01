import React from 'react';
import { User, FileEdit, Cpu, Target, Users, Calendar, Trophy, FileCheck, Megaphone, BarChart2 } from 'lucide-react';
import './HowItWorks.css';

export default function HowItWorks({ role = 'officer' }) {
  const isRecruiter = role === 'recruiter';
  const isOfficer = role === 'officer';

  const stepsTopStudent = [
    {
      num: '01',
      icon: <User size={24} className="node-icon-svg" />,
      title: 'Register',
      desc: 'Create your account as student, recruiter, or placement officer.'
    },
    {
      num: '02',
      icon: <FileEdit size={24} className="node-icon-svg" />,
      title: 'Complete Profile',
      desc: 'Fill in details and upload resume (for students) or company info.'
    },
    {
      num: '03',
      icon: <Cpu size={24} className="node-icon-svg" />,
      title: 'AI Processing',
      desc: 'Our AI analyzes resumes, skills, and requirements in real-time.'
    },
    {
      num: '04',
      icon: <Target size={24} className="node-icon-svg" />,
      title: 'Smart Matching',
      desc: 'Best matches are suggested to recruiters and students.'
    }
  ];

  const stepsBottomStudent = [
    {
      num: '05',
      icon: <Users size={24} className="node-icon-svg" />,
      title: 'Apply & Shortlist',
      desc: 'Students apply, recruiters shortlist the most suitable candidates.'
    },
    {
      num: '06',
      icon: <Calendar size={24} className="node-icon-svg" />,
      title: 'Interview',
      desc: 'Schedule interviews seamlessly within the platform.'
    },
    {
      num: '07',
      icon: <Trophy size={24} className="node-icon-svg" />,
      title: 'Placement Success',
      desc: 'Successful placements and brighter careers ahead!'
    }
  ];

  const stepsTopRecruiter = [
    {
      num: '01',
      icon: <User size={24} className="node-icon-svg" />,
      title: 'Register',
      desc: 'Create your recruiter account and complete company profile.'
    },
    {
      num: '02',
      icon: <FileEdit size={24} className="node-icon-svg" />,
      title: 'Post Opportunities',
      desc: 'Create job openings and define role requirements.'
    },
    {
      num: '03',
      icon: <Cpu size={24} className="node-icon-svg" />,
      title: 'AI Screening',
      desc: 'Our AI analyzes applications and ranks the best candidates.'
    },
    {
      num: '04',
      icon: <Target size={24} className="node-icon-svg" />,
      title: 'Shortlist Candidates',
      desc: 'Review AI-ranked profiles and shortlist the most suitable talent.'
    }
  ];

  const stepsBottomRecruiter = [
    {
      num: '05',
      icon: <Calendar size={24} className="node-icon-svg" />,
      title: 'Schedule & Conduct',
      desc: 'Schedule interviews and conduct assessments seamlessly.'
    },
    {
      num: '06',
      icon: <FileCheck size={24} className="node-icon-svg" />,
      title: 'Make Offer',
      desc: 'Select the best candidate and extend offer with ease.'
    },
    {
      num: '07',
      icon: <Trophy size={24} className="node-icon-svg" />,
      title: 'Successful Hiring',
      desc: 'Onboard top talent and build your future workforce.'
    }
  ];

  const stepsTopOfficer = [
    {
      num: '01',
      icon: <User size={24} className="node-icon-svg" />,
      title: 'Verify Students',
      desc: 'Verify and approve student profiles and documents.'
    },
    {
      num: '02',
      icon: <Calendar size={24} className="node-icon-svg" />,
      title: 'Create Drive',
      desc: 'Create and schedule placement drives.'
    },
    {
      num: '03',
      icon: <Megaphone size={24} className="node-icon-svg" />,
      title: 'Invite Recruiters',
      desc: 'Invite companies and manage registrations.'
    },
    {
      num: '04',
      icon: <Users size={24} className="node-icon-svg" />,
      title: 'Shortlist & Select',
      desc: 'Review shortlisted students and track selections.'
    }
  ];

  const stepsBottomOfficer = [
    {
      num: '05',
      icon: <Calendar size={24} className="node-icon-svg" />,
      title: 'Conduct Drive',
      desc: 'Conduct recruitment drive and monitor progress.'
    },
    {
      num: '06',
      icon: <BarChart2 size={24} className="node-icon-svg" />,
      title: 'Analyze & Report',
      desc: 'Get insights and generate placement reports.'
    },
    {
      num: '07',
      icon: <Trophy size={24} className="node-icon-svg" />,
      title: 'Placement Success',
      desc: 'Track offers, placements, and final results.'
    }
  ];

  const stepsTop = isOfficer ? stepsTopOfficer : isRecruiter ? stepsTopRecruiter : stepsTopStudent;
  const stepsBottom = isOfficer ? stepsBottomOfficer : isRecruiter ? stepsBottomRecruiter : stepsBottomStudent;

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        {/* Section Header */}
        <div className="text-center">
          <div className="section-tag-sparkles">
            <span className="sparkle-diamond">✨</span>
            <span className="section-tag-text">How PLACENTRA Works</span>
            <span className="sparkle-diamond">✨</span>
          </div>
        </div>

        {/* Serpentine 7-Step Container */}
        <div className="timeline-serpentine-wrapper">
          {/* Top Row: Steps 01 to 04 */}
          <div className="timeline-row row-top">
            {stepsTop.map((step, index) => (
              <div className="timeline-node" key={step.num}>
                <div className="node-icon-container">
                  <span className="step-num-badge">{step.num}</span>
                  <div className="node-circle-icon">
                    {step.icon}
                  </div>
                </div>
                <h3 className="node-title">{step.title}</h3>
                <p className="node-desc">{step.desc}</p>
                
                {/* Arrow line to next node in row 1 */}
                {index < stepsTop.length - 1 && (
                  <div className="connector-arrow-line">
                    <span className="dashed-line"></span>
                    <span className="arrow-head-right">▸</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loop Connector Curve from Step 04 to Step 05 */}
          <div className="loop-curve-right">
            <svg viewBox="0 0 100 140" fill="none" className="curve-svg">
              <path 
                d="M 10 15 C 95 15, 95 125, 10 125" 
                stroke="#6EE7B7" 
                strokeWidth="2.5" 
                strokeDasharray="4 4"
              />
              <path d="M 18 120 L 5 125 L 18 130" fill="none" stroke="#10B981" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Bottom Row: Steps 05 to 07 (Right to Left flow) */}
          <div className="timeline-row row-bottom">
            {stepsBottom.map((step, index) => (
              <div className="timeline-node" key={step.num}>
                <div className="node-icon-container">
                  <span className="step-num-badge">{step.num}</span>
                  <div className="node-circle-icon">
                    {step.icon}
                  </div>
                </div>
                <h3 className="node-title">{step.title}</h3>
                <p className="node-desc">{step.desc}</p>
                
                {/* Arrow line to next node (Left direction) */}
                {index < stepsBottom.length - 1 && (
                  <div className="connector-arrow-line arrow-line-left">
                    <span className="dashed-line"></span>
                    <span className="arrow-head-left">◂</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
