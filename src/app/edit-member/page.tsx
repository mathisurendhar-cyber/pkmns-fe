'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import './edit-member.css';

function EditMemberInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('member');
  const [photoUrl, setPhotoUrl] = useState('/img/profile-default.jpeg');
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    requireAuth();
    if (!id) return;
    fetch('/api/getUsers')
      .then((r) => r.json())
      .then((users) => {
        const member = users.find(
          (u: { id: number | string }) => String(u.id) === String(id),
        );
        if (!member) {
          alert('Member not found!');
          window.location.href = '/manage-member';
          return;
        }
        setUsername(member.username || '');
        setEmail(member.email || '');
        setPhone(member.phone || '');
        setRole(member.role || 'member');
        setPhotoUrl(member.photo_url || '/img/profile-default.jpeg');
      })
      .catch(() => alert('Error loading member data'));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    const formData = new FormData();
    formData.append('id', id);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);
    if (photo) formData.append('photo', photo);

    try {
      const res = await fetch('/api/updateUserWithPhoto', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Member updated successfully!');
        window.location.href = '/members';
      } else {
        alert('Failed to update member.');
      }
    } catch {
      alert('Server error, try again later.');
    }
  }

  return (
    <div className="edit-member-page">
      <form id="editMemberForm" onSubmit={onSubmit}>
        <img
          id="memberPhoto"
          src={photoUrl}
          alt="Member"
          style={{ maxWidth: 160, borderRadius: 12 }}
        />
        <label>Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Email</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Phone</label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <label>Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setPhoto(f);
            if (f) setPhotoUrl(URL.createObjectURL(f));
          }}
        />
        <button type="submit">Update Member</button>
      </form>
    </div>
  );
}

export default function EditMemberPage() {
  return (
    <AdminLayout title="Edit Member">
      <Suspense fallback={<p>Loading...</p>}>
        <EditMemberInner />
      </Suspense>
    </AdminLayout>
  );
}
