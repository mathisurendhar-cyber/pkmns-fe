'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { FormEvent, useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './news.css';

export default function NewsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(
    null,
  );
  const [msg, setMsg] = useState('');

  useEffect(() => {
    requireAuth();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and description required');
      return;
    }
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    if (media) formData.append('media', media);

    try {
      const res = await fetch('/api/news', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMsg('News posted successfully');
        setTimeout(() => {
          window.location.href = '/newslist';
        }, 800);
      } else {
        setMsg(data.message || 'Failed to post news');
      }
    } catch {
      setMsg('Server error');
    }
  }

  return (
    <AdminLayout title="Add News">
      <div className="news-page">
        <div className="page">
          <div className="info">
            <div className="badge">
              <span /> Admin panel · News
            </div>
            <div className="title">Add News</div>
            <div className="subtitle">
              Publish announcements, meeting notes, or important updates to the
              community.
            </div>
            <div className="pill-row">
              <div className="pill">Required: title & description</div>
              <div className="pill">Optional: image / MP4</div>
            </div>
            <div className="note-box">
              Keep messages short and clear. Media will appear above the text on
              the public news page.
            </div>
          </div>

          <div className="form-wrap">
            <form onSubmit={onSubmit} encType="multipart/form-data">
              <div>
                <label>Title</label>
                <input
                  type="text"
                  placeholder="News title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  rows={5}
                  placeholder="News description"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div>
                <label>Media (optional)</label>
                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setMedia(file);
                    if (!file) {
                      setPreview(null);
                      setPreviewType(null);
                      return;
                    }
                    setPreview(URL.createObjectURL(file));
                    setPreviewType(
                      file.type.startsWith('video/') ? 'video' : 'image',
                    );
                  }}
                />
                <div className="file-note">
                  JPEG / PNG image or MP4 video, up to 100 MB.
                </div>
                <div id="previewWrap">
                  {preview && previewType === 'image' && (
                    <img src={preview} className="preview" alt="preview" />
                  )}
                  {preview && previewType === 'video' && (
                    <video src={preview} controls className="preview" />
                  )}
                </div>
              </div>
              <div className="actions">
                <button type="submit">Post News</button>
              </div>
              <p id="msg">{msg}</p>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
