'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { FormEvent, useEffect, useState } from 'react';
import { isAdminRole, requireAuth } from '@/lib/auth';
import './add-member.css';

type NoticeType = 'success' | 'error' | 'warning';

export default function AddMemberPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('member');
  const [joined, setJoined] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<NoticeType>('success');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [redirectAfterClose, setRedirectAfterClose] = useState(false);

  useEffect(() => {
    const u = requireAuth();

    if (u && !isAdminRole(u.role)) {
      showNotice(
        'warning',
        'Access Restricted',
        'Only admin can add members.',
      );

      setRedirectAfterClose(true);
    }
  }, []);

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
      window.location.href = '/members';
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData();

    formData.append('username', username.trim());
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('joined', joined);
    formData.append('address', address);

    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const res = await fetch('/api/addUserWithPhoto', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        showNotice(
          'success',
          'Member Added',
          'Member added successfully!',
          true,
        );
      } else {
        showNotice(
          'error',
          'Unable to Add Member',
          data.message || 'Failed to add member.',
        );
      }
    } catch {
      showNotice(
        'error',
        'Server Error',
        'Server error, please try again later.',
      );
    }
  }

  return (
    <AdminLayout title="Add Member">
      <div className="add-member-page">
        <div className="page">

          {/* HEADER */}
          <div className="page-header">
            <div>
              <div className="eyebrow">MEMBERS</div>

              <h1 className="title">Add Member</h1>

              <p className="subtitle">
                Fill in the member details; this profile will appear in the
                association members page.
              </p>
            </div>

            <div className="header-status">
              <span className="status-dot" />
              Admin only
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={onSubmit}
            encType="multipart/form-data"
          >

            {/* Username */}
            <div className="form-section full-row">
              <div className="section-heading">
                <span className="section-number">01</span>

                <div>
                  <h2>Basic Information</h2>
                  <p>Enter the member's basic profile details.</p>
                </div>
              </div>
            </div>

            <div className="field full-row">
              <label htmlFor="username">Username</label>

              <div className="input-box">
                <span className="input-prefix">@</span>

                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Login username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="field">
              <label htmlFor="phone">Phone</label>

              <div className="input-box">
                <span className="input-prefix">+91</span>

                <input
                  id="phone"
                  type="text"
                  placeholder="Contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Role */}
            <div className="field">
              <label htmlFor="role">Role</label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>

            {/* Address */}
            <div className="field full-row">
              <label htmlFor="address">Address</label>

              <input
                id="address"
                type="text"
                placeholder="Member address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Joined */}
            <div className="field">
              <label htmlFor="joined">Joined</label>

              <input
                id="joined"
                type="text"
                placeholder="e.g. October 2025"
                value={joined}
                onChange={(e) => setJoined(e.target.value)}
              />
            </div>

            {/* Photo */}
            <div className="field">
              <label htmlFor="photo">Photo</label>

              <div className="file-box">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPhoto(e.target.files?.[0] || null)
                  }
                />

                <span>
                  {photo ? photo.name : 'Choose profile photo'}
                </span>
              </div>

              <div className="hint">
                JPEG / PNG, clear face, less than 2MB is recommended.
              </div>
            </div>

            {/* ACTIONS */}
            <div className="actions full-row">
              <button
                type="submit"
                className="save-button"
              >
                <span className="button-icon">+</span>
                Save Member
              </button>
            </div>
          </form>
        </div>

        {/* CUSTOM NOTIFICATION */}
        {noticeOpen && (
          <div
            className="notice-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeNotice();
              }
            }}
          >
            <div className="notice-modal">

              <div
                className={`notice-icon ${noticeType}`}
              >
                {noticeType === 'success' && '✓'}
                {noticeType === 'error' && '×'}
                {noticeType === 'warning' && '!'}
              </div>

              <h3>{noticeTitle}</h3>

              <p>{noticeMessage}</p>

              <button
                type="button"
                className={`notice-button ${noticeType}`}
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