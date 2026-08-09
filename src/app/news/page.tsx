'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { FormEvent, useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './news.css';

type NoticeType = 'success' | 'error' | 'warning';

export default function NewsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    'image' | 'video' | null
  >(null);

  const [msg, setMsg] = useState('');

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeType, setNoticeType] =
    useState<NoticeType>('success');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [redirectAfterClose, setRedirectAfterClose] =
    useState(false);

  useEffect(() => {
    requireAuth();
  }, []);

  function showNotice(
    type: NoticeType,
    titleText: string,
    messageText: string,
    redirect = false,
  ) {
    setNoticeType(type);
    setNoticeTitle(titleText);
    setNoticeMessage(messageText);
    setRedirectAfterClose(redirect);
    setNoticeOpen(true);
  }

  function closeNotice() {
    setNoticeOpen(false);

    if (redirectAfterClose) {
      setRedirectAfterClose(false);
      window.location.href = '/newslist';
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showNotice(
        'warning',
        'Required Information',
        'Title and description required.',
      );
      return;
    }

    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('content', content.trim());

    if (media) {
      formData.append('media', media);
    }

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMsg('News posted successfully');

        showNotice(
          'success',
          'News Published',
          'News posted successfully.',
          true,
        );
      } else {
        setMsg(data.message || 'Failed to post news');

        showNotice(
          'error',
          'Publishing Failed',
          data.message || 'Failed to post news.',
        );
      }
    } catch {
      setMsg('Server error');

      showNotice(
        'error',
        'Server Error',
        'Server error. Please try again later.',
      );
    }
  }

  function handleMediaChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0] || null;

    setMedia(file);

    if (!file) {
      setPreview(null);
      setPreviewType(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    if (file.type.startsWith('video/')) {
      setPreviewType('video');
    } else {
      setPreviewType('image');
    }
  }

  return (
    <AdminLayout title="Add News">
      <div className="news-page">

        <div className="news-container">

          {/* HEADER */}
          <header className="news-header">

            <div className="news-heading">

              <div className="news-eyebrow">
                ADMIN PANEL
                <span className="eyebrow-dot" />
                NEWS
              </div>

              <h1>Add News</h1>

              <p>
                Publish announcements, meeting notes, or important
                updates to the community.
              </p>

            </div>

            <div className="news-status">
              <span className="status-dot" />
              Ready to publish
            </div>

          </header>

          {/* CONTENT */}
          <div className="news-body">

            {/* LEFT INFO */}
            <aside className="news-info">

              <div className="info-card primary">

                <div className="info-icon">
                  +
                </div>

                <div>
                  <h3>Create Announcement</h3>

                  <p>
                    Add a clear title and description for your
                    community update.
                  </p>
                </div>

              </div>

              <div className="info-list">

                <div className="info-item">
                  <span className="info-number">01</span>

                  <div>
                    <strong>Title & Description</strong>
                    <small>
                      Required information
                    </small>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-number">02</span>

                  <div>
                    <strong>Optional Media</strong>
                    <small>
                      Image or MP4 video
                    </small>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-number">03</span>

                  <div>
                    <strong>Publish</strong>
                    <small>
                      Post to the community news
                    </small>
                  </div>
                </div>

              </div>

              <div className="note-box">

                <div className="note-icon">
                  i
                </div>

                <div>
                  <strong>Publishing note</strong>

                  <p>
                    Keep messages short and clear. Media will
                    appear above the text on the public news page.
                  </p>
                </div>

              </div>

            </aside>

            {/* FORM */}
            <section className="news-form-card">

              <div className="form-heading">

                <div>
                  <span>NEWS DETAILS</span>

                  <h2>Publish a new update</h2>
                </div>

                <div className="required-badge">
                  * Required
                </div>

              </div>

              <form
                onSubmit={onSubmit}
                encType="multipart/form-data"
              >

                {/* TITLE */}
                <div className="field">

                  <label htmlFor="title">
                    Title
                    <span>*</span>
                  </label>

                  <input
                    id="title"
                    type="text"
                    placeholder="News title"
                    required
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                  />

                  <div className="field-helper">
                    Use a short and meaningful headline.
                  </div>

                </div>

                {/* DESCRIPTION */}
                <div className="field">

                  <div className="label-row">

                    <label htmlFor="content">
                      Description
                      <span>*</span>
                    </label>

                    <span className="character-count">
                      {content.length} characters
                    </span>

                  </div>

                  <textarea
                    id="content"
                    rows={7}
                    placeholder="News description"
                    required
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                  />

                  <div className="field-helper">
                    Add the announcement, meeting note, or
                    important community update.
                  </div>

                </div>

                {/* MEDIA */}
                <div className="field">

                  <label htmlFor="media">
                    Media
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <div
                    className={`upload-box ${
                      media ? 'has-file' : ''
                    }`}
                  >

                    <div className="upload-icon">
                      ↑
                    </div>

                    <div className="upload-content">

                      <strong>
                        {media
                          ? media.name
                          : 'Choose image or video'}
                      </strong>

                      <span>
                        JPEG / PNG image or MP4 video
                      </span>

                    </div>

                    <label
                      htmlFor="media"
                      className="browse-button"
                    >
                      Browse
                    </label>

                    <input
                      id="media"
                      type="file"
                      accept="image/*,video/mp4"
                      onChange={handleMediaChange}
                    />

                  </div>

                  <div className="file-note">
                    Maximum recommended size: 100 MB.
                  </div>

                </div>

                {/* PREVIEW */}
                {preview && (
                  <div className="preview-section">

                    <div className="preview-header">

                      <div>
                        <span>MEDIA PREVIEW</span>
                        <strong>
                          {previewType === 'video'
                            ? 'Video preview'
                            : 'Image preview'}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="remove-preview"
                        onClick={() => {
                          setMedia(null);
                          setPreview(null);
                          setPreviewType(null);
                        }}
                      >
                        Remove
                      </button>

                    </div>

                    <div className="preview-box">

                      {previewType === 'image' && (
                        <img
                          src={preview}
                          className="preview"
                          alt="Selected media preview"
                        />
                      )}

                      {previewType === 'video' && (
                        <video
                          src={preview}
                          controls
                          className="preview"
                        />
                      )}

                    </div>

                  </div>
                )}

                {/* ACTION */}
                <div className="form-actions">

                  <button
                    type="submit"
                    className="publish-button"
                  >
                    <span className="publish-icon">
                      ↑
                    </span>

                    Post News
                  </button>

                </div>

                {msg && (
                  <p className="form-message">
                    {msg}
                  </p>
                )}

              </form>

            </section>

          </div>

        </div>

        {/* CUSTOM NOTIFICATION */}
        {noticeOpen && (
          <div
            className="news-notice-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeNotice();
              }
            }}
          >

            <div className="news-notice">

              <div
                className={`news-notice-icon ${noticeType}`}
              >
                {noticeType === 'success' && '✓'}
                {noticeType === 'error' && '×'}
                {noticeType === 'warning' && '!'}
              </div>

              <h3>{noticeTitle}</h3>

              <p>{noticeMessage}</p>

              <button
                type="button"
                className={`news-notice-button ${noticeType}`}
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