'use client';

import { useEffect, useMemo, useState } from 'react';
import './events.css';

type EventItem = {
  id: number;
  title: string;
  date: string;
  description?: string;
  files?: string[];
};

type EventGroup = {
  title: string;
  dates: string[];
  descriptions: string[];
  files: string[];
};

type ModalState = {
  group: EventGroup;
  index: number;
} | null;

function normalizeTitle(title: string) {
  return (title || '').trim().toLowerCase();
}

function groupEvents(events: EventItem[]): EventGroup[] {
  const map: Record<string, EventGroup> = {};

  events.forEach((event) => {
    const key =
      normalizeTitle(event.title) ||
      `event_${event.id}`;

    if (!map[key]) {
      map[key] = {
        title: event.title,
        dates: [],
        descriptions: [],
        files: [],
      };
    }

    map[key].dates.push(event.date);

    if (event.description) {
      map[key].descriptions.push(event.description);
    }

    if (Array.isArray(event.files)) {
      event.files.forEach((file) => {
        if (file && !map[key].files.includes(file)) {
          map[key].files.push(file);
        }
      });
    }
  });

  return Object.values(map);
}

function isVideo(file: string) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(file);
}

function formatDate(date: string) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getMainDate(group: EventGroup) {
  if (!group.dates.length) {
    return '';
  }

  return group.dates
    .slice()
    .sort(
      (a, b) =>
        new Date(a).getTime() -
        new Date(b).getTime(),
    )[0];
}

export default function EventsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [events, setEvents] = useState<EventGroup[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedFolder, setSelectedFolder] =
    useState('ALL');

  const [modal, setModal] =
    useState<ModalState>(null);

  /* ===============================
     GET EVENTS
     =============================== */

  useEffect(() => {
    fetch('/api/events')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load events');
        }

        return response.json();
      })
      .then((result) => {
        const data: EventItem[] =
          Array.isArray(result)
            ? result
            : result?.events || [];

        setEvents(groupEvents(data));
      })
      .catch((error) => {
        console.error('Events API Error:', error);
        setEvents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* ===============================
     FOLDERS
     =============================== */

  const folders = useMemo(() => {
    return events
      .map((event) => event.title)
      .filter(Boolean);
  }, [events]);

  /* ===============================
     FILTER
     =============================== */

  const filteredEvents = useMemo(() => {
    if (selectedFolder === 'ALL') {
      return events;
    }

    return events.filter(
      (event) =>
        normalizeTitle(event.title) ===
        normalizeTitle(selectedFolder),
    );
  }, [events, selectedFolder]);

  /* ===============================
     OPEN VIEWER
     =============================== */

  function openGallery(
    group: EventGroup,
    index = 0,
  ) {
    if (!group.files.length) return;

    setModal({
      group,
      index,
    });

    document.body.style.overflow = 'hidden';
  }

  /* ===============================
     CLOSE VIEWER
     =============================== */

  function closeGallery() {
    setModal(null);
    document.body.style.overflow = '';
  }

  /* ===============================
     NEXT
     =============================== */

  function nextMedia() {
    setModal((current) => {
      if (!current) return current;

      const total = current.group.files.length;

      return {
        ...current,
        index: (current.index + 1) % total,
      };
    });
  }

  /* ===============================
     PREVIOUS
     =============================== */

  function previousMedia() {
    setModal((current) => {
      if (!current) return current;

      const total = current.group.files.length;

      return {
        ...current,
        index:
          (current.index - 1 + total) % total,
      };
    });
  }

  /* ===============================
     KEYBOARD
     =============================== */

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      if (!modal) return;

      if (event.key === 'Escape') {
        closeGallery();
      }

      if (event.key === 'ArrowLeft') {
        previousMedia();
      }

      if (event.key === 'ArrowRight') {
        nextMedia();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyboard,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyboard,
      );
    };
  }, [modal]);

  return (
    <div className="events-page">

      {/* ===============================
          HEADER
          =============================== */}

      <header className="events-header">
        <div className="header-inner">

          <a href="/" className="brand-link">

            <div className="brand-logo-wrap">
              <img
                src="/img/logo.png"
                alt="Sri Ambal Nagar"
              />
            </div>

            <div className="brand-details">
              <div className="brand-name">
                Sri AmbalNagar
              </div>

              <div className="brand-subtitle">
                MAKKAL NALVAZHU SANGAM
              </div>
            </div>

          </a>

          <nav
            className={
              menuOpen
                ? 'desktop-nav mobile-open'
                : 'desktop-nav'
            }
          >
            <a href="/">Home</a>

            <a href="/about">
              About Us
            </a>

            <a href="/members">
              Members
            </a>

            <a
              href="/events"
              className="nav-active"
            >
              Events
            </a>

            <a href="/contact">
              Contact Us
            </a>

            <a href="/login">
              Login
            </a>
          </nav>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() =>
              setMenuOpen(
                (value) => !value,
              )
            }
          >
            {menuOpen ? '×' : '☰'}
          </button>

        </div>
      </header>


      {/* ===============================
          SMALL HERO
          =============================== */}

      <section className="events-hero">

        <div className="hero-label">
          COMMUNITY MOMENTS
        </div>

        <h1>
          Events <span>&</span> Gallery
        </h1>

        <p>
          Memories and moments from
          Sri Ambal Nagar community.
        </p>

      </section>


      {/* ===============================
          TOOLBAR
          =============================== */}

      <section className="gallery-toolbar">

        <div className="toolbar-left">

          <span className="toolbar-label">
            GALLERY
          </span>

          <h2>
            Community Memories
          </h2>

        </div>

        <div className="folder-select-wrap">

          <select
            value={selectedFolder}
            onChange={(event) =>
              setSelectedFolder(
                event.target.value,
              )
            }
            className="folder-select"
          >
            <option value="ALL">
              All Folders
            </option>

            {folders.map(
              (folder, index) => (
                <option
                  key={`${folder}-${index}`}
                  value={folder}
                >
                  {folder}
                </option>
              ),
            )}
          </select>

          <span className="folder-arrow">
            ▼
          </span>

        </div>

      </section>


      {/* ===============================
          GALLERY
          =============================== */}

      <main className="gallery-area">

        {loading && (
          <div className="gallery-message">
            Loading gallery...
          </div>
        )}

        {!loading &&
          filteredEvents.length === 0 && (
            <div className="gallery-message">
              No gallery items found.
            </div>
          )}

        {!loading &&
          filteredEvents.length > 0 && (

            <div className="gallery-stack">

              {filteredEvents.map(
                (group, eventIndex) => (

                  <section
                    className="gallery-folder"
                    key={`${group.title}-${eventIndex}`}
                  >

                    {/* EVENT TITLE */}

                    <div className="folder-heading">

                      <div>
                        <h3>
                          {group.title}
                        </h3>

                        <p>
                          {formatDate(
                            getMainDate(group),
                          )}

                          {group
                            .descriptions[0] &&
                            ` • ${group.descriptions[0]}`}
                        </p>
                      </div>

                      <div className="photo-count">
                        {group.files.length}{' '}
                        Media
                      </div>

                    </div>


                    {/* COLLAGE */}

                    {group.files.length > 0 && (

                      <div className="media-collage">

                        {/* MAIN MEDIA */}

                        <button
                          type="button"
                          className="media-main"
                          onClick={() =>
                            openGallery(
                              group,
                              0,
                            )
                          }
                        >

                          {isVideo(
                            group.files[0],
                          ) ? (
                            <>
                              <video
                                src={
                                  group.files[0]
                                }
                                muted
                                playsInline
                                preload="metadata"
                              />

                              <span className="play-icon">
                                ▶
                              </span>
                            </>
                          ) : (
                            <img
                              src={
                                group.files[0]
                              }
                              alt={
                                group.title
                              }
                            />
                          )}

                        </button>


                        {/* OTHER MEDIA */}

                        {group.files
                          .slice(1, 6)
                          .map(
                            (
                              file,
                              index,
                            ) => {

                              const realIndex =
                                index + 1;

                              const remaining =
                                group.files
                                  .length -
                                6;

                              const showMore =
                                index === 4 &&
                                remaining > 0;

                              return (
                                <button
                                  type="button"
                                  className="media-small"
                                  key={`${file}-${realIndex}`}
                                  onClick={() =>
                                    openGallery(
                                      group,
                                      realIndex,
                                    )
                                  }
                                >

                                  {isVideo(file) ? (
                                    <>
                                      <video
                                        src={file}
                                        muted
                                        playsInline
                                        preload="metadata"
                                      />

                                      <span className="small-play">
                                        ▶
                                      </span>
                                    </>
                                  ) : (
                                    <img
                                      src={file}
                                      alt={
                                        group.title
                                      }
                                    />
                                  )}

                                  {showMore && (
                                    <span className="more-media">
                                      <strong>
                                        +{remaining}
                                      </strong>

                                      <small>
                                        More
                                      </small>
                                    </span>
                                  )}

                                </button>
                              );
                            },
                          )}

                      </div>

                    )}

                  </section>
                ),
              )}

            </div>
          )}

      </main>


      {/* ===============================
          FULLSCREEN VIEWER
          =============================== */}

      {modal && (

        <div
          className="fullscreen-viewer"
          onClick={closeGallery}
        >

          <div
            className="viewer-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="viewer-header">

              <div className="viewer-heading">

                <span>
                  COMMUNITY GALLERY
                </span>

                <h3>
                  {modal.group.title}
                </h3>

              </div>

              <div className="viewer-header-right">

                <div className="viewer-counter">
                  {modal.index + 1}
                  {' / '}
                  {modal.group.files.length}
                </div>

                <button
                  type="button"
                  className="close-viewer"
                  onClick={closeGallery}
                >
                  ×
                </button>

              </div>

            </div>


            <div className="viewer-media-area">

              {isVideo(
                modal.group.files[
                  modal.index
                ],
              ) ? (

                <video
                  key={
                    modal.group.files[
                      modal.index
                    ]
                  }
                  className="fullscreen-media"
                  src={
                    modal.group.files[
                      modal.index
                    ]
                  }
                  controls
                  autoPlay
                  playsInline
                />

              ) : (

                <img
                  key={
                    modal.group.files[
                      modal.index
                    ]
                  }
                  className="fullscreen-media"
                  src={
                    modal.group.files[
                      modal.index
                    ]
                  }
                  alt={
                    modal.group.title
                  }
                />

              )}

              {modal.group.files.length > 1 && (
                <>
                  <button
                    type="button"
                    className="viewer-arrow viewer-prev"
                    onClick={
                      previousMedia
                    }
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="viewer-arrow viewer-next"
                    onClick={nextMedia}
                  >
                    ›
                  </button>
                </>
              )}

            </div>


            <div className="viewer-footer">

              <span>
                {formatDate(
                  getMainDate(
                    modal.group,
                  ),
                )}
              </span>

              <p>
                {modal.group
                  .descriptions[0] ||
                  'Community memories'}
              </p>

            </div>

          </div>

        </div>
      )}


      <footer className="events-footer">
        © 2025 Sri Ambal Nagar Peoples
        Welfare Association. All rights
        reserved.
      </footer>

    </div>
  );
}