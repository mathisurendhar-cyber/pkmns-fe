'use client';

import { apiFetch } from '@/lib/api';
import SiteNavbar from '@/components/layout/SiteNavbar';
import { FormEvent, useEffect, useState } from 'react';
import './membership.css';

export default function MembershipPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [refId, setRefId] = useState('');
  const [qr, setQr] = useState('/img/qr-payment.jpg');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch('/api/qr?upi=makkalnalvazhvusangam@tmb')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setQr(data.qr);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !refId.trim()) {
      alert('Fill all fields');
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      alert('Mobile must be 10 digits');
      return;
    }
    setSending(true);
    try {
      const res = await apiFetch('/api/submit-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          refId: refId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setName('');
        setMobile('');
        setRefId('');
      } else {
        alert(data.message || 'Failed');
      }
    } catch {
      alert('Server error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="membership-page">
      <SiteNavbar />
      <div className="bg" />
      <div className="container">
        <div className="hero">
          <img src="/img/logo.png" alt="Sri Ambal Nagar" />
          <h1>Annual Membership</h1>
          <p>
            Join Sri Ambal Nagar Welfare Association and be part of community
            development.
          </p>
          <div className="price">₹200</div>
          <span>1 Year Membership</span>
        </div>

        <div className="card">
          <div className="qr-box">
            <img src={qr} className="qr-code" alt="QR" />
            <div className="phone-number">GPay QR</div>
            <p>Scan → Pay ₹200</p>
          </div>

          <form className="modern-form" onSubmit={onSubmit}>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))
                }
              />
            </div>
            <div className="field">
              <label>Mobile</label>
              <input
                type="tel"
                placeholder="Mobile Number"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/[^0-9]/g, ''))
                }
              />
            </div>
            <div className="field">
              <label>Ref ID</label>
              <input
                type="text"
                placeholder="GPAY-ABC123"
                required
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
              />
            </div>
            <button type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'SUBMIT'}
            </button>
          </form>

          {sending && <div className="loading">Processing...</div>}
          {success && (
            <div className="success-message" style={{ display: 'block' }}>
              ✅ Submitted! Admin approves soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
