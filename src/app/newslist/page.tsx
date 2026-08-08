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

  useEffect(() => {
    requireAuth();
    load();
  }, []);

  async function load() {
    const res = await fetch('/api/news');
    const data = await res.json();
    setNews(data.news || []);
  }

  async function del(id: number) {
    if (!confirm('Delete this news?')) return;
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) load();
    else alert('Delete failed');
  }

  return (
    <AdminLayout title="News List">
      <div className="newslist-page">
        <div id="list">
          {!news.length && <b>No news yet</b>}
          {news.map((n) => (
            <div className="item" key={n.id}>
              <div className="meta">
                <strong>{n.title}</strong>
                <div className="date">
                  {n.created_at
                    ? new Date(n.created_at).toLocaleString()
                    : ''}
                </div>
                <p>{n.content}</p>
                <div className="actions">
                  <Link
                    className="view"
                    href={`/newsview?id=${n.id}`}
                    target="_blank"
                  >
                    View
                  </Link>
                  <button type="button" onClick={() => del(n.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="media">
                {n.image_url ? <img src={n.image_url} alt="media" /> : null}
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16 }}>
          <Link href="/news">+ Add News</Link>
        </p>
      </div>
    </AdminLayout>
  );
}
