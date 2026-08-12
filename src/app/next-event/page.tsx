'use client';

import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { FormEvent, useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './next-event.css';

type EventItem = {
  id: number;
  title: string;
  date: string;
  description?: string;
};

type NoticeType = 'success' | 'error';

export default function NextEventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);

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
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await apiFetch('/api/events', {
        cache: 'no-store',
      });

      const data = await res.json();

      setEvents(
        Array.isArray(data.events)
          ? data.events
          : [],
      );
    } catch (err) {
      console.error(err);

      showNotice(
        'error',
        'Unable to Load',
        'Unable to load events. Please try again.',
      );
    }
  }

  function showNotice(
    type: NoticeType,
    noticeTitle: string,
    message: string,
  ) {
    setNotice({
      show: true,
      type,
      title: noticeTitle,
      message,
    });
  }

  function closeNotice() {
    setNotice((prev) => ({
      ...prev,
      show: false,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setDate('');
    setDescription('');
    setFiles(null);
  }

  function editEvent(id: number) {
    const event = events.find(
      (e) => e.id === id,
    );

    if (!event) return;

    setEditingId(id);
    setTitle(event.title);
    setDate(
      event.date?.split('T')[0] || '',
    );
    setDescription(
      event.description || '',
    );

    setFiles(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function deleteEvent(id: number) {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/events/${id}`,
        {
          method: 'DELETE',
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        showNotice(
          'error',
          'Delete Failed',
          data.message ||
            'Unable to delete the event.',
        );
        return;
      }

      await loadEvents();

      resetForm();

      showNotice(
        'success',
        'Event Deleted',
        'The event has been deleted successfully.',
      );
    } catch {
      showNotice(
        'error',
        'Delete Failed',
        'Network error. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      /*
       * ============================
       * ADD EVENT
       * ============================
       */

      if (!editingId) {
        const formData = new FormData();

        formData.append(
          'title',
          title.trim(),
        );

        formData.append(
          'date',
          date,
        );

        formData.append(
          'description',
          description.trim(),
        );

        if (files) {
          Array.from(files).forEach(
            (file) => {
              formData.append(
                'files',
                file,
              );
            },
          );
        }

        const res = await fetch(
          '/api/events',
          {
            method: 'POST',
            body: formData,
          },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          showNotice(
            'error',
            'Add Failed',
            data.message ||
              'Unable to add event.',
          );
          return;
        }

        await loadEvents();

        resetForm();

        showNotice(
          'success',
          'Event Added',
          'The event has been added successfully.',
        );

        return;
      }

      /*
       * ============================
       * UPDATE EVENT
       * ============================
       */

      const res = await fetch(
        `/api/events/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title,
            date,
            description,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        showNotice(
          'error',
          'Update Failed',
          data.message ||
            'Unable to update event.',
        );
        return;
      }

      await loadEvents();

      resetForm();

      showNotice(
        'success',
        'Event Updated',
        'The event has been updated successfully.',
      );
    } catch {
      showNotice(
        'error',
        'Something Went Wrong',
        'Network error. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="next-event-page">

        <div className="shell">

          {/* ================= HEADER ================= */}

          <div className="shell-header">

            <div>
              <div className="shell-title">
                Events Manager
              </div>

              <div className="shell-subtitle">
                Create, edit and maintain association events.
              </div>
            </div>

            <div className="shell-badge">
              Admin · Ambal Nagar
            </div>

          </div>

          {/* ================= CONTENT ================= */}

          <div className="container">

            {/* ================= EVENTS LIST ================= */}

            <div className="events-list">

              <div className="section-head">

                <div>
                  <div className="section-eyebrow">
                    EVENT DIRECTORY
                  </div>

                  <div className="section-title">
                    All Events
                  </div>
                </div>

                <div className="section-count">
                  {events.length}{' '}
                  {events.length === 1
                    ? 'event'
                    : 'events'}
                </div>

              </div>

              <div className="events-grid">

                {!events.length ? (
                  <div className="no-events">

                    <div className="empty-icon">
                      +
                    </div>

                    <div className="empty-title">
                      No events found
                    </div>

                    <div className="empty-text">
                      Add your first event using
                      the form on the right.
                    </div>

                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      className={`event-card ${
                        editingId === event.id
                          ? 'event-active'
                          : ''
                      }`}
                      key={event.id}
                    >

                      {/* Card top */}

                      <div className="event-card-top">

                        <div className="event-number">
                          EVENT #{event.id}
                        </div>

                        <div className="event-status">
                          Published
                        </div>

                      </div>

                      {/* Title */}

                      <div
                        className="event-title"
                        title={event.title}
                      >
                        {event.title}
                      </div>

                      {/* Meta */}

                      <div className="event-meta">

                        <div className="event-date">
                          <span>◷</span>

                          {new Date(
                            event.date,
                          ).toLocaleDateString(
                            'en-IN',
                          )}
                        </div>

                        <div className="event-tag">
                          ID: {event.id}
                        </div>

                      </div>

                      {/* Description */}

                      <div className="event-desc">
                        {event.description ||
                          ''}
                      </div>

                      {/* Actions */}

                      <div className="event-actions">

                        <button
                          type="button"
                          className="btn-small btn-edit"
                          onClick={() =>
                            editEvent(
                              event.id,
                            )
                          }
                        >
                          <span>✎</span>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn-small btn-delete"
                          onClick={() =>
                            deleteEvent(
                              event.id,
                            )
                          }
                          disabled={loading}
                        >
                          <span>×</span>
                          Delete
                        </button>

                      </div>

                    </div>
                  ))
                )}

              </div>

            </div>

            {/* ================= FORM ================= */}

            <div className="form-container">

              <div
                className={`mode-indicator ${
                  editingId
                    ? 'mode-edit'
                    : ''
                }`}
              >
                <span />

                {editingId
                  ? 'Edit mode'
                  : 'Add mode'}
              </div>

              <h2>
                {editingId
                  ? 'Edit Event'
                  : 'Add New Event'}
              </h2>

              <div className="form-caption">
                {editingId
                  ? 'Update the event details below.'
                  : 'Fill the details and upload images or videos for the gallery.'}
              </div>

              <form
                onSubmit={onSubmit}
                encType="multipart/form-data"
              >

                {/* Title */}

                <div className="form-group">

                  <label>
                    Title *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Event title"
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value,
                      )
                    }
                  />

                </div>

                {/* Date */}

                <div className="form-group">

                  <label>
                    Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) =>
                      setDate(
                        e.target.value,
                      )
                    }
                  />

                </div>

                {/* Description */}

                <div className="form-group">

                  <label>
                    Description *
                  </label>

                  <textarea
                    rows={4}
                    required
                    placeholder="Short description"
                    value={
                      description
                    }
                    onChange={(e) =>
                      setDescription(
                        e.target.value,
                      )
                    }
                  />

                </div>

                {/* Files */}

                <div className="form-group">

                  <label>
                    Photos & Videos
                  </label>

                  <div className="file-input-wrap">

                    <div className="file-icon">
                      ↑
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/*,video/mp4,video/webm"
                      onChange={(e) =>
                        setFiles(
                          e.target.files,
                        )
                      }
                    />

                  </div>

                  <div className="file-note">
                    JPG, PNG, MP4 or WEBM
                  </div>

                  {files &&
                    files.length > 0 && (
                      <div className="selected-files">
                        {files.length}{' '}
                        file
                        {files.length ===
                        1
                          ? ''
                          : 's'}{' '}
                        selected
                      </div>
                    )}

                </div>

                {/* Actions */}

                <div className="form-actions">

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? 'Processing...'
                      : editingId
                        ? 'Update Event'
                        : 'Upload Event'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}

                </div>

              </form>

            </div>

          </div>

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
                {notice.type ===
                'success'
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