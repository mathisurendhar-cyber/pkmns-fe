'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import './members.css';

type Member = {
  id: number;
  username: string;
  phone?: string;
  address?: string;
  joined?: string;
  photo_url?: string;
  role?: string;
};

export default function MembersPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/getUsers')
      .then((r) => r.json())
      .then((users: Member[]) => {
        setMembers(
          (users || []).filter((u) => (u.role || 'admin') === 'member'),
        );
      })
      .catch(() => setError('Unable to load members.'));
  }, []);

  return (
    <div className="members-page">
      <header>
        <div className="header-container">
          <div className="brand-flex">
            <img src="/img/logo.png" alt="Logo" />
            <span>Sri AmbalNagar Makkal Nalvazhu Sangam</span>
          </div>
          <nav>
            <ul className={menuOpen ? 'show' : ''}>
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

      <section className="members-hero">
        <h1>Members Directory</h1>
        <p>Listing of active members with photos and details.</p>
      </section>

      <div className="members-grid">
        {error && <p>{error}</p>}
        {!error && !members.length && <p>No members found.</p>}
        {members.map((u) => (
          <div className="member-card" key={u.id}>
            <img
              src={u.photo_url || '/img/profile-default.png'}
              alt={`${u.username} photo`}
              className="member-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/img/profile-default.png';
              }}
            />
            <div className="member-info">
              <h3>{u.username}</h3>
              <p>
                <strong>Phone:</strong> {u.phone || '-'}
              </p>
              <p>
                <strong>Address:</strong> {u.address || '-'}
              </p>
              <p>
                <strong>Joined:</strong> {u.joined || '-'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <footer>
        <p>
          &copy; 2025 Sri Ambal Nagar Peoples Welfare Association. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
