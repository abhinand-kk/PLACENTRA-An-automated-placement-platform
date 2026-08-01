import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import './Testimonials.css';

export default function Testimonials({ role = 'officer' }) {
  const isRecruiter = role === 'recruiter';
  const isOfficer = role === 'officer';

  const testimonialsStudent = [
    {
      id: 1,
      name: 'Arun Raj',
      role: 'B.Tech CSE, AJCE',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      text: 'PLACENTRA made applying for jobs so easy. The AI resume analysis helped me improve my profile and crack interviews.',
      stars: 5
    },
    {
      id: 2,
      name: 'Priya Menon',
      role: 'HR Manager, TCS',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      text: 'As a recruiter, PLACENTRA saves us hours of screening. The AI matching is accurate and very efficient.',
      stars: 5
    },
    {
      id: 3,
      name: 'Mr. James Varghese',
      role: 'Placement Officer, Saintgits',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      text: 'Managing placements has never been this simple. Analytics and automation help us achieve better results every year.',
      stars: 5
    }
  ];

  const testimonialsRecruiter = [
    {
      id: 1,
      name: 'Rahul Mehta',
      role: 'HR Manager, TCS',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      text: 'PLACENTRA helps us discover top student talent efficiently. The AI matching saves us time and brings the right candidates.',
      stars: 5
    },
    {
      id: 2,
      name: 'Neha Sharma',
      role: 'Talent Acquisition, Accenture',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      text: 'The platform makes campus hiring seamless. We get highly relevant candidates, ranked perfectly for our roles.',
      stars: 5
    },
    {
      id: 3,
      name: 'Arjun Nair',
      role: 'HR Lead, Wipro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      text: 'A powerful platform for recruiters. The analytics and AI insights help us make better hiring decisions every single time.',
      stars: 5
    }
  ];

  const testimonialsOfficer = [
    {
      id: 1,
      name: 'Dr. Anitha Nair',
      role: 'Placement Officer, Marian College',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      text: 'PLACENTRA has simplified our placement process. Everything from drive management to result analysis is now so easy.',
      stars: 5
    },
    {
      id: 2,
      name: 'Arun Kumar',
      role: 'Placement Officer, Rajagiri',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      text: 'The analytics and reports help us make better decisions and improve placement outcomes every year.',
      stars: 5
    },
    {
      id: 3,
      name: 'Sneha Joseph',
      role: 'Training & Placement, Amal Jyothi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      text: 'A complete solution for placement officers. Saves time, ensures transparency, and improves student success.',
      stars: 5
    }
  ];

  const currentList = isOfficer ? testimonialsOfficer : isRecruiter ? testimonialsRecruiter : testimonialsStudent;
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section className="testimonials-section">
      <div className="container testimonials-container">
        {/* Navigation Left Button */}
        <button className="nav-arrow nav-prev" aria-label="Previous Testimonial">
          <ChevronLeft size={20} />
        </button>

        {/* 3 Testimonial Cards */}
        <div className="testimonials-grid">
          {currentList.map((item, idx) => (
            <div 
              className={`testimonial-card ${idx === activeIndex ? 'active-card' : ''}`} 
              key={item.id}
            >
              <div className="card-top-row">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="user-avatar-img"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.name) + '&background=0D9488&color=fff';
                  }}
                />
                <div className="testimonial-text-box">
                  <p className="testimonial-quote">"{item.text}"</p>
                </div>
              </div>

              <div className="card-bottom-row">
                <div className="user-info">
                  <div className="user-name">{item.name}</div>
                  <div className="user-role">{item.role}</div>
                </div>
                <div className="star-rating">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star size={14} key={i} fill="#10B981" color="#10B981" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Right Button */}
        <button className="nav-arrow nav-next" aria-label="Next Testimonial">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="pagination-dots">
        <span className="dot"></span>
        <span className="dot active-dot"></span>
        <span className="dot"></span>
      </div>
    </section>
  );
}
