'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { requireAuth } from '@/lib/auth';
import './next-event.css';

type EventItem = {
  id: number;
  title: string;
  date: string;
  description?: string;
};

type NoticeType = 'success' | 'error';

const MAX_FILES = 30;

export default function NextEventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // ============================================================
  // LOAD EVENTS
  // ============================================================

  async function loadEvents() {
    try {
      const res = await fetch('/api/events', {
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

  // ============================================================
  // NOTICE
  // ============================================================

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

  // ============================================================
  // RESET
  // ============================================================

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setDate('');
    setDescription('');
    setFiles(null);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // ============================================================
  // EDIT
  // ============================================================

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // ============================================================
  // FILE SIZE FORMAT
  // ============================================================

  function formatFileSize(bytes: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const units = [
      'Bytes',
      'KB',
      'MB',
      'GB',
      'TB',
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024),
    );

    const value =
      bytes /
      Math.pow(1024, index);

    return `${value.toFixed(
      value >= 100 ? 0 : 2,
    )} ${units[index]}`;
  }

  // ============================================================
  // FILE SELECTION
  //
  // IMPORTANT:
  // NO FILE SIZE LIMIT HERE.
  //
  // Large videos are allowed from frontend.
  // Only number of files is restricted to 30.
  // ============================================================

  function handleFilesChange(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const selected = e.target.files;

    if (!selected) {
      setFiles(null);
      return;
    }

    // Maximum 30 files
    if (selected.length > MAX_FILES) {
      showNotice(
        'error',
        'Too Many Files',
        `You can upload maximum ${MAX_FILES} photos or videos in one event.`,
      );

      e.target.value = '';
      setFiles(null);
      return;
    }

    setFiles(selected);
    setUploadProgress(0);
  }

  // ============================================================
  // DELETE EVENT
  // ============================================================

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

  // ============================================================
  // CREATE EVENT
  //
  // XMLHttpRequest is used here instead of fetch
  // because it allows upload progress for large videos.
  // ============================================================

  function uploadNewEvent(
    formData: FormData,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(
        'POST',
        '/api/events',
        true,
      );

      // Upload progress
      xhr.upload.onprogress = (
        event,
      ) => {
        if (event.lengthComputable) {
          const progress = Math.round(
            (event.loaded / event.total) *
              100,
          );

          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        let data: any = {};

        try {
          data = xhr.responseText
            ? JSON.parse(
                xhr.responseText,
              )
            : {};
        } catch {
          data = {};
        }

        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          resolve(data);
        } else {
          reject({
            status: xhr.status,
            data,
          });
        }
      };

      xhr.onerror = () => {
        reject({
          status: 0,
          data: {
            message:
              'Network error while uploading files.',
          },
        });
      };

      xhr.onabort = () => {
        reject({
          status: 0,
          data: {
            message:
              'Upload was cancelled.',
          },
        });
      };

      xhr.upload.onloadend = () => {
        setUploadProgress(100);
      };

      xhr.send(formData);
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function onSubmit(
    e: FormEvent,
  ) {
    e.preventDefault();

    // ==========================================================
    // ADD EVENT
    // ==========================================================

    if (!editingId) {
      // Validate title
      if (!title.trim()) {
        showNotice(
          'error',
          'Title Required',
          'Please enter an event title.',
        );

        return;
      }

      // Validate date
      if (!date) {
        showNotice(
          'error',
          'Date Required',
          'Please select an event date.',
        );

        return;
      }

      // Validate description
      if (!description.trim()) {
        showNotice(
          'error',
          'Description Required',
          'Please enter an event description.',
        );

        return;
      }

      // Validate file count
      if (
        files &&
        files.length > MAX_FILES
      ) {
        showNotice(
          'error',
          'Too Many Files',
          `Maximum ${MAX_FILES} files are allowed per event.`,
        );

        return;
      }

      try {
        setLoading(true);
        setUploadProgress(0);

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

        // ======================================================
        // ADD ALL FILES
        // ======================================================

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

        // ======================================================
        // UPLOAD
        // ======================================================

        const data =
          await uploadNewEvent(
            formData,
          );

        if (
          !data.success
        ) {
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
          files && files.length > 0
            ? `Event created successfully with ${files.length} media file${
                files.length === 1
                  ? ''
                  : 's'
              }.`
            : 'The event has been added successfully.',
        );

        return;
      } catch (error: any) {
        console.error(
          'Event upload error:',
          error,
        );

        const message =
          error?.data?.message ||
          'Unable to upload the event. Please try again.';

        showNotice(
          'error',
          'Upload Failed',
          message,
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // ==========================================================
    // UPDATE EVENT
    // ==========================================================

    try {
      setLoading(true);

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

      if (
        !res.ok ||
        !data.success
      ) {
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

  // ============================================================
  // SELECTED FILE INFORMATION
  // ============================================================

  const selectedFileArray =
    files
      ? Array.from(files)
      : [];

  const totalSize =
    selectedFileArray.reduce(
      (total, file) =>
        total + file.size,
      0,
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AdminLayout>
      <div className="next-event-page">

        <div className="shell">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="shell-header">

            <div>
              <div className="shell-title">
                Events Manager
              </div>

              <div className="shell-subtitle">
                Create, edit and maintain
                association events.
              </div>
            </div>

            <div className="shell-badge">
              Admin · Ambal Nagar
            </div>

          </div>

          {/* ====================================================
              CONTENT
          ==================================================== */}

          <div className="container">

            {/* ==================================================
                EVENTS LIST
            ================================================== */}

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
                      Add your first event
                      using the form on
                      the right.
                    </div>

                  </div>
                ) : (
                  events.map(
                    (event) => (
                      <div
                        className={`event-card ${
                          editingId ===
                          event.id
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
                          title={
                            event.title
                          }
                        >
                          {event.title}
                        </div>

                        {/* Meta */}

                        <div className="event-meta">

                          <div className="event-date">
                            <span>
                              ◷
                            </span>

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
                            <span>
                              ✎
                            </span>
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
                            <span>
                              ×
                            </span>
                            Delete
                          </button>

                        </div>

                      </div>
                    ),
                  )
                )}

              </div>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

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
                  : 'Fill the details and upload photos or videos for the gallery.'}
              </div>

              <form
                onSubmit={onSubmit}
                encType="multipart/form-data"
              >

                {/* ==================================================
                    TITLE
                ================================================== */}

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
                    disabled={loading}
                  />

                </div>

                {/* ==================================================
                    DATE
                ================================================== */}

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
                    disabled={loading}
                  />

                </div>

                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

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
                    disabled={loading}
                  />

                </div>

                {/* ==================================================
                    FILE UPLOAD
                ================================================== */}

                <div className="form-group">

                  <label>
                    Photos & Videos
                  </label>

                  <div className="file-input-wrap">

                    <div className="file-icon">
                      ↑
                    </div>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      multiple
                      accept="image/*,video/mp4,video/webm"
                      onChange={
                        handleFilesChange
                      }
                      disabled={loading}
                    />

                  </div>

                  {/* =================================================
                      FILE LIMIT INFO
                  ================================================= */}

                  <div className="file-note">
                    JPG, PNG, MP4 or WEBM
                    <br />
                    Maximum{' '}
                    <strong>
                      {MAX_FILES}
                    </strong>{' '}
                    photos/videos per
                    event.
                    <br />
                    Large videos are
                    supported. No
                    frontend file-size
                    restriction.
                  </div>

                  {/* =================================================
                      SELECTED FILE SUMMARY
                  ================================================= */}

                  {files &&
                    files.length >
                      0 && (
                      <div className="selected-files">

                        <div>
                          <strong>
                            {
                              files.length
                            }
                          </strong>{' '}
                          file
                          {files.length ===
                          1
                            ? ''
                            : 's'}{' '}
                          selected
                        </div>

                        <div>
                          Total size:{' '}
                          <strong>
                            {formatFileSize(
                              totalSize,
                            )}
                          </strong>
                        </div>

                      </div>
                    )}

                  {/* =================================================
                      FILE LIST
                  ================================================= */}

                  {selectedFileArray.length >
                    0 && (
                    <div className="selected-files-list">

                      {selectedFileArray.map(
                        (
                          file,
                          index,
                        ) => (
                          <div
                            className="selected-file-row"
                            key={`${file.name}-${index}`}
                          >

                            <div className="selected-file-name">

                              <span>
                                {file.type.startsWith(
                                  'video/',
                                )
                                  ? '🎬'
                                  : '🖼️'}
                              </span>

                              <span
                                title={
                                  file.name
                                }
                              >
                                {
                                  file.name
                                }
                              </span>

                            </div>

                            <div className="selected-file-size">
                              {formatFileSize(
                                file.size,
                              )}
                            </div>

                          </div>
                        ),
                      )}

                    </div>
                  )}

                </div>

                {/* ==================================================
                    UPLOAD PROGRESS
                ================================================== */}

                {loading &&
                  !editingId && (
                    <div className="upload-progress-container">

                      <div className="upload-progress-header">

                        <span>
                          Uploading media...
                        </span>

                        <strong>
                          {
                            uploadProgress
                          }
                          %
                        </strong>

                      </div>

                      <div className="upload-progress-track">

                        <div
                          className="upload-progress-bar"
                          style={{
                            width: `${uploadProgress}%`,
                          }}
                        />

                      </div>

                      <div className="upload-progress-text">
                        Please don't close
                        this page while
                        the upload is in
                        progress.
                      </div>

                    </div>
                  )}

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="form-actions">

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? !editingId
                        ? `Uploading ${uploadProgress}%`
                        : 'Processing...'
                      : editingId
                        ? 'Update Event'
                        : 'Upload Event'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={
                        resetForm
                      }
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

        {/* ========================================================
            NOTIFICATION
        ======================================================== */}

        {notice.show && (
          <div
            className="notification-overlay"
            onClick={
              closeNotice
            }
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
                onClick={
                  closeNotice
                }
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