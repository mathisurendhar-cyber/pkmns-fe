'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import './contact.css';

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !message.trim()) {
      alert('Please fill all fields.');
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      alert('Name should contain letters and spaces only.');
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      alert('Mobile number must be exactly 10 digits.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('mobile', mobile.trim());
    formData.append('message', message.trim());
    if (files) {
      Array.from(files).forEach((f) => formData.append('attachments', f));
    }

    setSending(true);
    try {
      const res = await fetch('/api/contact-with-file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Message sent successfully! ✅');
        setName('');
        setMobile('');
        setMessage('');
        setFiles(null);
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch {
      alert('Network/Server error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page">
      <div className="logo-bg" />
      <header>
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/img/logo.png"
              alt="APNGDR Logo"
              style={{
                height: 55,
                borderRadius: '50%',
                background: '#fff',
                padding: 4,
                boxShadow: '0 1px 7px #0008',
              }}
            />
            <h1
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 'large',
                color: 'white',
              }}
            >
              Sri AmbalNagar Makkal Nalvazhu Sangam
            </h1>
          </div>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <nav>
            <ul className={`menu ${menuOpen ? 'show' : ''}`}>
              <Link href="/">Home</Link>
              <Link href="/about">About </Link>
              <Link href="/members">Members</Link>
              <Link href="/events">Events</Link>
              <Link href="/contact">Contact </Link>
              <Link href="/login">Login</Link>
            </ul>
          </nav>
        </div>
      </header>

      <main className="contact-main">
        <div className="contact-info">
          <h2>Contact Details</h2>
          <ul>
            <li>
              <b>Address:</b>
              <br />
              <br />
              No.21,RMS Illam,2nd Floor Rajesh Avenue,Sri AmbalNagar Pallikarani
              Chennai-100{' '}
            </li>
            <li>
              <b>Email:</b> mnsambalnagar@gmail.com
            </li>
            <li>
              <b>Phone:</b> 9445336302
            </li>
          </ul>
          <h3>Office Hours</h3>
          <ul>
            <li>Mon–Sat: 9.30 AM – 6.00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
          <h3>Location</h3>
          <div className="map-embed">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0023734671654!2d80.18792471525804!3d13.01187629083211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525b04fbed84af%3A0xdd1f4e1fba882ab1!2sAmbal%20Nagar%2C%20Pallikaranai%2C%20Chennai%2C%20Tamil%20Nadu%20600100%2C%20India!5e0!3m2!1sen!2sin!4v1700369632960!5m2!1sen!2sin"
              loading="lazy"
              style={{ border: 0 }}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="map"
            />
          </div>
        </div>

        <div className="contact-form">
          <h2>Send a Message</h2>
          <form onSubmit={onSubmit} encType="multipart/form-data">
            <label>Name</label>
            <input
              type="text"
              required
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value.replace(/[^A-Za-z\s]/g, ''))
              }
            />
            <label>Mobile</label>
            <input
              type="text"
              required
              placeholder="Enter your mobile number"
              maxLength={10}
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
            />
            <label>Message</label>
            <textarea
              rows={5}
              required
              placeholder="Write your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <label>Attachments (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf,video/mp4,video/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          <small
            style={{
              color: '#666',
              fontSize: '0.9em',
              marginTop: 8,
              display: 'block',
            }}
          >
            Supports photos, PDF and videos (each file up to 25MB).
          </small>
        </div>
      </main>

      <footer>
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            background: '#0052cc',
            color: 'white',
          }}
        >
          <p>
            &copy; 2025 Sri Ambal Nagar Peoples Welfare Association. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
