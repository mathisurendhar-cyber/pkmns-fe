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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  useEffect(() => {
    requireAuth();
    load();
  }, []);

  async function load() {
    try {
      setError('');

      const res = await fetch('/api/getUsers');

      if (!res.ok) {
        throw new Error('Failed to load members');
      }

      const users: Member[] = await res.json();

      setMembers(
        (users || []).filter(
          (u) => (u.role || 'admin') === 'member',
        ),
      );
    } catch {
      setError('Unable to load member profiles.');
    }
  }

  function openDeleteModal(member: Member) {
    setSelectedMember(member);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deletingId !== null) return;

    setShowDeleteModal(false);
    setSelectedMember(null);
  }

  async function deleteMember() {
    if (!selectedMember) return;

    try {
      setDeletingId(selectedMember.id);

      const res = await fetch(
        `/api/deleteUser/${selectedMember.id}`,
        {
          method: 'DELETE',
        },
      );

      const data = await res.json();

      if (data.success) {
        setShowDeleteModal(false);
        setSelectedMember(null);

        await load();
      } else {
        alert(data.message || 'Delete failed.');
      }
    } catch {
      alert('Server error on delete.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="manage-member-page">

        {/* ================= PAGE HEADER ================= */}

        <section className="members-header">

          <div className="header-content">

            <div className="header-label">
              MEMBERS
            </div>

            <h1>
              Manage Members
            </h1>

            <p>
              View, update and manage registered members
              of the association.
            </p>

          </div>

          <div className="member-count-box">

            <span>
              TOTAL MEMBERS
            </span>

            <strong>
              {members.length}
            </strong>

          </div>

        </section>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="error-box">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}


        {/* ================= DIRECTORY ================= */}

        <section className="directory-section">

          <div className="directory-header">

            <div>

              <span className="section-label">
                MEMBER DIRECTORY
              </span>

              <h2>
                Registered Members
              </h2>

              <p>
                All active member profiles are listed below.
              </p>

            </div>

            <div className="directory-count">
              {members.length}{' '}
              {members.length === 1
                ? 'Member'
                : 'Members'}
            </div>

          </div>


          {/* ================= MEMBER LIST ================= */}

          {!error && members.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                <span>+</span>
              </div>

              <h3>
                No Members Found
              </h3>

              <p>
                No registered members are available.
              </p>

            </div>
          ) : (
            <div className="members-container">

              {members.map((user) => (

                <article
                  className="member-card"
                  key={user.id}
                >

                  {/* Card top */}

                  <div className="member-card-top">

                    <span className="member-number">
                      MEMBER #{String(user.id).padStart(3, '0')}
                    </span>

                    <span className="active-badge">
                      ACTIVE
                    </span>

                  </div>


                  {/* Profile */}

                  <div className="profile-section">

                    <div className="photo-wrapper">

                      <img
                        src={
                          user.photo_url ||
                          '/img/profile-default.png'
                        }
                        alt={`${user.username} photo`}
                        className="member-photo"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src =
                            '/img/profile-default.png';
                        }}
                      />

                      <span className="online-dot" />

                    </div>


                    <div className="member-info">

                      <h3>
                        {user.username}
                      </h3>

                      <span className="role-badge">
                        {user.role || 'member'}
                      </span>

                    </div>

                  </div>


                  {/* Details */}

                  <div className="member-details">

                    <div className="detail-row">

                      <span className="detail-label">
                        PHONE
                      </span>

                      <strong>
                        {user.phone || '-'}
                      </strong>

                    </div>


                    <div className="detail-row">

                      <span className="detail-label">
                        ROLE
                      </span>

                      <strong>
                        {user.role || 'member'}
                      </strong>

                    </div>

                  </div>


                  {/* Actions */}

                  <div className="button-row">

                    <Link
                      href={`/edit-member?id=${user.id}`}
                      className="edit-button"
                    >
                      <span className="button-icon">
                        ✎
                      </span>

                      Edit
                    </Link>


                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        openDeleteModal(user)
                      }
                      disabled={
                        deletingId === user.id
                      }
                    >
                      <span className="button-icon">
                        ×
                      </span>

                      Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>


        {/* =====================================================
            CUSTOM DELETE CONFIRMATION MODAL
           ===================================================== */}

        {showDeleteModal &&
          selectedMember && (

            <div
              className="delete-modal-overlay"
              onClick={closeDeleteModal}
            >

              <div
                className="delete-modal"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                {/* Orange top line */}

                <div className="delete-modal-line" />


                {/* Warning Icon */}

                <div className="delete-modal-icon">
                  <span>!</span>
                </div>


                {/* Content */}

                <div className="delete-modal-content">

                  <span className="modal-label">
                    CONFIRM ACTION
                  </span>

                  <h3>
                    Delete Member?
                  </h3>

                  <p>
                    Are you sure you want to delete
                    <strong>
                      {' '}
                      {selectedMember.username}
                    </strong>
                    ?
                  </p>

                  <span className="delete-warning">
                    This action cannot be undone.
                  </span>

                </div>


                {/* Buttons */}

                <div className="delete-modal-actions">

                  <button
                    type="button"
                    className="cancel-modal-button"
                    onClick={closeDeleteModal}
                    disabled={
                      deletingId !== null
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="confirm-delete-button"
                    onClick={deleteMember}
                    disabled={
                      deletingId !== null
                    }
                  >

                    {deletingId !== null ? (
                      <>
                        <span className="modal-spinner" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <span>×</span>
                        Delete Member
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>
          )}

      </div>
    </AdminLayout>
  );
}