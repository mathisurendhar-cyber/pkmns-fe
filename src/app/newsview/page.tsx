'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import './newsview.css';

type NewsItem = {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
};

function NewsViewInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [news, setNews] = useState<NewsItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No news id provided');
      return;
    }
    fetch(`/api/news/${id}`)
      .then((res) => res.json())
      .then((n) => {
        if (!n || !n.id) {
          setError('News not found');
          return;
        }
        setNews(n);
      })
      .catch(() => setError('Error loading news'));
  }, [id]);

  if (error) return <div className="wrap">{error}</div>;
  if (!news) return <div className="wrap">Loading...</div>;

  return (
    <div className="wrap">
      <h1>{news.title}</h1>
      <div className="meta">
        {news.created_at ? new Date(news.created_at).toLocaleString() : ''}
      </div>
      {news.image_url ? (
        <img src={news.image_url} alt="news image" />
      ) : null}
      <p>{news.content}</p>
    </div>
  );
}

export default function NewsViewPage() {
  return (
    <div className="newsview-page">
      <Suspense fallback={<div className="wrap">Loading...</div>}>
        <NewsViewInner />
      </Suspense>
    </div>
  );
}
