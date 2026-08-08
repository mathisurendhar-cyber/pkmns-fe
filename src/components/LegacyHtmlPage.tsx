'use client';

import { useEffect } from 'react';

export default function LegacyHtmlPage({ page }: { page: string }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/pages/${page}`);
      const html = await res.text();
      if (cancelled) return;
      document.open();
      document.write(html);
      document.close();
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#333',
      }}
    >
      Loading…
    </div>
  );
}
