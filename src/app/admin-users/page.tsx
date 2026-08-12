'use client';

import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { AuthUser, isAdminRole, requireAuth } from '@/lib/auth';
import './admin-users.css';

type AdminRow = {
  username: string;
  role?: string;
  phone?: string;
  joined?: string;
  email?: string;
  avatar?: string;
};

const AVATARS = [
  'img/avatar1.png',
  'img/avatar2.png',
  'img/avatar3.png',
  'img/avatar4.png',
  'img/avatar5.png',
  'img/avatar6.png',
];

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AdminRow[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [phone, setPhone] = useState('');
  const [joined, setJoined] = useState('');
  const [formLocked, setFormLocked] = useState(true);

  useEffect(() => {
    const u = requireAuth();
    if (!u) return;
    if (!isAdminRole(u.role)) {
      alert('Only main admin and admin can manage admin users.');
      window.location.href = '/dashboard';
      return;
    }
    setCurrentUser(u);
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await apiFetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setEditMode(false);
    setSelectedAvatar('');
    setUsername('');
    setPassword('');
    setEmail('');
    setRole('admin');
    setPhone('');
    setJoined('');
    setFormLocked(true);
  }

  function startEdit(u: AdminRow) {
    if (u.username === 'mainadmin' && currentUser?.role === 'admin') {
      alert('Cannot edit mainadmin');
      return;
    }
    setEditMode(true);
    setUsername(u.username);
    setRole(u.role || 'admin');
    setPhone(u.phone || '');
    setJoined(u.joined || '');
    setEmail(u.email || '');
    setPassword('');
    setSelectedAvatar(u.avatar || 'img/avatar1.png');
    setFormLocked(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAvatar) {
      alert('Please select an avatar first.');
      return;
    }
    if (!username.trim()) {
      alert('Username is required');
      return;
    }
    const payload: Record<string, string> = {
      username: username.trim(),
      role,
      phone: phone.trim(),
      joined: joined.trim(),
      email: email.trim(),
      avatar: selectedAvatar,
    };
    if (password.trim()) payload.password = password.trim();

    try {
      const url = editMode ? '/api/updateUser' : '/api/addUser';
      const res = await apiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to save user');
      }
      await loadUsers();
      resetForm();
    } catch {
      alert('Server error while saving user');
    }
  }

  async function deleteUser(uname: string) {
    if (uname === 'mainadmin' && currentUser?.role === 'admin') {
      alert('Cannot delete mainadmin');
      return;
    }
    if (!confirm(`Delete user "${uname}" ?`)) return;
    try {
      const res = await apiFetch(`/api/deleteAdmin/${encodeURIComponent(uname)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) alert(data.message || 'Failed to delete');
      await loadUsers();
    } catch {
      alert('Server error while deleting');
    }
  }

  const visibleUsers = users.filter(
    (u) =>
      !(u.username === 'mainadmin' && currentUser?.role === 'admin'),
  );

  return (
    <AdminLayout title="Admin Users">
      <div className="admin-users-page">
        <div className="home-float">
          <Link href="/" aria-label="Back to home">
            <img src="/img/home.png" alt="Home" />
          </Link>
        </div>

        <div className="page">
          <div className="page-header">
            <div>
              <div className="title">Admin Users</div>
              <div className="subtitle">
                Create, edit and remove admin logins. Only main admin can access
                this page.
              </div>
            </div>
            <span className="badge-main">Main admin control</span>
          </div>

          <div className="grid">
            <div className="card">
              <h3>{editMode ? 'Edit user' : selectedAvatar ? 'Create new user' : 'Pick avatar to start'}</h3>
              <small>
                {editMode
                  ? 'Change avatar if needed and update other details.'
                  : 'Step 1: Choose an avatar. Step 2: Fill user details and save.'}
              </small>
              <div className="avatar-grid">
                {AVATARS.map((a) => (
                  <div
                    key={a}
                    className={`avatar-option ${selectedAvatar === a ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedAvatar(a);
                      setFormLocked(false);
                    }}
                  >
                    <img src={`/${a}`} alt={a} />
                  </div>
                ))}
              </div>
              <div className="avatar-info">
                {selectedAvatar
                  ? 'Avatar selected. Now fill user details.'
                  : 'Select an avatar to enable the form.'}
              </div>
              <form
                className={formLocked ? 'locked' : ''}
                onSubmit={onSubmit}
              >
                <div className="full-row">
                  <label>Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Login username"
                    value={username}
                    disabled={editMode}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Set / change password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    type="text"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="full-row">
                  <label>Joined</label>
                  <input
                    type="text"
                    placeholder="e.g. October 2025"
                    value={joined}
                    onChange={(e) => setJoined(e.target.value)}
                  />
                </div>
                <div className="actions">
                  {editMode && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={formLocked}
                  >
                    {editMode ? 'Update User' : 'Save User'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card" style={{ maxHeight: 420, overflow: 'auto' }}>
              <h3>Users list</h3>
              <small>
                All users. You cannot delete yourself (current login).
              </small>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((u) => {
                    const r = (u.role || 'admin').toLowerCase();
                    const isSelf = u.username === currentUser?.username;
                    return (
                      <tr key={u.username}>
                        <td>
                          <div className="user-cell">
                            <img
                              className="user-avatar"
                              src={`/${u.avatar || 'img/avatar1.png'}`}
                              alt={u.username}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/img/avatar1.png';
                              }}
                            />
                            <span className="user-name">{u.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`tag-role ${r}`}>{r}</span>
                        </td>
                        <td>{u.phone || '-'}</td>
                        <td>{u.joined || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn-xs btn-edit"
                              onClick={() => startEdit(u)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-xs btn-del"
                              disabled={isSelf}
                              title={
                                isSelf ? 'Cannot delete yourself' : 'Delete'
                              }
                              onClick={() => deleteUser(u.username)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
