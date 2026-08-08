'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './manage-member.css';

type Member = {
  id: number;
  username: string;
  phone?: string;
  role?: string;
  photo_url?: string;
};

export default function ManageMemberPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    requireAuth();
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/getUsers');
      const users: Member[] = await res.json();
      setMembers((users || []).filter((u) => (u.role || 'admin') === 'member'));
    } catch {
      setError('Unable to load member profiles.');
    }
  }

  async function deleteMember(id: number) {
    if (
      !confirm(
        'Are you sure to delete this member? This action cannot be undone.',
      )
    )
      return;
    try {
      const res = await fetch(`/api/deleteUser/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Member deleted successfully.');
        load();
      } else {
        alert(data.message || 'Delete failed.');
      }
    } catch {
      alert('Server error on delete.');
    }
  }

  return (
    <AdminLayout title="Manage Members">
      <div className="manage-member-page">
        <div id="membersContainer" className="members-container">
          {error && <p>{error}</p>}
          {!error && !members.length && <p>No members found.</p>}
          {members.map((user) => (
            <div className="member-card" key={user.id}>
              <img
                src={user.photo_url || '/img/profile-default.png'}
                alt={`${user.username} photo`}
                className="member-photo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/img/profile-default.png';
                }}
              />
              <div className="member-info">
                <h3>{user.username}</h3>
                <p>
                  <strong>Phone:</strong> {user.phone || '-'}
                </p>
                <p>
                  <strong>Role:</strong> {user.role || 'member'}
                </p>
              </div>
              <div className="button-row">
                <Link href={`/edit-member?id=${user.id}`} className="edit-button">
                  Edit
                </Link>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteMember(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
