'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './profile.css';

type Profile = {
  id?: number;
  username: string;
  email?: string;
  role?: string;
  phone?: string;
  joined?: string;
  photo_url?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('/img/profile-default.png');

  useEffect(() => {
    const auth = requireAuth();
    if (!auth) return;
    const username = auth.username;
    if (!username) {
      alert('User not logged in!');
      window.location.href = '/login';
      return;
    }
    fetch('/api/getUsers')
      .then((r) => r.json())
      .then((users: Profile[]) => {
        const found =
          users.find((u) => u.username === username) ||
          ({
            username,
            email: auth.email,
            role: auth.role,
            phone: '',
            joined: '',
          } as Profile);
        setProfile(found);
        setEmail(found.email || '');
        setPhone(found.phone || '');
        setPhotoUrl(
          found.photo_url ||
            `/uploads/${found.username}.jpg` ||
            '/img/profile-default.png',
        );
      })
      .catch(() => alert('User data not found!'));
  }, []);

  async function saveProfile() {
    if (!profile) return;
    const formData = new FormData();
    if (profile.id) formData.append('id', String(profile.id));
    formData.append('username', profile.username);
    formData.append('email', email);
    formData.append('role', profile.role || '');
    formData.append('phone', phone);
    formData.append('joined', profile.joined || '');
    if (photo) formData.append('photo', photo);

    try {
      const res = await fetch('/api/updateUserWithPhoto', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Profile updated successfully!');
        window.location.reload();
      } else {
        alert('Failed to update profile!');
      }
    } catch {
      alert('Error connecting to server!');
    }
  }

  if (!profile) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-wrap">
        <img
          src={photoUrl}
          className="profile-pic"
          alt="Profile"
          style={{ cursor: editing ? 'pointer' : 'default' }}
          onClick={() => {
            if (editing) document.getElementById('photoInput')?.click();
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/img/profile-default.png';
          }}
        />
        <input
          type="file"
          id="photoInput"
          accept="image/*"
          style={{ display: editing ? 'block' : 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setPhoto(f);
            if (f) setPhotoUrl(URL.createObjectURL(f));
          }}
        />
        <div className="profile-title">{profile.username}</div>
        <div id="profile-details">
          <div className="profile-field">
            <label>Email</label>
            {editing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <span>{profile.email || ''}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Role</label>
            <span>{profile.role || ''}</span>
          </div>
          <div className="profile-field">
            <label>Phone</label>
            {editing ? (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            ) : (
              <span>{profile.phone || ''}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Joined</label>
            <span>{profile.joined || ''}</span>
          </div>
          <div className="button-row">
            {!editing ? (
              <button type="button" onClick={() => setEditing(true)}>
                Edit
              </button>
            ) : (
              <button type="button" onClick={saveProfile}>
                Save
              </button>
            )}
            <Link className="back-btn" href="/dashboard">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
