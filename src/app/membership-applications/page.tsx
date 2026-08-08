'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './membership-applications.css';

type AppRow = {
  id: string;
  name: string;
  mobile: string;
  refId: string;
  status: string;
  createdAt?: string;
};

export default function MembershipApplicationsPage() {
  const [applications, setApplications] = useState<AppRow[]>([]);

  useEffect(() => {
    requireAuth();
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const res = await fetch('/api/admin/applications');
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load error:', error);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/admin/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadApplications();
    } catch {
      alert(`Error ${status === 'approved' ? 'approving' : 'rejecting'}`);
    }
  }

  return (
    <AdminLayout title="Membership Applications">
      <div className="apps-page">
        <div id="applicationsList">
          {!applications.length ? (
            <div className="empty-state">
              <h3>No applications yet</h3>
              <p>Applications will appear here when members submit</p>
            </div>
          ) : (
            applications.map((app) => (
              <div className="app-row" key={app.id}>
                <div>
                  <strong>{app.name}</strong>
                </div>
                <div>{app.mobile}</div>
                <div>{app.refId}</div>
                <div>
                  {app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString()
                    : ''}
                </div>
                <div className={`status-${app.status}`}>
                  {app.status.toUpperCase()}
                </div>
                <div className="action-buttons">
                  {app.status !== 'approved' ? (
                    <button
                      type="button"
                      className="btn btn-approve"
                      onClick={() => updateStatus(app.id, 'approved')}
                    >
                      ✅ Approve
                    </button>
                  ) : (
                    <span style={{ color: '#22c55e' }}>✓ Approved</span>
                  )}
                  {app.status !== 'rejected' ? (
                    <button
                      type="button"
                      className="btn btn-reject"
                      onClick={() => updateStatus(app.id, 'rejected')}
                    >
                      ❌ Reject
                    </button>
                  ) : (
                    <span style={{ color: '#ef4444' }}>✗ Rejected</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
