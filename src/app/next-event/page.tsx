'use client';

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

export default function NextEventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    requireAuth();
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setDate('');
    setDescription('');
    setFiles(null);
  }

  function editEvent(id: number) {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    setEditingId(id);
    setTitle(event.title);
    setDate(event.date?.split('T')[0] || '');
    setDescription(event.description || '');
  }

  async function deleteEvent(id: number) {
    if (!confirm('Event delete pannalama?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Event deleted!');
        await loadEvents();
        resetForm();
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Network error');
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (!editingId) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('date', date);
        formData.append('description', description);
        if (files) {
          Array.from(files).forEach((f) => formData.append('files', f));
        }
        const res = await fetch('/api/events', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          alert('Event added!');
          await loadEvents();
          resetForm();
        } else {
          alert('Add failed');
        }
        return;
      }

      const res = await fetch(`/api/events/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, description }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Event updated!');
        await loadEvents();
        resetForm();
      } else {
        alert('Update failed');
      }
    } catch {
      alert('Network error!');
    }
  }

  return (
    <AdminLayout title="Events Manager">
      <div className="next-event-page">
        <div className="shell">
          <div className="shell-header">
            <div>
              <div className="shell-title">Events Manager</div>
              <div className="shell-subtitle">
                Create, edit and maintain association events.
              </div>
            </div>
            <div className="shell-badge">Admin · Ambal Nagar</div>
          </div>

          <div className="container">
            <div className="events-list">
              <div className="section-head">
                <div className="section-title">All Events</div>
                <div className="section-count">
                  {events.length} event{events.length === 1 ? '' : 's'}
                </div>
              </div>
              <div className="events-grid">
                {!events.length ? (
                  <div className="no-events">
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      No events found
                    </div>
                    <div>Add your first event using the form on the right.</div>
                  </div>
                ) : (
                  events.map((event) => (
                    <div className="event-card" key={event.id}>
                      <div className="event-title" title={event.title}>
                        {event.title}
                      </div>
                      <div className="event-meta">
                        <div className="event-date">
                          {new Date(event.date).toLocaleDateString('en-IN')}
                        </div>
                        <div className="event-tag">ID: {event.id}</div>
                      </div>
                      <div className="event-desc">{event.description || ''}</div>
                      <div className="event-actions">
                        <button
                          type="button"
                          className="btn-small btn-edit"
                          onClick={() => editEvent(event.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-small btn-delete"
                          onClick={() => deleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-container">
              <div
                className={`mode-indicator ${editingId ? 'mode-edit' : ''}`}
              >
                <span /> {editingId ? 'Edit mode' : 'Add mode'}
              </div>
              <h2>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
              <div className="form-caption">
                Fill the details and upload images or videos for the gallery.
              </div>
              <form onSubmit={onSubmit} encType="multipart/form-data">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <label>Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label>Photos & Videos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm"
                  onChange={(e) => setFiles(e.target.files)}
                />
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update Event' : 'Upload Event'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
