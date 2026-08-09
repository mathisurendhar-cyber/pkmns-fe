'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import './edit-member.css';

type NoticeType = 'success' | 'error' | 'warning';

function EditMemberInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('member');

  const [photoUrl, setPhotoUrl] = useState(
    '/img/profile-default.jpeg',
  );

  const [photo, setPhoto] = useState<File | null>(null);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeType, setNoticeType] =
    useState<NoticeType>('success');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [redirectAfterClose, setRedirectAfterClose] =
    useState(false);

  useEffect(() => {
    requireAuth();

    if (!id) return;

    fetch('/api/getUsers')
      .then((r) => r.json())
      .then((users) => {
        const member = users.find(
          (u: { id: number | string }) =>
            String(u.id) === String(id),
        );

        if (!member) {
          showNotice(
            'error',
            'Member Not Found',
            'The selected member could not be found.',
            true,
          );

          return;
        }

        setUsername(member.username || '');
        setEmail(member.email || '');
        setPhone(member.phone || '');
        setRole(member.role || 'member');

        setPhotoUrl(
          member.photo_url ||
            '/img/profile-default.jpeg',
        );
      })
      .catch(() => {
        showNotice(
          'error',
          'Unable to Load',
          'Error loading member data.',
        );
      });
  }, [id]);

  function showNotice(
    type: NoticeType,
    title: string,
    message: string,
    redirect = false,
  ) {
    setNoticeType(type);
    setNoticeTitle(title);
    setNoticeMessage(message);
    setRedirectAfterClose(redirect);
    setNoticeOpen(true);
  }

  function closeNotice() {
    setNoticeOpen(false);

    if (redirectAfterClose) {
      setRedirectAfterClose(false);
      window.location.href = '/manage-member';
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!id) {
      showNotice(
        'error',
        'Invalid Member',
        'Member ID is missing.',
      );
      return;
    }

    const formData = new FormData();

    formData.append('id', id);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);

    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const res = await fetch(
        '/api/updateUserWithPhoto',
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success) {
        showNotice(
          'success',
          'Member Updated',
          'Member updated successfully!',
          true,
        );
      } else {
        showNotice(
          'error',
          'Update Failed',
          data.message ||
            'Failed to update member.',
        );
      }
    } catch {
      showNotice(
        'error',
        'Server Error',
        'Server error, try again later.',
      );
    }
  }

  return (
    <AdminLayout title="Edit Member">
      <div className="edit-member-page">
        <div className="edit-container">

          {/* HEADER */}
          <div className="edit-header">

            <div>
              <div className="edit-eyebrow">
                MEMBERS / EDIT
              </div>

              <h1>Edit Member</h1>

              <p>
                Update the member profile information
                and save the latest details.
              </p>
            </div>

            <div className="edit-id">
              MEMBER #{id}
            </div>
          </div>

          {/* PROFILE */}
          <div className="profile-preview">

            <div className="profile-image-wrap">
              <img
                src={photoUrl}
                alt="Member"
                className="profile-pic"
                onError={(e) => {
                  (
                    e.currentTarget as HTMLImageElement
                  ).src =
                    '/img/profile-default.jpeg';
                }}
              />
            </div>

            <div>
              <div className="profile-label">
                PROFILE PHOTO
              </div>

              <div className="profile-name">
                {username || 'Member Profile'}
              </div>

              <div className="profile-role">
                {role || 'member'}
              </div>
            </div>

          </div>

          {/* FORM */}
          <form
            className="edit-form"
            onSubmit={onSubmit}
            encType="multipart/form-data"
          >

            <div className="edit-section full">
              <span>01</span>

              <div>
                <h2>Member Information</h2>
                <p>
                  Update the account and contact details.
                </p>
              </div>
            </div>

            {/* USERNAME */}
            <div className="edit-field">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            {/* EMAIL */}
            <div className="edit-field">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            {/* PHONE */}
            <div className="edit-field">
              <label htmlFor="phone">
                Phone
              </label>

              <input
                id="phone"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />
            </div>

            {/* ROLE */}
            <div className="edit-field">
              <label htmlFor="role">
                Role
              </label>

              <select
                id="role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >
                <option value="member">
                  Member
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            </div>

            {/* PHOTO */}
            <div className="edit-field full">
              <label htmlFor="photo">
                Profile Photo
              </label>

              <div className="edit-file">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f =
                      e.target.files?.[0] ||
                      null;

                    setPhoto(f);

                    if (f) {
                      setPhotoUrl(
                        URL.createObjectURL(f),
                      );
                    }
                  }}
                />

                <span>
                  {photo
                    ? photo.name
                    : 'Choose a new profile photo'}
                </span>
              </div>

              <small>
                Leave empty to keep the existing
                profile photo.
              </small>
            </div>

            {/* BUTTON */}
            <div className="edit-actions full">
              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  (window.location.href =
                    '/manage-member')
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="update-btn"
              >
                <span>✓</span>
                Update Member
              </button>
            </div>
          </form>
        </div>

        {/* CUSTOM NOTIFICATION */}
        {noticeOpen && (
          <div
            className="edit-notice-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeNotice();
              }
            }}
          >
            <div className="edit-notice">

              <div
                className={`edit-notice-icon ${noticeType}`}
              >
                {noticeType === 'success' && '✓'}
                {noticeType === 'error' && '×'}
                {noticeType === 'warning' && '!'}
              </div>

              <h3>{noticeTitle}</h3>

              <p>{noticeMessage}</p>

              <button
                type="button"
                className={`edit-notice-btn ${noticeType}`}
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

export default function EditMemberPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Loading...
        </div>
      }
    >
      <EditMemberInner />
    </Suspense>
  );
}