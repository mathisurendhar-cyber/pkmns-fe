'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { FormEvent, useEffect, useState } from 'react';
import { isAdminRole, requireAuth } from '@/lib/auth';
import './add-member.css';

export default function AddMemberPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('member');
  const [joined, setJoined] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const u = requireAuth();
    if (u && !isAdminRole(u.role)) {
      alert('Only admin can add members.');
      window.location.href = '/dashboard';
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('joined', joined);
    formData.append('address', address);
    if (photo) formData.append('photo', photo);

    try {
      const res = await fetch('/api/addUserWithPhoto', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Member added successfully!');
        window.location.href = '/members';
      } else {
        alert(data.message || 'Failed to add member.');
      }
    } catch {
      alert('Server error, please try again later.');
    }
  }

  return (
    <AdminLayout title="Add Member">
      <div className="add-member-page">
        <div className="page">
          <div className="page-header">
            <div className="title">Add Member</div>
            <div className="subtitle">
              Fill in the member details; this profile will appear in the
              association members page.
            </div>
            <div className="meta-row">
              <span className="chip">Admin only</span>
              <span className="chip">Profile information</span>
              <span className="chip">Optional photo upload</span>
            </div>
          </div>

          <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="full-row">
              <label>Username</label>
              <input
                type="text"
                required
                placeholder="Login username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                type="text"
                placeholder="Contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="full-row">
              <label>Address</label>
              <input
                type="text"
                placeholder="Member address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div>
              <label>Joined</label>
              <input
                type="text"
                placeholder="e.g. October 2025"
                value={joined}
                onChange={(e) => setJoined(e.target.value)}
              />
            </div>
            <div className="full-row">
              <label>Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <div className="hint">
                JPEG / PNG, clear face, less than 2MB is recommended.
              </div>
            </div>
            <div className="actions">
              <button type="submit">Save Member</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
