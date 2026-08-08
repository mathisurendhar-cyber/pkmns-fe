'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import './about.css';

type Bearer = { id: number; name: string; role: string; image_url: string };

const ACTIVITIES = [
  { icon: '🏗️', title: 'Infrastructure Development', desc: 'Road construction, repairs and public infrastructure upgrades.' },
  { icon: '💡', title: 'Streetlight & Drainage', desc: 'Lighting maintenance and proper drainage systems.' },
  { icon: '🌱', title: 'Cleanliness & Greenery', desc: 'Clean drives and tree plantation initiatives.' },
  { icon: '🛡️', title: 'Safety & Neighborhood Watch', desc: 'Community safety awareness and monitoring programs.' },
  { icon: '🎉', title: 'Cultural & Social Events', desc: 'Festivals, meetings and social celebrations.' },
  { icon: '🤝', title: 'Community Welfare', desc: "Support programs for people's well-being." },
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bearers, setBearers] = useState<Bearer[]>([]);

  useEffect(() => {
    fetch('/api/office-bearers')
      .then((r) => r.json())
      .then((data) => setBearers(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="about-page">
      <header>
        <div className="header-container">
          <div className="brand-flex">
            <img src="/img/logo.png" alt="Logo" />
            <span>Sri AmbalNagar Makkal Nalvazhu Sangam</span>
          </div>
          <nav>
            <ul id="navMenu" className={menuOpen ? 'show' : ''}>
              <Link href="/">Home</Link>
              <Link href="/about">About Us</Link>
              <Link href="/members">Members</Link>
              <Link href="/events">Events</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/login">Login</Link>
            </ul>
          </nav>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-text">
          <h1>About Our Community</h1>
          <p>
            Bringing our neighborhood together for a future of shared happiness
            and progress.
          </p>
        </div>
      </section>

      <section className="mission-join-section">
        <div className="mission-card">
          <h3>Our Mission</h3>
          <p>
            To create a lively, safe, and connected neighborhood where every
            individual and family flourish through unity and care.
          </p>
        </div>
        <div
          className="join-card"
          onClick={() => (window.location.href = '/membership')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') window.location.href = '/membership';
          }}
        >
          <h3>Join Us</h3>
          <p>
            Become part of our dynamic community. Your participation builds a
            stronger, happier neighborhood for all.
          </p>
        </div>
      </section>

      <section className="bearers-section">
        <h2 className="bearers-title">Office Bearers</h2>
        <div className="float-grid">
          {bearers.map((b) => (
            <div className="float-card" key={b.id}>
              <img src={b.image_url} alt={b.name} />
              <div className="float-card-name">{b.name}</div>
              <div className="float-card-role">{b.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="activities-section">
        <h2 className="activities-title">Activities</h2>
        <div className="activities-timeline">
          {ACTIVITIES.map((a) => (
            <div className="timeline-item" key={a.title}>
              <div className="timeline-dot">{a.icon}</div>
              <div className="timeline-card">
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>
          &copy; 2025 Sri Ambal Nagar Peoples Welfare Association. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
