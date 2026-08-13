'use client';

import { apiFetch } from '@/lib/api';
import SiteNavbar from '@/components/layout/SiteNavbar';
import { FormEvent, useState } from 'react';
import './contact.css';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [sending, setSending] = useState(false);

  const [popup, setPopup] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function showPopup(
    type: 'success' | 'error',
    message: string,
  ) {
    setPopup({ type, message });

    window.setTimeout(() => {
      setPopup(null);
    }, 3500);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !message.trim()) {
      showPopup('error', 'Please fill all fields.');
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      showPopup(
        'error',
        'Name should contain letters and spaces only.',
      );
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      showPopup(
        'error',
        'Mobile number must be exactly 10 digits.',
      );
      return;
    }

    const formData = new FormData();

    formData.append('name', name.trim());
    formData.append('mobile', mobile.trim());
    formData.append('message', message.trim());

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append('attachments', file);
      });
    }

    setSending(true);

    try {
      const res = await apiFetch('/api/contact-with-file', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        showPopup(
          'success',
          'Message sent successfully!',
        );

        setName('');
        setMobile('');
        setMessage('');
        setFiles(null);

        const fileInput = document.getElementById(
          'contact-file',
        ) as HTMLInputElement | null;

        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        showPopup(
          'error',
          data.message || 'Failed to send message.',
        );
      }
    } catch {
      showPopup(
        'error',
        'Network/Server error. Please try again.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page">
      <SiteNavbar />

      {popup && (
        <div
          className={`contact-popup ${
            popup.type === 'success'
              ? 'popup-success'
              : 'popup-error'
          }`}
        >
          <span className="popup-symbol">
            {popup.type === 'success' ? '✓' : '!'}
          </span>

          <div className="popup-message">
            <strong>
              {popup.type === 'success'
                ? 'Success'
                : 'Attention'}
            </strong>

            <span>{popup.message}</span>
          </div>

          <button
            type="button"
            className="popup-close"
            onClick={() => setPopup(null)}
          >
            ×
          </button>
        </div>
      )}

      <main className="contact-main">
        {/* ================= HERO ================= */}

        <section className="contact-intro">
          <div className="intro-label">
            <span />
            CONTACT US
          </div>

          <h1>
            Let&apos;s <span>Connect.</span>
          </h1>

          <p>
            Have a question, suggestion or need assistance?
            Reach out to Sri Ambal Nagar Peoples Welfare
            Association and we will be happy to help.
          </p>

          <div className="intro-decoration">
            <i />
            <i />
            <i />
          </div>
        </section>

        {/* ================= MAIN ================= */}

        <section className="contact-content">
          {/* LEFT */}

          <div className="contact-details">
            <div className="section-label">
              GET IN TOUCH
            </div>

            <h2>Contact Information</h2>

            <div className="details-line" />

            <div className="detail-row">
              <div className="detail-number">01</div>

              <div className="detail-body">
                <span className="detail-label">
                  ADDRESS
                </span>

                <p>
                  No.21, RMS Illam, 2nd Floor
                  <br />
                  Rajesh Avenue,
                  <br />
                  Sri Ambal Nagar, Pallikaranai
                  <br />
                  Chennai - 600100
                </p>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-number">02</div>

              <div className="detail-body">
                <span className="detail-label">
                  EMAIL
                </span>

                <p>
                  mnsambalnagar@gmail.com
                </p>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-number">03</div>

              <div className="detail-body">
                <span className="detail-label">
                  PHONE
                </span>

                <p>9445336302</p>
              </div>
            </div>

            <div className="office-hours">
              <div className="section-label">
                OFFICE HOURS
              </div>

              <div className="hours-line">
                <span>Monday – Saturday</span>
                <strong>9:30 AM – 6:00 PM</strong>
              </div>

              <div className="hours-line">
                <span>Sunday</span>
                <strong className="closed">
                  Closed
                </strong>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="contact-form-area">
            <div className="section-label">
              MESSAGE US
            </div>

            <div className="form-heading-row">
              <h2>Send a Message</h2>

              <div className="form-dots">
                <span />
                <span />
                <span />
              </div>
            </div>

            <p className="form-intro">
              Fill in your details and tell us how we can
              help you.
            </p>

            <form
              onSubmit={onSubmit}
              encType="multipart/form-data"
            >
              <div className="form-field">
                <label htmlFor="contact-name">
                  Name <em>*</em>
                </label>

                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value.replace(
                        /[^A-Za-z\s]/g,
                        '',
                      ),
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-mobile">
                  Mobile Number <em>*</em>
                </label>

                <input
                  id="contact-mobile"
                  type="text"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="Enter your 10 digit mobile number"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10),
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-message">
                  Message <em>*</em>
                </label>

                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-file">
                  Attachments
                  <small>Optional</small>
                </label>

                <label
                  htmlFor="contact-file"
                  className="file-area"
                >
                  <span className="file-plus">+</span>

                  <span className="file-copy">
                    <strong>
                      Add photos, PDF or videos
                    </strong>

                    <small>
                      Click here to choose files
                    </small>
                  </span>

                  <span className="file-arrow">→</span>
                </label>

                <input
                  id="contact-file"
                  className="file-input"
                  type="file"
                  accept="image/*,.pdf,video/mp4,video/*"
                  multiple
                  onChange={(e) =>
                    setFiles(e.target.files)
                  }
                />

                <div className="file-note">
                  Supports photos, PDF and videos. Each
                  file up to 25MB.
                </div>

                {files && files.length > 0 && (
                  <div className="selected-files">
                    ✓ {files.length}{' '}
                    {files.length === 1
                      ? 'file'
                      : 'files'}{' '}
                    selected
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={sending}
              >
                <span>
                  {sending
                    ? 'Sending...'
                    : 'Send Message'}
                </span>

                {!sending && (
                  <span className="submit-arrow">
                    →
                  </span>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ================= LOCATION ================= */}

        <section className="location-area">
          <div className="location-title">
            <div>
              <span className="section-label">
                FIND US
              </span>

              <h2>Our Location</h2>
            </div>

            <p>
              Sri Ambal Nagar, Pallikaranai,
              Chennai - 600100
            </p>
          </div>

          <div className="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0023734671654!2d80.18792471525804!3d13.01187629083211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525b04fbed84af%3A0xdd1f4e1fba882ab1!2sAmbal%20Nagar%2C%20Pallikaranai%2C%20Chennai%2C%20Tamil%20Nadu%20600100%2C%20India!5e0!3m2!1sen!2sin!4v1700369632960!5m2!1sen!2sin"
              loading="lazy"
              style={{ border: 0 }}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Sri Ambal Nagar Location"
            />
          </div>
        </section>
      </main>

      <footer className="contact-footer">
        <p>
          &copy; 2025 Sri Ambal Nagar Peoples Welfare
          Association. All rights reserved.
        </p>
      </footer>
    </div>
  );
}