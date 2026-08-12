'use client';

import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './office-bearers.css';

type Bearer = {
  id: number;
  name: string;
  role: string;
  image_url: string;
};

export default function OfficeBearersAdminPage() {
  const [list, setList] = useState<Bearer[]>([]);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    requireAuth();
    loadBearers();
  }, []);

  // =========================
  // LOAD
  // =========================

  async function loadBearers() {
    try {
      const res = await apiFetch('/api/office-bearers');

      const data = await res.json();

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load office bearers error:', error);
      setList([]);
    }
  }

  // =========================
  // CLEAR FORM
  // =========================

  function clearForm() {
    setName('');
    setRole('');
    setPhoto(null);
    setEditingId(null);

    const fileInput = document.getElementById(
      'bearer-photo',
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  // =========================
  // START EDIT
  // =========================

  function startEdit(bearer: Bearer) {
    setEditingId(bearer.id);
    setName(bearer.name);
    setRole(bearer.role);
    setPhoto(null);

    const fileInput = document.getElementById(
      'bearer-photo',
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // =========================
  // ADD / UPDATE
  // =========================

  async function saveBearer() {
    if (!name.trim()) {
      alert('Please enter name');
      return;
    }

    if (!role.trim()) {
      alert('Please enter role');
      return;
    }

    // Photo required only for ADD
    if (!editingId && !photo) {
      alert('Please select a photo');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', name.trim());
      formData.append('role', role.trim());

      if (photo) {
        formData.append('photo', photo);
      }

      let url = '/api/office-bearers';
      let method: 'POST' | 'PUT' = 'POST';

      if (editingId !== null) {
        url = `/api/office-bearers/${editingId}`;
        method = 'PUT';
      }

      const res = await apiFetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(
          data.message ||
            (editingId
              ? 'Office bearer update failed'
              : 'Office bearer add failed'),
        );

        return;
      }

      alert(
        editingId
          ? 'Office bearer updated successfully'
          : 'Office bearer added successfully',
      );

      clearForm();

      await loadBearers();
    } catch (error) {
      console.error('Save office bearer error:', error);

      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // DELETE
  // =========================

  async function deleteBearer(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this office bearer?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(id);

      const res = await fetch(
        `/api/office-bearers/${id}`,
        {
          method: 'DELETE',
        },
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(data.message || 'Delete failed');
        return;
      }

      if (editingId === id) {
        clearForm();
      }

      await loadBearers();
    } catch (error) {
      console.error('Delete error:', error);

      alert('Delete failed');
    } finally {
      setDeleteLoading(null);
    }
  }

  return (
    <AdminLayout>
      <div className="office-bearers-page">

        {/* =========================================
            PAGE HEADER
        ========================================= */}

        <section className="ob-header">

          <div className="ob-header-left">

            <div className="ob-eyebrow">
              ADMINISTRATION
            </div>

            <h1>Office Bearers</h1>

            <p>
              Manage the leadership team of your
              association.
            </p>

          </div>

          <div className="ob-total">

            <span>Total</span>

            <strong>
              {list.length}
            </strong>

            <small>
              Office Bearers
            </small>

          </div>

        </section>


        {/* =========================================
            ADD / EDIT PANEL
        ========================================= */}

        <section
          className={`ob-panel ${
            editingId !== null
              ? 'ob-edit-mode'
              : ''
          }`}
        >

          <div className="ob-panel-top">

            <div className="ob-panel-icon">
              {editingId !== null ? '✎' : '+'}
            </div>

            <div>

              <h2>
                {editingId !== null
                  ? 'Edit Office Bearer'
                  : 'Add Office Bearer'}
              </h2>

              <p>
                {editingId !== null
                  ? 'Update the selected office bearer details.'
                  : 'Add a name, position and profile photo.'}
              </p>

            </div>

          </div>


          <div className="ob-divider" />


          {/* FORM */}

          <div className="ob-form">

            {/* NAME */}

            <div className="ob-field">

              <label htmlFor="bearer-name">
                Full Name
              </label>

              <input
                id="bearer-name"
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


            {/* ROLE */}

            <div className="ob-field">

              <label htmlFor="bearer-role">
                Position / Role
              </label>

              <input
                id="bearer-role"
                type="text"
                placeholder="Example: President"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              />

            </div>


            {/* PHOTO */}

            <div className="ob-field">

              <label>
                Profile Photo
              </label>

              <label
                htmlFor="bearer-photo"
                className="ob-file-box"
              >

                <div className="ob-file-icon">
                  ↑
                </div>

                <div className="ob-file-text">

                  <strong>
                    {photo
                      ? photo.name
                      : editingId !== null
                        ? 'Choose new photo'
                        : 'Choose photo'}
                  </strong>

                  <span>
                    JPG, PNG or WEBP
                  </span>

                </div>

                <span className="ob-browse">
                  Browse
                </span>

              </label>

              <input
                id="bearer-photo"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setPhoto(
                    e.target.files?.[0] || null,
                  )
                }
              />

            </div>


            {/* BUTTONS */}

            <div className="ob-form-buttons">

              {editingId !== null && (
                <button
                  type="button"
                  className="ob-cancel"
                  onClick={clearForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                className="ob-save"
                onClick={saveBearer}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="ob-loader" />

                    {editingId !== null
                      ? 'Updating...'
                      : 'Adding...'}
                  </>
                ) : (
                  <>
                    <span>
                      {editingId !== null
                        ? '✓'
                        : '+'}
                    </span>

                    {editingId !== null
                      ? 'Update Bearer'
                      : 'Add Office Bearer'}
                  </>
                )}

              </button>

            </div>

          </div>

        </section>


        {/* =========================================
            DIRECTORY TITLE
        ========================================= */}

        <div className="ob-directory-head">

          <div>

            <div className="ob-eyebrow">
              DIRECTORY
            </div>

            <h2>
              Current Office Bearers
            </h2>

            <p>
              Manage existing association
              office bearers.
            </p>

          </div>

          <div className="ob-badge">
            {list.length}{' '}
            {list.length === 1
              ? 'Bearer'
              : 'Bearers'}
          </div>

        </div>


        {/* =========================================
            EMPTY
        ========================================= */}

        {list.length === 0 && (

          <section className="ob-empty">

            <div className="ob-empty-icon">
              +
            </div>

            <h3>
              No Office Bearers
            </h3>

            <p>
              Add your first office bearer
              using the form above.
            </p>

          </section>

        )}


        {/* =========================================
            CARDS
        ========================================= */}

        {list.length > 0 && (

          <section className="ob-grid">

            {list.map((bearer) => (

              <article
                className="ob-card"
                key={bearer.id}
              >

                {/* CARD TOP */}

                <div className="ob-card-top">

                  <span className="ob-id">
                    #{String(bearer.id).padStart(3, '0')}
                  </span>

                  <span className="ob-active">
                    ACTIVE
                  </span>

                </div>


                {/* PROFILE */}

                <div className="ob-profile">

                  <div className="ob-avatar">

                    <img
                      src={bearer.image_url}
                      alt={bearer.name}
                    />

                  </div>

                  <div className="ob-profile-info">

                    <h3>
                      {bearer.name}
                    </h3>

                    <span>
                      {bearer.role}
                    </span>

                  </div>

                </div>


                {/* ROLE */}

                <div className="ob-role-box">

                  <span>
                    POSITION
                  </span>

                  <strong>
                    {bearer.role}
                  </strong>

                </div>


                {/* ACTIONS */}

                <div className="ob-actions">

                  <button
                    type="button"
                    className="ob-edit-btn"
                    onClick={() =>
                      startEdit(bearer)
                    }
                  >
                    <span>✎</span>
                    Edit
                  </button>


                  <button
                    type="button"
                    className="ob-delete-btn"
                    onClick={() =>
                      deleteBearer(bearer.id)
                    }
                    disabled={
                      deleteLoading ===
                      bearer.id
                    }
                  >
                    <span>×</span>

                    {deleteLoading ===
                    bearer.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>

                </div>

              </article>

            ))}

          </section>

        )}

      </div>
    </AdminLayout>
  );
}