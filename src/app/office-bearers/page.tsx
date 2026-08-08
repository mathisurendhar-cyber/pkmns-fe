'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './office-bearers.css';

type Bearer = { id: number; name: string; role: string; image_url: string };

export default function OfficeBearersAdminPage() {
  const [list, setList] = useState<Bearer[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    requireAuth();
    loadBearers();
  }, []);

  async function loadBearers() {
    const res = await fetch('/api/office-bearers');
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
  }

  async function addBearer() {
    if (!name.trim() || !role || !photo) {
      alert('All fields required');
      return;
    }
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('role', role);
    formData.append('photo', photo);
    const res = await fetch('/api/office-bearers', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      alert('Upload failed');
      return;
    }
    setName('');
    setRole('');
    setPhoto(null);
    loadBearers();
  }

  async function deleteBearer(id: number) {
    await fetch(`/api/office-bearers/${id}`, { method: 'DELETE' });
    loadBearers();
  }

  return (
    <AdminLayout title="Office Bearers">
      <div className="office-bearers-page">
        <div className="form">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          <button type="button" onClick={addBearer}>
            Add
          </button>
        </div>
        <div id="list" className="list">
          {list.map((b) => (
            <div className="card" key={b.id}>
              <img src={b.image_url} alt={b.name} />
              <b>{b.name}</b>
              <span>{b.role}</span>
              <button type="button" onClick={() => deleteBearer(b.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
