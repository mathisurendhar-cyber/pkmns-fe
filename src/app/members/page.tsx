'use client';

import SiteNavbar from '@/components/layout/SiteNavbar';
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
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  /* =====================================================
     LOAD MEMBERS
     OLD API / LOGIC UNCHANGED
  ===================================================== */

  useEffect(() => {
    fetch('/api/getUsers')
      .then((r) => {
        if (!r.ok) {
          throw new Error('Failed to load members');
        }

        return r.json();
      })
      .then((users: Member[]) => {
        setMembers(
          (users || []).filter(
            (u) => (u.role || 'admin') === 'member',
          ),
        );
      })
      .catch(() => {
        setError('Unable to load members.');
      });
  }, []);

  /* =====================================================
     CLOSE MEMBER MODAL
  ===================================================== */

  const closeMemberPopup = () => {
    setSelectedMember(null);
  };

  /* =====================================================
     ESC KEY
  ===================================================== */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMemberPopup();
      }
    };

    if (selectedMember) {
      document.addEventListener(
        'keydown',
        handleEscape,
      );
    }

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [selectedMember]);

  /* =====================================================
     LOCK BODY SCROLL WHEN MODAL OPEN
  ===================================================== */

  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedMember]);

  return (
    <div className="members-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <SiteNavbar />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="members-main">

        {/* PAGE HEADING */}

        <section className="members-heading">

          <div className="heading-label">
            OUR COMMUNITY
          </div>

          <h1>
            Our <span>Members</span>
          </h1>

          <p>
            Meet the active members of our
            community and their contributions.
          </p>

        </section>

        {/* ERROR */}

        {error && (
          <div className="members-error">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          members.length === 0 && (
            <div className="members-empty">
              <h3>
                No members found
              </h3>

              <p>
                Member information will
                appear here.
              </p>
            </div>
          )}

        {/* =================================================
            MEMBERS GRID
        ================================================= */}

        {members.length > 0 && (
          <section className="members-grid">

            {members.map((member) => (

              <article
                key={member.id}
                className="member-card"
                role="button"
                tabIndex={0}
                onClick={() =>
                  setSelectedMember(member)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();

                    setSelectedMember(member);
                  }
                }}
              >

                {/* IMAGE BOX */}

                <div className="member-image-box">

                  <img
                    src={
                      member.photo_url ||
                      '/img/profile-default.png'
                    }
                    alt={`${member.username} photo`}
                    className="member-image"
                    onError={(event) => {
                      event.currentTarget.src =
                        '/img/profile-default.png';
                    }}
                  />

                </div>

                {/* MEMBER INFO */}

                <div className="member-info">

                  <h3
                    title={member.username}
                  >
                    {member.username}
                  </h3>

                  <span className="member-role">
                    MEMBER
                  </span>

                  <div className="member-details">

                    {/* PHONE */}

                    <div className="member-detail">

                      <div className="member-detail-icon">
                        ☎
                      </div>

                      <div className="member-detail-content">

                        <span className="member-detail-label">
                          PHONE
                        </span>

                        <span className="member-detail-value">
                          {member.phone || '-'}
                        </span>

                      </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="member-detail">

                      <div className="member-detail-icon">
                        •
                      </div>

                      <div className="member-detail-content">

                        <span className="member-detail-label">
                          ADDRESS
                        </span>

                        <span className="member-detail-value">
                          {member.address || '-'}
                        </span>

                      </div>

                    </div>

                    {/* JOINED */}

                    <div className="member-detail">

                      <div className="member-detail-icon">
                        ✓
                      </div>

                      <div className="member-detail-content">

                        <span className="member-detail-label">
                          JOINED
                        </span>

                        <span className="member-detail-value">
                          {member.joined || '-'}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="member-status">
                    <span className="member-status-dot" />
                    Active Member
                  </div>

                </div>

              </article>

            ))}

          </section>
        )}

      </main>

      {/* =================================================
          MEMBER POPUP
      ================================================= */}

      {selectedMember && (

        <div
          className="member-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeMemberPopup();
            }
          }}
        >

          <div
            className="member-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Member profile"
          >

            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="modal-close"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                closeMemberPopup();
              }}
              aria-label="Close"
            >
              ×
            </button>

            {/* =================================================
                LARGE IMAGE
            ================================================= */}

            <div className="member-modal-image-area">

              <div className="member-modal-image-box">

                <img
                  src={
                    selectedMember.photo_url ||
                    '/img/profile-default.png'
                  }
                  alt={`${selectedMember.username} photo`}
                  className="member-modal-image"
                  onError={(event) => {
                    event.currentTarget.src =
                      '/img/profile-default.png';
                  }}
                />

              </div>

            </div>

            {/* =================================================
                MEMBER CONTENT
            ================================================= */}

            <div className="member-modal-content">

              <div className="member-modal-label">
                COMMUNITY MEMBER
              </div>

              <h2>
                {selectedMember.username}
              </h2>

              <span className="member-modal-role">
                MEMBER
              </span>

              <div className="member-modal-divider" />

              <div className="member-modal-details">

                {/* PHONE */}

                <div className="modal-detail">

                  <div className="modal-detail-icon">
                    ☎
                  </div>

                  <div className="modal-detail-text">

                    <small>
                      PHONE
                    </small>

                    <span>
                      {selectedMember.phone || '-'}
                    </span>

                  </div>

                </div>

                {/* ADDRESS */}

                <div className="modal-detail">

                  <div className="modal-detail-icon">
                    •
                  </div>

                  <div className="modal-detail-text">

                    <small>
                      ADDRESS
                    </small>

                    <span>
                      {selectedMember.address || '-'}
                    </span>

                  </div>

                </div>

                {/* JOINED */}

                <div className="modal-detail">

                  <div className="modal-detail-icon">
                    ✓
                  </div>

                  <div className="modal-detail-text">

                    <small>
                      JOINED
                    </small>

                    <span>
                      {selectedMember.joined || '-'}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>
        <p>
          &copy; 2025 Sri Ambal Nagar Peoples
          Welfare Association. All rights reserved.
        </p>
      </footer>

    </div>
  );
}