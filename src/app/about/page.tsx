'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import './about.css';

type Bearer = {
  id: number;
  name: string;
  role: string;
  image_url: string;
};

const ACTIVITIES = [
  {
    icon: '🏗️',
    title: 'Infrastructure Development',
    desc: 'Road construction, repairs and public infrastructure upgrades.',
  },
  {
    icon: '💡',
    title: 'Streetlight & Drainage',
    desc: 'Lighting maintenance and proper drainage systems.',
  },
  {
    icon: '🌱',
    title: 'Cleanliness & Greenery',
    desc: 'Clean drives and tree plantation initiatives.',
  },
  {
    icon: '🛡️',
    title: 'Safety & Neighborhood Watch',
    desc: 'Community safety awareness and monitoring programs.',
  },
  {
    icon: '🎉',
    title: 'Cultural & Social Events',
    desc: 'Festivals, meetings and social celebrations.',
  },
  {
    icon: '🤝',
    title: 'Community Welfare',
    desc: "Support programs for people's well-being.",
  },
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bearers, setBearers] = useState<Bearer[]>([]);

  useEffect(() => {
    fetch('/api/office-bearers')
      .then((res) => res.json())
      .then((data) => {
        setBearers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Office Bearers Error:', error);
      });
  }, []);

  return (
    <div className="about-page">

      {/* ================= HEADER ================= */}

      <header className="about-header">
        <div className="header-container">

          <Link href="/" className="brand">

            <div className="brand-logo">
              <img
                src="/img/logo.png"
                alt="Sri AmbalNagar Logo"
              />
            </div>

            <div className="brand-content">
              <strong>Sri AmbalNagar</strong>
              <span>Makkal Nalvazhu Sangam</span>
            </div>

          </Link>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? '×' : '☰'}
          </button>

          <nav className={menuOpen ? 'nav open' : 'nav'}>

            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            <Link
              href="/about"
              className="active"
              onClick={() => setMenuOpen(false)}
            >
              About Us
            </Link>

            <Link
              href="/members"
              onClick={() => setMenuOpen(false)}
            >
              Members
            </Link>

            <Link
              href="/events"
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

          </nav>

        </div>
      </header>


      {/* ================= PAGE INTRO ================= */}

      <main>

        <section className="page-intro">

          <div className="intro-label">
            <span></span>
            ABOUT US
          </div>

          <h1>
            About Our <em>Community</em>
          </h1>

          <p>
            Bringing our neighborhood together for a future of
            shared happiness and progress.
          </p>

        </section>


        {/* ================= MISSION + JOIN ================= */}

        <section className="mission-section">

          <article className="info-card mission-card">

            <div className="info-top">

              <div className="info-icon">
                🎯
              </div>

              <span className="info-number">
                01
              </span>

            </div>

            <div className="info-label">
              OUR MISSION
            </div>

            <h2>
              A lively, safe and
              connected neighborhood.
            </h2>

            <p>
              To create a lively, safe, and connected
              neighborhood where every individual and
              family flourish through unity and care.
            </p>

          </article>


          <article
            className="info-card join-card"
            role="button"
            tabIndex={0}
            onClick={() => {
              window.location.href = '/membership';
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                window.location.href = '/membership';
              }
            }}
          >

            <div className="info-top">

              <div className="info-icon">
                🤝
              </div>

              <span className="info-number">
                02
              </span>

            </div>

            <div className="info-label">
              JOIN US
            </div>

            <h2>
              Become part of our
              dynamic community.
            </h2>

            <p>
              Become part of our dynamic community.
              Your participation builds a stronger,
              happier neighborhood for all.
            </p>

            <span className="learn-more">
              Become a member
              <b>→</b>
            </span>

          </article>

        </section>


        {/* ================= OFFICE BEARERS ================= */}

        <section className="bearers-section">

          <div className="section-heading">

            <div>

              <div className="section-label">
                <span>03</span>
                LEADERSHIP
              </div>

              <h2>
                Office <em>Bearers</em>
              </h2>

            </div>

            <p>
              Our community representatives and
              responsible office bearers.
            </p>

          </div>


          {bearers.length > 0 ? (

            <div className="bearers-grid">

              {bearers.map((bearer, index) => (

                <article
                  className="bearer-card"
                  key={bearer.id}
                >

                  <div className="bearer-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="bearer-photo">

                    <img
                      src={bearer.image_url}
                      alt={bearer.name}
                    />

                  </div>

                  <div className="bearer-details">

                    <h3>
                      {bearer.name}
                    </h3>

                    <span>
                      {bearer.role}
                    </span>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="empty-bearers">

              <div>
                👥
              </div>

              <span>
                Office Bearers
              </span>

              <p>
                Office bearer information will appear here.
              </p>

            </div>

          )}

        </section>


        {/* ================= ACTIVITIES ================= */}

        <section className="activities-section">

          <div className="section-heading">

            <div>

              <div className="section-label">
                <span>04</span>
                COMMUNITY WORK
              </div>

              <h2>
                Our <em>Activities</em>
              </h2>

            </div>

            <p>
              Community activities and initiatives
              supporting our neighborhood.
            </p>

          </div>


          <div className="activities-grid">

            {ACTIVITIES.map((activity, index) => (

              <article
                className="activity-card"
                key={activity.title}
              >

                <div className="activity-header">

                  <div className="activity-icon">
                    {activity.icon}
                  </div>

                  <span>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                </div>

                <h3>
                  {activity.title}
                </h3>

                <p>
                  {activity.desc}
                </p>

                <div className="activity-line">
                  <span></span>
                </div>

              </article>

            ))}

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="about-footer">

        <div className="footer-content">

          <div className="footer-brand">


          

          </div>

        </div>

        <div className="footer-bottom">
          © 2026 Sri Ambal Nagar Peoples Welfare Association.
          All rights reserved.
        </div>

      </footer>

    </div>
  );
}