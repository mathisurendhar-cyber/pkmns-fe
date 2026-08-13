'use client';

import { apiFetch } from '@/lib/api';
import AppPopup, { AppPopupVariant } from '@/components/AppPopup';
import SiteNavbar from '@/components/layout/SiteNavbar';
import { FormEvent, useEffect, useState } from 'react';
import './membership.css';

export default function MembershipPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [refId, setRefId] = useState('');
  const [qr, setQr] = useState('/img/qr-payment.jpg');
  const [sending, setSending] = useState(false);

  const [popup, setPopup] = useState<{
    open: boolean;
    variant: AppPopupVariant;
    title: string;
    message: string;
  }>({
    open: false,
    variant: 'info',
    title: '',
    message: '',
  });

  /* =====================================================
     QR API - SAME LOGIC
  ===================================================== */

  useEffect(() => {
    apiFetch('/api/qr?upi=makkalnalvazhvusangam@tmb')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setQr(data.qr);
        }
      })
      .catch(() => {});
  }, []);

  /* =====================================================
     POPUP - SAME LOGIC
  ===================================================== */

  function showPopup(
    variant: AppPopupVariant,
    title: string,
    message: string,
  ) {
    setPopup({
      open: true,
      variant,
      title,
      message,
    });
  }

  /* =====================================================
     SUBMIT - SAME LOGIC
  ===================================================== */

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !refId.trim()) {
      showPopup(
        'error',
        'Missing Details',
        'Please fill all fields.',
      );
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      showPopup(
        'error',
        'Invalid Mobile',
        'Mobile number must be exactly 10 digits.',
      );
      return;
    }

    setSending(true);

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
        setName('');
        setMobile('');
        setRefId('');

        showPopup(
          'success',
          'Membership Submitted',
          'Thank you! Your application was emailed to the admin. You will be notified after approval.',
        );
      } else {
        showPopup(
          'error',
          'Submit Failed',
          data.message ||
            'Unable to submit membership. Please try again.',
        );
      }
    } catch {
      showPopup(
        'error',
        'Network Error',
        'Unable to reach the server. Please try again.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="membership-page">

      <SiteNavbar />

      <main className="membership-screen">

        {/* =================================================
            ORANGE BRAND ZONE
        ================================================= */}

        <section className="membership-brand-zone">

          <div className="orange-noise" />

          <div className="brand-top">

            <div className="brand-mark">
              <img
                src="/img/logo.png"
                alt="Sri Ambal Nagar"
              />
            </div>

            <div className="brand-copy">
              <strong>
                SRI AMBAL NAGAR
              </strong>

              <span>
                WELFARE ASSOCIATION
              </span>
            </div>

          </div>


          <div className="brand-content">

            <div className="mini-line">
              <span />
              MEMBERSHIP 2026
            </div>

            <h1>
              Be part of
              <br />
              something
              <br />
              <em>bigger.</em>
            </h1>

            <p>
              Join our community and contribute
              towards a stronger, safer and better
              neighbourhood.
            </p>


            <div className="price-block">

              <div className="price-label">
                ANNUAL CONTRIBUTION
              </div>

              <div className="price-number">
                <small>₹</small>
                200
              </div>

              <div className="price-duration">
                <span className="tick">✓</span>

                <div>
                  <strong>
                    ONE YEAR MEMBERSHIP
                  </strong>

                  <span>
                    Simple · Secure · Community focused
                  </span>
                </div>
              </div>

            </div>

          </div>


          <div className="brand-bottom">

            <div className="bottom-number">
              01
            </div>

            <div className="bottom-line" />

            <div className="bottom-text">
              MEMBERSHIP
              <br />
              APPLICATION
            </div>

          </div>

        </section>


        {/* =================================================
            APPLICATION ZONE
        ================================================= */}

        <section className="membership-form-zone">

          <div className="form-zone-inner">

            {/* TOP */}

            <div className="application-top">

              <div>

                <span className="section-kicker">
                  JOIN THE COMMUNITY
                </span>

                <h2>
                  Your membership
                  <br />
                  <strong>starts here.</strong>
                </h2>

              </div>

              <div className="application-index">
                <span>STEP</span>
                <strong>01</strong>
              </div>

            </div>


            {/* PAYMENT */}

            <div className="payment-area">

              <div className="payment-heading">

                <div className="payment-icon">
                  ₹
                </div>

                <div>
                  <strong>
                    Complete payment
                  </strong>

                  <span>
                    Pay ₹200 using GPay / UPI
                  </span>
                </div>

              </div>


              <div className="payment-main">

                <div className="qr-area">

                  <div className="qr-corner qr-tl" />
                  <div className="qr-corner qr-tr" />
                  <div className="qr-corner qr-bl" />
                  <div className="qr-corner qr-br" />

                  <img
                    src={qr}
                    alt="GPay QR"
                  />

                </div>


                <div className="payment-details">

                  <span className="tiny-label">
                    SCAN TO PAY
                  </span>

                  <h3>
                    GPay / UPI
                  </h3>

                  <p>
                    Scan the QR code and complete
                    your ₹200 annual membership payment.
                  </p>

                  <div className="secure-line">
                    <span>✓</span>
                    Secure UPI Payment
                  </div>

                </div>

              </div>

            </div>


            {/* FORM */}

            <form
              className="membership-form"
              onSubmit={onSubmit}
            >

              <div className="details-heading">

                <span>
                  02
                </span>

                <div>
                  <strong>
                    YOUR DETAILS
                  </strong>

                  <p>
                    Enter the details used during payment.
                  </p>
                </div>

              </div>


              {/* NAME */}

              <div className="editorial-field">

                <div className="field-number">
                  01
                </div>

                <div className="field-content">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your full name"
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

                <div className="field-arrow">
                  ↗
                </div>

              </div>


              {/* MOBILE */}

              <div className="editorial-field">

                <div className="field-number">
                  02
                </div>

                <div className="field-content">

                  <label>
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    placeholder="10 digit mobile number"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) =>
                      setMobile(
                        e.target.value.replace(
                          /[^0-9]/g,
                          '',
                        ),
                      )
                    }
                  />

                </div>

                <div className="field-arrow">
                  ↗
                </div>

              </div>


              {/* REF ID */}

              <div className="editorial-field">

                <div className="field-number">
                  03
                </div>

                <div className="field-content">

                  <label>
                    Payment Reference ID
                  </label>

                  <input
                    type="text"
                    placeholder="GPAY-ABC123"
                    required
                    value={refId}
                    onChange={(e) =>
                      setRefId(e.target.value)
                    }
                  />

                  <small>
                    Enter the reference ID shown after payment.
                  </small>

                </div>

                <div className="field-arrow">
                  ↗
                </div>

              </div>


              {/* ACTION */}

              <div className="application-action">

                <div className="review-message">

                  <span>
                    ✓
                  </span>

                  <p>
                    Your application will be reviewed
                    by the association admin.
                  </p>

                </div>


                <button
                  type="submit"
                  disabled={sending}
                >

                  {sending ? (
                    <>
                      <span className="button-spinner" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      SUBMIT APPLICATION
                      <span>
                        →
                      </span>
                    </>
                  )}

                </button>

              </div>

            </form>


            {/* BOTTOM */}

            <div className="form-bottom">

              <span>
                SRI AMBAL NAGAR WELFARE ASSOCIATION
              </span>

              <div />

              <span>
                ANNUAL MEMBERSHIP · ₹200
              </span>

            </div>

          </div>

        </section>

      </main>


      <AppPopup
        open={popup.open}
        variant={popup.variant}
        title={popup.title}
        message={popup.message}
        onClose={() =>
          setPopup((p) => ({
            ...p,
            open: false,
          }))
        }
      />

    </div>
  );
}