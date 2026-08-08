'use client';

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

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    requireAuth();
    loadNews();
  }, []);

  async function loadNews() {
    try {
      setLoading(true);

      const res = await fetch('/api/news', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to load news');
      }

      const data = await res.json();

      setNews(data.news || []);
    } catch (error) {
      console.error('News loading error:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteNews(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this news?'
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setNews((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting the news.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="newslist-page">
        <div className="news-bg-glow news-glow-one" />
        <div className="news-bg-glow news-glow-two" />

        <div className="newslist-wrap">

          {/* HEADER */}
          <header className="news-header">

            <div className="news-brand">

              <div className="news-logo">
                <span>✦</span>
              </div>

              <div>
                <div className="news-eyebrow">
                  CONTENT MANAGEMENT
                </div>

                <h1>News & Updates</h1>

                <p>
                  Manage announcements, stories and important updates.
                </p>
              </div>

            </div>

            <div className="news-header-actions">

              <button
                type="button"
                className="refresh-btn"
                onClick={loadNews}
                disabled={loading}
              >
                <span className={loading ? 'refresh-icon spinning' : 'refresh-icon'}>
                  ↻
                </span>

                {loading ? 'Loading...' : 'Refresh'}
              </button>

              <Link
                href="/news"
                className="add-news-btn"
              >
                <span>＋</span>
                Add News
              </Link>

            </div>

          </header>


          {/* TOP SUMMARY */}
          <section className="news-summary">

            <div className="summary-card">

              <div className="summary-icon">
                ◈
              </div>

              <div>
                <span className="summary-label">
                  TOTAL NEWS
                </span>

                <strong>
                  {news.length}
                </strong>

                <small>
                  Published records
                </small>
              </div>

            </div>


            <div className="summary-card">

              <div className="summary-icon">
                ✓
              </div>

              <div>
                <span className="summary-label">
                  STATUS
                </span>

                <strong className="status-active">
                  Active
                </strong>

                <small>
                  Content system online
                </small>
              </div>

            </div>


            <div className="summary-card">

              <div className="summary-icon">
                ▣
              </div>

              <div>
                <span className="summary-label">
                  MANAGEMENT
                </span>

                <strong>
                  News
                </strong>

                <small>
                  Create, view and delete
                </small>
              </div>

            </div>

          </section>


          {/* SECTION TITLE */}
          <div className="section-heading">

            <div>
              <span className="section-overline">
                LATEST CONTENT
              </span>

              <h2>
                News Collection
              </h2>

              <p>
                All published news items are displayed below.
              </p>
            </div>

            <div className="news-count">
              {news.length} {news.length === 1 ? 'Article' : 'Articles'}
            </div>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="news-loading">

              <div className="loading-spinner" />

              <h3>Loading news...</h3>

              <p>
                Please wait while we fetch the latest updates.
              </p>

            </div>
          )}


          {/* EMPTY */}
          {!loading && news.length === 0 && (
            <div className="empty-news">

              <div className="empty-icon">
                ✦
              </div>

              <h3>
                No news available
              </h3>

              <p>
                You haven't published any news yet.
              </p>

              <Link
                href="/news"
                className="empty-add-btn"
              >
                ＋ Create Your First News
              </Link>

            </div>
          )}


          {/* NEWS LIST */}
          {!loading && news.length > 0 && (
            <div className="news-grid">

              {news.map((item, index) => (

                <article
                  className="news-card"
                  key={item.id}
                >

                  {/* IMAGE */}
                  <div className="news-media">

                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="news-image-placeholder">

                        <div className="placeholder-symbol">
                          ✦
                        </div>

                        <span>
                          NEWS
                        </span>

                      </div>
                    )}

                    <div className="news-number">
                      #{String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="published-badge">
                      <span />
                      Published
                    </div>

                  </div>


                  {/* CONTENT */}
                  <div className="news-content">

                    <div className="news-meta">

                      <span>
                        NEWS UPDATE
                      </span>

                      {item.created_at && (
                        <time>
                          {new Date(
                            item.created_at
                          ).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      )}

                    </div>


                    <h3>
                      {item.title}
                    </h3>


                    <p className="news-description">
                      {item.content}
                    </p>


                    <div className="news-card-footer">

                      <Link
                        href={`/newsview?id=${item.id}`}
                        target="_blank"
                        className="view-news-btn"
                      >
                        View News
                        <span>→</span>
                      </Link>


                      <button
                        type="button"
                        className="delete-news-btn"
                        onClick={() => deleteNews(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <>
                            <span className="button-spinner" />
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

                </article>

              ))}

            </div>
          )}


          {/* BOTTOM CTA */}
          {!loading && news.length > 0 && (
            <section className="news-cta">

              <div className="cta-symbol">
                +
              </div>

              <div className="cta-content">

                <span>
                  KEEP YOUR COMMUNITY UPDATED
                </span>

                <h3>
                  Have something important to share?
                </h3>

                <p>
                  Create a new announcement and keep your members informed.
                </p>

              </div>

              <Link
                href="/news"
                className="cta-button"
              >
                Create News
                <span>→</span>
              </Link>

            </section>
          )}

        </div>


        {/* FLOATING HOME */}
        <div className="home-float">
          <Link
            href="/"
            aria-label="Go to Home"
          >
            <span>⌂</span>
          </Link>
        </div>

      </div>
    </AdminLayout>
  );
}