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

type NoticeType = 'success' | 'error';

export default function MembershipApplicationsPage() {
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [notice, setNotice] = useState<{
    show: boolean;
    type: NoticeType;
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    requireAuth();
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);

      const res = await fetch('/api/admin/applications', {
        cache: 'no-store',
      });

      const data = await res.json();

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load error:', error);

      showNotice(
        'error',
        'Unable to Load',
        'Unable to load membership applications.',
      );
    } finally {
      setLoading(false);
    }
  }

  function showNotice(
    type: NoticeType,
    title: string,
    message: string,
  ) {
    setNotice({
      show: true,
      type,
      title,
      message,
    });
  }

  function closeNotice() {
    setNotice((prev) => ({
      ...prev,
      show: false,
    }));
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || 'Status update failed',
        );
      }

      await loadApplications();

      if (status === 'approved') {
        showNotice(
          'success',
          'Application Approved',
          'The membership application has been approved successfully.',
        );
      } else {
        showNotice(
          'success',
          'Application Rejected',
          'The membership application has been rejected successfully.',
        );
      }
    } catch (error) {
      console.error(error);

      showNotice(
        'error',
        'Update Failed',
        `Error ${
          status === 'approved'
            ? 'approving'
            : 'rejecting'
        } the application.`,
      );
    }
  }

  const pendingCount = applications.filter(
    (app) => app.status === 'pending',
  ).length;

  const approvedCount = applications.filter(
    (app) => app.status === 'approved',
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status === 'rejected',
  ).length;

  return (
    <AdminLayout>
      <div className="applications-page">
        <div className="applications-container">

          {/* ================= HEADER ================= */}

          <div className="applications-header">

            <div className="header-main">

              <div className="header-label">
                MEMBERSHIP
              </div>

              <h1>Membership Applications</h1>

              <p>
                Review and manage membership applications
                submitted by community members.
              </p>

            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={loadApplications}
              disabled={loading}
            >
              <span className={loading ? 'refresh-spin' : ''}>
                ↻
              </span>

              {loading ? 'Loading...' : 'Refresh'}
            </button>

          </div>

          {/* ================= SUMMARY ================= */}

          <div className="application-summary">

            <div className="summary-card total-card">
              <div className="summary-icon">
                ◈
              </div>

              <div>
                <span>Total Applications</span>
                <strong>{applications.length}</strong>
                <small>All submitted applications</small>
              </div>
            </div>

            <div className="summary-card pending-card">
              <div className="summary-icon">
                ◷
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
                <small>Waiting for review</small>
              </div>
            </div>

            <div className="summary-card approved-card">
              <div className="summary-icon">
                ✓
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
                <small>Approved members</small>
              </div>
            </div>

            <div className="summary-card rejected-card">
              <div className="summary-icon">
                ×
              </div>

              <div>
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
                <small>Rejected applications</small>
              </div>
            </div>

          </div>

          {/* ================= APPLICATIONS ================= */}

          <section className="applications-panel">

            <div className="panel-header">

              <div>
                <span className="panel-label">
                  APPLICATION DIRECTORY
                </span>

                <h2>Applications</h2>

                <p>
                  Review applicant information and update
                  application status.
                </p>
              </div>

              <div className="application-count">
                {applications.length}{' '}
                {applications.length === 1
                  ? 'Application'
                  : 'Applications'}
              </div>

            </div>

            {/* ================= LOADING ================= */}

            {loading && (
              <div className="loading-state">

                <div className="loading-spinner" />

                <h3>Loading Applications</h3>

                <p>
                  Fetching the latest membership requests...
                </p>

              </div>
            )}

            {/* ================= EMPTY ================= */}

            {!loading && !applications.length && (
              <div className="empty-state">

                <div className="empty-icon">
                  +
                </div>

                <h3>No applications yet</h3>

                <p>
                  Applications will appear here when
                  members submit
                </p>

              </div>
            )}

            {/* ================= DESKTOP TABLE ================= */}

            {!loading && applications.length > 0 && (
              <div className="applications-table">

                <div className="table-header">
                  <div>APPLICANT</div>
                  <div>MOBILE</div>
                  <div>REFERENCE ID</div>
                  <div>DATE</div>
                  <div>STATUS</div>
                  <div>ACTION</div>
                </div>

                {applications.map((app) => (

                  <div
                    className="app-row"
                    key={app.id}
                  >

                    {/* Applicant */}

                    <div className="applicant-cell">

                      <div className="applicant-avatar">
                        {app.name
                          ? app.name
                              .charAt(0)
                              .toUpperCase()
                          : '?'}
                      </div>

                      <div>
                        <strong>
                          {app.name}
                        </strong>

                        <small>
                          Membership applicant
                        </small>
                      </div>

                    </div>

                    {/* Mobile */}

                    <div className="mobile-cell">
                      <span className="mobile-icon">
                        ☎
                      </span>

                      {app.mobile}
                    </div>

                    {/* Ref ID */}

                    <div className="ref-cell">
                      <span>
                        {app.refId}
                      </span>
                    </div>

                    {/* Date */}

                    <div className="date-cell">
                      {app.createdAt
                        ? new Date(
                            app.createdAt,
                          ).toLocaleDateString()
                        : ''}
                    </div>

                    {/* Status */}

                    <div>
                      <span
                        className={`status-badge status-${app.status}`}
                      >
                        <span className="status-dot" />

                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Actions */}

                    <div className="action-buttons">

                      {app.status !== 'approved' ? (
                        <button
                          type="button"
                          className="btn btn-approve"
                          onClick={() =>
                            updateStatus(
                              app.id,
                              'approved',
                            )
                          }
                        >
                          <span>✓</span>
                          Approve
                        </button>
                      ) : (
                        <span className="completed-action approved-action">
                          ✓ Approved
                        </span>
                      )}

                      {app.status !== 'rejected' ? (
                        <button
                          type="button"
                          className="btn btn-reject"
                          onClick={() =>
                            updateStatus(
                              app.id,
                              'rejected',
                            )
                          }
                        >
                          <span>×</span>
                          Reject
                        </button>
                      ) : (
                        <span className="completed-action rejected-action">
                          × Rejected
                        </span>
                      )}

                    </div>

                  </div>

                ))}

              </div>
            )}

            {/* ================= MOBILE CARDS ================= */}

            {!loading && applications.length > 0 && (
              <div className="mobile-applications">

                {applications.map((app) => (

                  <div
                    className="mobile-app-card"
                    key={app.id}
                  >

                    <div className="mobile-card-top">

                      <div className="applicant-cell">

                        <div className="applicant-avatar">
                          {app.name
                            ? app.name
                                .charAt(0)
                                .toUpperCase()
                            : '?'}
                        </div>

                        <div>
                          <strong>
                            {app.name}
                          </strong>

                          <small>
                            Membership applicant
                          </small>
                        </div>

                      </div>

                      <span
                        className={`status-badge status-${app.status}`}
                      >
                        <span className="status-dot" />
                        {app.status.toUpperCase()}
                      </span>

                    </div>

                    <div className="mobile-card-info">

                      <div>
                        <label>Mobile</label>
                        <strong>
                          {app.mobile}
                        </strong>
                      </div>

                      <div>
                        <label>Reference ID</label>
                        <strong>
                          {app.refId}
                        </strong>
                      </div>

                      <div>
                        <label>Date</label>
                        <strong>
                          {app.createdAt
                            ? new Date(
                                app.createdAt,
                              ).toLocaleDateString()
                            : '-'}
                        </strong>
                      </div>

                    </div>

                    <div className="mobile-card-actions">

                      {app.status !== 'approved' ? (
                        <button
                          type="button"
                          className="btn btn-approve"
                          onClick={() =>
                            updateStatus(
                              app.id,
                              'approved',
                            )
                          }
                        >
                          ✓ Approve
                        </button>
                      ) : (
                        <span className="completed-action approved-action">
                          ✓ Approved
                        </span>
                      )}

                      {app.status !== 'rejected' ? (
                        <button
                          type="button"
                          className="btn btn-reject"
                          onClick={() =>
                            updateStatus(
                              app.id,
                              'rejected',
                            )
                          }
                        >
                          × Reject
                        </button>
                      ) : (
                        <span className="completed-action rejected-action">
                          × Rejected
                        </span>
                      )}

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>

        </div>

        {/* ================= NOTIFICATION ================= */}

        {notice.show && (
          <div
            className="notification-overlay"
            onClick={closeNotice}
          >

            <div
              className="notification-box"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div
                className={`notification-icon ${notice.type}`}
              >
                {notice.type === 'success'
                  ? '✓'
                  : '×'}
              </div>

              <h3>
                {notice.title}
              </h3>

              <p>
                {notice.message}
              </p>

              <button
                type="button"
                className={`notification-btn ${notice.type}`}
                onClick={closeNotice}
              >
                OK
              </button>

            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}