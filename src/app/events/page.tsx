'use client';

import { apiFetch } from '@/lib/api';
import SiteNavbar from '@/components/layout/SiteNavbar';
import { useEffect, useMemo, useState } from 'react';
import './events.css';

type EventItem = {
  id: number;
  title: string;
  date: string;
  description?: string;
  files?: string[];
};

type Group = {
  title: string;
  dates: string[];
  descriptions: string[];
  files: string[];
};

function normalizeTitle(title: string) {
  return (title || '').trim().toLowerCase();
}

function groupEvents(list: EventItem[]) {
  const map: Record<string, Group> = {};
  list.forEach((ev) => {
    const key = normalizeTitle(ev.title) || `event_${ev.id}`;
    if (!map[key]) {
      map[key] = { title: ev.title, dates: [], descriptions: [], files: [] };
    }
    map[key].dates.push(ev.date);
    if (ev.description) map[key].descriptions.push(ev.description);
    if (Array.isArray(ev.files)) {
      ev.files.forEach((f) => {
        if (!map[key].files.includes(f)) map[key].files.push(f);
      });
    }
  });
  return Object.values(map);
}

export default function EventsPage() {
  const [upcoming, setUpcoming] = useState<Group[]>([]);
  const [past, setPast] = useState<Group[]>([]);
  const [modal, setModal] = useState<{
    group: Group;
    mediaIndex: number;
  } | null>(null);

  useEffect(() => {
    apiFetch('/api/events')
      .then((r) => r.json())
      .then((result) => {
        const events: EventItem[] = Array.isArray(result)
          ? result
          : result.events || [];
        const now = new Date();
        setUpcoming(
          groupEvents(events.filter((e) => new Date(e.date) >= now)),
        );
        setPast(groupEvents(events.filter((e) => new Date(e.date) < now)));
      })
      .catch(console.error);
  }, []);

  const media = useMemo(() => modal?.group.files || [], [modal]);

  return (
    <div className="events-page">
      <SiteNavbar />

      <section className="hero-section">
        <h1>Events & Gallery</h1>
        <p>Recent and past activities of Sri Ambal Nagar community.</p>
      </section>

      <div className="container">
        <h2 className="section-title">
          New <span className="bar" />
        </h2>
        <div className="events-grid">
          {upcoming.map((g, idx) => (
            <EventCard
              key={`u-${idx}`}
              group={g}
              onOpen={() => setModal({ group: g, mediaIndex: 0 })}
            />
          ))}
        </div>
        <h2 className="section-title">
          Past <span className="bar" />
        </h2>
        <div className="events-grid">
          {past.map((g, idx) => (
            <EventCard
              key={`p-${idx}`}
              group={g}
              onOpen={() => setModal({ group: g, mediaIndex: 0 })}
            />
          ))}
        </div>
      </div>

      {modal && (
        <div
          className="modal-bg"
          style={{ display: 'flex' }}
          onClick={() => setModal(null)}
        >
          <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setModal(null)}
            >
              Close
            </button>
            <div className="modal-box">
              <div className="modal-media">
                {media.length ? (
                  media[modal.mediaIndex]?.match(/\.(mp4|webm)$/i) ? (
                    <video
                      controls
                      src={media[modal.mediaIndex]}
                      style={{ maxWidth: '100%' }}
                    />
                  ) : (
                    <img
                      src={media[modal.mediaIndex]}
                      alt={modal.group.title}
                      style={{ maxWidth: '100%' }}
                    />
                  )
                ) : (
                  <div>No media</div>
                )}
                {media.length > 1 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() =>
                        setModal((m) =>
                          m
                            ? {
                                ...m,
                                mediaIndex:
                                  (m.mediaIndex - 1 + media.length) %
                                  media.length,
                              }
                            : m,
                        )
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModal((m) =>
                          m
                            ? {
                                ...m,
                                mediaIndex: (m.mediaIndex + 1) % media.length,
                              }
                            : m,
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-content">
                <h3 className="modal-title">{modal.group.title}</h3>
                <div className="modal-date">
                  {new Date(
                    modal.group.dates.slice().sort()[0],
                  ).toLocaleDateString('en-IN')}
                </div>
                <p className="modal-text">{modal.group.descriptions[0] || ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>
          &copy; 2025 Sri Ambal Nagar Peoples Welfare Association. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

function EventCard({
  group,
  onOpen,
}: {
  group: Group;
  onOpen: () => void;
}) {
  const firstFile = group.files[0];
  const mainDate = group.dates.slice().sort()[0];
  return (
    <div className="event-card" onClick={onOpen} role="button" tabIndex={0}>
      {firstFile ? (
        firstFile.match(/\.(mp4|webm)$/i) ? (
          <video className="event-image" muted src={firstFile} />
        ) : (
          <img src={firstFile} className="event-image" alt={group.title} />
        )
      ) : (
        <div className="event-image" />
      )}
      <div className="event-body">
        <h3 className="event-title">{group.title}</h3>
        <span className="event-date">
          {new Date(mainDate).toLocaleDateString('en-IN')}
        </span>
        <p className="event-desc">{group.descriptions[0] || ''}</p>
      </div>
    </div>
  );
}
