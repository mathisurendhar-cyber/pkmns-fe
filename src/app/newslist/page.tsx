'use client';

import { apiFetch } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { requireAuth } from '@/lib/auth';
import './newslist.css';

type NewsItem = {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
};

type NoticeType = 'success' | 'error' | 'warning';

type Notice = {
  show: boolean;
  type: NoticeType;
  title: string;
  message: string;
};

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [notice, setNotice] = useState<Notice>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  // =========================================================
  // AUTH + LOAD NEWS
  // =========================================================

  useEffect(() => {
    requireAuth();
    loadNews();
  }, []);

  async function loadNews() {
    try {
      setLoading(true);

      const res = await apiFetch('/api/news', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to load news');
      }

      const data = await res.json();

      setNews(Array.isArray(data.news) ? data.news : []);
    } catch (error) {
      console.error(error);

      showNotice(
        'error',
        'Unable to Load',
        'Unable to load news at this time.',
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // CUSTOM NOTICE
  // =========================================================

  function showNotice(
    type: NoticeType,
    title: string,
    message: string,
  ) {
    setNotice({
      show: true,
      type,
      title,
      message,
    });
  }

  function closeNotice() {
    setNotice((prev) => ({
      ...prev,
      show: false,
    }));
  }

  // =========================================================
  // OPEN DELETE CONFIRMATION
  // =========================================================

  function openDeleteConfirmation(id: number) {
    setDeleteId(id);
  }

  function closeDeleteConfirmation() {
    if (deleting) return;

    setDeleteId(null);
  }

  // =========================================================
  // DELETE NEWS
  // =========================================================

  async function confirmDelete() {
    if (!deleteId || deleting) {
      return;
    }

    try {
      setDeleting(true);

      const res = await apiFetch(`/api/news/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to delete news',
        );
      }

      // Remove immediately from UI
      setNews((current) =>
        current.filter((item) => item.id !== deleteId),
      );

      // Close delete modal
      setDeleteId(null);

      // Success notification
      showNotice(
        'success',
        'News Deleted',
        'The news article has been deleted successfully.',
      );
    } catch (error) {
      console.error('Delete news error:', error);

      setDeleteId(null);

      showNotice(
        'error',
        'Delete Failed',
        'Unable to delete this news article. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  }

  // =========================================================
  // DATE FORMAT
  // =========================================================

  function formatDate(date?: string) {
    if (!date) return '';

    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <AdminLayout>
      <div className="newslist-page">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="newslist-header">

          <div className="newslist-heading">

            <span className="newslist-label">
              CONTENT MANAGEMENT
            </span>

            <h1>News &amp; Updates</h1>

            <p>
              Manage announcements, stories and important
              community updates.
            </p>

          </div>

          <div className="newslist-header-actions">

            <button
              type="button"
              className="news-refresh-btn"
              onClick={loadNews}
              disabled={loading}
            >
              <span className={loading ? 'spin' : ''}>
                ↻
              </span>

              {loading ? 'Loading...' : 'Refresh'}
            </button>

            <Link
              href="/news"
              className="news-add-btn"
            >
              <span>＋</span>
              Add News
            </Link>

          </div>

        </div>

        {/* =====================================================
            SUMMARY
            ===================================================== */}

        <div className="news-summary">

          <div className="news-summary-card">

            <div className="summary-icon orange">
              ◈
            </div>

            <div>
              <span>Total News</span>
              <strong>{news.length}</strong>
              <small>Published records</small>
            </div>

          </div>

          <div className="news-summary-card">

            <div className="summary-icon green">
              ✓
            </div>

            <div>
              <span>Status</span>
              <strong>Active</strong>
              <small>Content system online</small>
            </div>

          </div>

          <div className="news-summary-card">

            <div className="summary-icon blue">
              ▣
            </div>

            <div>
              <span>Section</span>
              <strong>News</strong>
              <small>Community updates</small>
            </div>

          </div>

        </div>

        {/* =====================================================
            SECTION HEADER
            ===================================================== */}

        <div className="news-section-header">

          <div>

            <span className="section-label">
              NEWS DIRECTORY
            </span>

            <h2>Published News</h2>

            <p>
              View and manage all published news articles.
            </p>

          </div>

          <div className="article-count">
            {news.length}{' '}
            {news.length === 1 ? 'Article' : 'Articles'}
          </div>

        </div>

        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading && (
          <div className="news-loading">

            <div className="loading-circle" />

            <h3>Loading News</h3>

            <p>
              Fetching the latest community updates...
            </p>

          </div>
        )}

        {/* =====================================================
            EMPTY
            ===================================================== */}

        {!loading && news.length === 0 && (
          <div className="news-empty">

            <div className="empty-icon">
              +
            </div>

            <h3>No News Available</h3>

            <p>
              There are no published news articles yet.
            </p>

            <Link
              href="/news"
              className="empty-add-btn"
            >
              ＋ Add First News
            </Link>

          </div>
        )}

        {/* =====================================================
            NEWS GRID
            ===================================================== */}

        {!loading && news.length > 0 && (
          <div className="news-grid">

            {news.map((item, index) => (

              <article
                className="news-card"
                key={item.id}
              >

                {/* IMAGE */}

                <div className="news-image">

                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                    />
                  ) : (
                    <div className="news-image-empty">
                      <span>✦</span>
                      <small>NEWS</small>
                    </div>
                  )}

                  <div className="news-index">
                    #{String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="published-tag">
                    <span />
                    Published
                  </div>

                </div>

                {/* CONTENT */}

                <div className="news-card-content">

                  <div className="news-meta">

                    <span>
                      NEWS UPDATE
                    </span>

                    {item.created_at && (
                      <time>
                        {formatDate(item.created_at)}
                      </time>
                    )}

                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p className="news-description">
                    {item.content}
                  </p>

                  {/* BUTTONS */}

                  <div className="news-card-actions">

                    <Link
                      href={`/newsview?id=${item.id}`}
                      target="_blank"
                      className="view-news-btn"
                    >
                      <span>View News</span>
                      <b>→</b>
                    </Link>

                    <button
                      type="button"
                      className="delete-news-btn"
                      onClick={() =>
                        openDeleteConfirmation(item.id)
                      }
                    >
                      <span>Delete</span>
                      <b>×</b>
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

        {/* =====================================================
            BOTTOM CTA
            ===================================================== */}

        {!loading && news.length > 0 && (
          <div className="news-bottom-cta">

            <div className="cta-left">

              <div className="cta-icon">
                +
              </div>

              <div>

                <span>
                  KEEP YOUR COMMUNITY UPDATED
                </span>

                <h3>
                  Have something important to share?
                </h3>

                <p>
                  Create a new announcement and keep your
                  members informed.
                </p>

              </div>

            </div>

            <Link
              href="/news"
              className="cta-add-btn"
            >
              Create News
              <b>→</b>
            </Link>

          </div>
        )}

        {/* =====================================================
            DELETE CONFIRMATION MODAL
            ===================================================== */}

        {deleteId !== null && (
          <div
            className="custom-modal-overlay"
            role="presentation"
          >

            <div
              className="custom-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
            >

              <div className="modal-icon warning">
                !
              </div>

              <div className="modal-content">

                <h3 id="delete-title">
                  Delete News?
                </h3>

                <p>
                  Are you sure you want to delete this news?
                  This action cannot be undone.
                </p>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeDeleteConfirmation}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="modal-delete-btn"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="button-loader" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      Delete
                      <span>×</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            SUCCESS / ERROR NOTIFICATION
            ===================================================== */}

        {notice.show && (
          <div
            className="custom-modal-overlay"
            role="presentation"
            onClick={closeNotice}
          >

            <div
              className="custom-notification"
              role="dialog"
              aria-modal="true"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div
                className={`notification-icon ${notice.type}`}
              >
                {notice.type === 'success' && '✓'}
                {notice.type === 'error' && '×'}
                {notice.type === 'warning' && '!'}
              </div>

              <h3>
                {notice.title}
              </h3>

              <p>
                {notice.message}
              </p>

              <button
                type="button"
                className={`notification-ok ${notice.type}`}
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