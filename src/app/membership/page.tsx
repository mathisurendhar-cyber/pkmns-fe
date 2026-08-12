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
        if (data.success && data.qr) {
          setQr(data.qr);
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !refId.trim()) {
      alert('Fill all fields');
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      alert('Name should contain letters and spaces only.');
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      alert('Mobile must be 10 digits');
      return;
    }

    setSending(true);
    setSuccess(false);

    try {
      const res = await apiFetch('/api/submit-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      <main className="membership-container">

        {/* ============================
            LEFT CONTENT
        ============================ */}

        <section className="membership-intro">

          <div className="intro-logo">
            <img
              src="/img/logo.png"
              alt="Sri Ambal Nagar"
            />
          </div>

          <div className="intro-tag">
            COMMUNITY MEMBERSHIP
          </div>

          <h1>
            Annual
            <br />
            <span>Membership</span>
          </h1>

          <p>
            Join Sri Ambal Nagar Welfare Association
            and be part of community development.
          </p>

          <div className="price-area">
            <span className="rupee">₹</span>
            <span className="price">200</span>
          </div>

          <div className="membership-duration">
            <span className="check">✓</span>

            <div>
              <strong>1 Year Membership</strong>
              <small>
                Access to community activities and programs.
              </small>
            </div>
          </div>

          <div className="intro-lines">
            <div>
              <span>01</span>
              <p>Be part of community development</p>
            </div>

            <div>
              <span>02</span>
              <p>Participate in community programs</p>
            </div>

            <div>
              <span>03</span>
              <p>Stay connected with our community</p>
            </div>
          </div>

        </section>


        {/* ============================
            RIGHT APPLICATION
        ============================ */}

        <section className="membership-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                MEMBERSHIP APPLICATION
              </span>

              <h2>
                Register your
                <br />
                <span>membership</span>
              </h2>

              <p>
                Complete your payment and enter
                your details below.
              </p>
            </div>

            <div className="panel-number">
              ₹200
            </div>

          </div>


          {/* ============================
              QR PAYMENT
          ============================ */}

          <div className="payment-box">

            <div className="payment-title">

              <div className="payment-icon">
                ₹
              </div>

              <div>
                <strong>Make Payment</strong>
                <span>Scan & pay ₹200</span>
              </div>

            </div>

            <div className="payment-content">

              <div className="qr-frame">

                <img
                  src={qr}
                  alt="QR"
                  className="qr-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      '/img/qr-payment.jpg';
                  }}
                />

              </div>

              <div className="payment-info">

                <h3>GPay / UPI</h3>

                <p>
                  Scan this QR code using
                  GPay, PhonePe or any UPI app.
                </p>

                <div className="secure-payment">
                  <span>✓</span>
                  Secure UPI Payment
                </div>

              </div>

            </div>

          </div>


          {/* ============================
              FORM
          ============================ */}

          <form
            className="membership-form"
            onSubmit={onSubmit}
          >

            <div className="form-row">

              <div className="form-field">

                <label>Name</label>

                <div className="input-wrapper">

                  <span>👤</span>

                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value.replace(
                          /[^a-zA-Z\s]/g,
                          '',
                        ),
                      )
                    }
                  />

                </div>

              </div>


              <div className="form-field">

                <label>Mobile</label>

                <div className="input-wrapper">

                  <span>📱</span>

                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) =>
                      setMobile(
                        e.target.value
                          .replace(/[^0-9]/g, '')
                          .slice(0, 10),
                      )
                    }
                  />

                </div>

              </div>

            </div>


            <div className="form-field">

              <label>
                Payment Reference ID
              </label>

              <div className="input-wrapper">

                <span>#</span>

                <input
                  type="text"
                  placeholder="GPAY-ABC123"
                  required
                  value={refId}
                  onChange={(e) =>
                    setRefId(e.target.value)
                  }
                />

              </div>

              <small>
                Enter the reference ID received after
                your ₹200 payment.
              </small>

            </div>


            {/* PAYMENT NOTICE */}

            <div className="payment-notice">

              <div className="notice-check">
                ✓
              </div>

              <div>
                <strong>
                  Payment Confirmation
                </strong>

                <p>
                  Please make sure your payment is
                  completed before submitting.
                </p>
              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={sending}
              className="submit-button"
            >
              {sending ? (
                <>
                  <span className="spinner" />
                  Sending...
                </>
              ) : (
                <>
                  Submit Membership
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}
            </button>

          </form>


          {/* LOADING */}

          {sending && (
            <div className="loading">
              Processing your application...
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="success-message">
              <div className="success-icon">
                ✓
              </div>

              <div>
                <strong>
                  Application Submitted!
                </strong>

                <p>
                  Your membership application has
                  been submitted successfully.
                  Admin approves soon.
                </p>
              </div>
            </div>
          )}

        </section>

      </main>


      <footer className="membership-footer">
        © 2025 Sri Ambal Nagar Peoples Welfare Association.
        All rights reserved.
      </footer>

    </div>
  );
}