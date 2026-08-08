'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import './home.css';

type NewsItem = {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState('/img/avatar1.png');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsIdx, setNewsIdx] = useState(0);
  const [cardOn, setCardOn] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.name || user.username || null);
      setAvatar(
        (user as { avatar?: string }).avatar?.trim()
          ? (user as { avatar?: string }).avatar!
          : '/img/avatar1.png',
      );
    }
  }, []);

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        if (data.news?.length) {
          setNewsList(
            [...data.news].sort(
              (a: NewsItem, b: NewsItem) => b.id - a.id,
            ),
          );
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!newsList.length) return;
    setCardOn(true);
    const hide = setTimeout(() => {
      setCardOn(false);
      setTimeout(() => {
        setNewsIdx((i) => (i + 1) % newsList.length);
      }, 1900);
    }, 4000);
    return () => clearTimeout(hide);
  }, [newsList, newsIdx]);

  const n = newsList[newsIdx];

  return (
    <div className="home-page">
      <header>
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                background: '#fff',
                padding: 10,
                borderRadius: '50%',
                boxShadow: '0 4px 16px rgba(34,2,2,0.6)',
                height: 60,
                width: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/img/logo.png"
                alt="Ambal Nagar Logo"
                style={{
                  height: 50,
                  width: 50,
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            </div>
            <h1 className="logo" style={{ marginLeft: 10 }}>
              AmbalNagar Makkal Nalvazhu Sangam
            </h1>
          </div>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
          <nav>
            <ul className={`menu ${menuOpen ? 'show' : ''}`}>
              <li>
                <Link href="/" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/members">Members</Link>
              </li>
              <li>
                <Link href="/events">Events</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/login">Login</Link>
              </li>
            </ul>
          </nav>
        </div>
        {userName && (
          <div className="user-pill" style={{ display: 'flex' }}>
            <img src={avatar} className="user-avatar" alt="User Avatar" />
            <span>{userName}</span>
          </div>
        )}
      </header>

      <main>
        <section className="hero">
          <h2>Welcome to Sri Ambal Nagar Makkal Nalvazhvu Sangam</h2>
          <p>
            Building a united and thriving community through commitment,
            culture, and care.
          </p>
        </section>
      </main>

      <div id="news-notify-bar">
        <div id="notify-card" className={cardOn ? 'on' : 'off'}>
          {!newsList.length ? (
            <div>No news now</div>
          ) : n ? (
            <>
              {n.image_url ? <img src={n.image_url} alt="news" /> : null}
              <div className="card-main">
                <div className="card-title">{n.title}</div>
                <div className="card-desc">
                  {n.content?.substring(0, 60)}...
                </div>
                <div className="card-meta">
                  {n.created_at
                    ? new Date(n.created_at).toLocaleString()
                    : ''}{' '}
                  ·{' '}
                  <Link href={`/newsview?id=${n.id}`} target="_blank">
                    Read
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="service-floating-btn">
        <Link href="/service">
          <span>Service</span>
        </Link>
      </div>

      <footer>
        <p>&copy; 2025 All rights reserved.</p>
      </footer>
    </div>
  );
}
