'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { setCurrentUser } from '@/lib/auth';
import './login.css';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');

  if (!local || !domain) {
    return email;
  }

  const visible = local.slice(0, 1);

  return `${visible}***@${domain}`;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const [otpMsg, setOtpMsg] = useState('');
  const [otpMsgColor, setOtpMsgColor] = useState('green');

  const [step1Email, setStep1Email] = useState('');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const verifyingRef = useRef(false);

  // Backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ==========================================
  // LOGIN STEP 1 - USERNAME + PASSWORD + EMAIL
  // ==========================================
  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setSending(true);
    setOtpMsg('');

    try {
      if (!API_URL) {
        setOtpMsgColor('red');
        setOtpMsg(
          'API URL is not configured. Check NEXT_PUBLIC_API_URL.',
        );
        return;
      }

      const res = await fetch(
        `${API_URL}/api/login-step1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
            email: email.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setOtpMsgColor('red');
        setOtpMsg(data.message || 'Login failed');
        return;
      }

      // OTP sent successfully
      setStep1Email(email.trim());
      setShowOtp(true);
      setOtp('');

      setOtpMsgColor('green');
      setOtpMsg(
        data.message || 'OTP sent to your email',
      );

      setPopupOpen(true);
    } catch (error) {
      console.error('Login Step 1 Error:', error);

      setOtpMsgColor('red');
      setOtpMsg(
        'Unable to connect to backend. Please try again.',
      );
    } finally {
      setSending(false);
    }
  }

  // ==========================================
  // LOGIN STEP 2 - OTP VERIFICATION
  // ==========================================
  async function verifyOtp(code?: string) {
    const value = (code ?? otp).trim();

    if (
      value.length !== 6 ||
      verifyingRef.current
    ) {
      return;
    }

    verifyingRef.current = true;
    setVerifying(true);
    setOtpMsg('');

    try {
      if (!API_URL) {
        setOtpMsgColor('red');
        setOtpMsg(
          'API URL is not configured. Check NEXT_PUBLIC_API_URL.',
        );
        return;
      }

      const res = await fetch(
        `${API_URL}/api/login-step2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: step1Email,
            otp: value,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setOtpMsgColor('red');
        setOtpMsg(
          data.message || 'Invalid OTP',
        );
        return;
      }

      // Login successful
      setCurrentUser(data.user);

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('OTP Verification Error:', error);

      setOtpMsgColor('red');
      setOtpMsg(
        'Unable to connect to backend. Please try again.',
      );
    } finally {
      setVerifying(false);
      verifyingRef.current = false;
    }
  }

  // ==========================================
  // AUTO VERIFY WHEN 6 DIGIT OTP IS ENTERED
  // ==========================================
  useEffect(() => {
    if (
      otp.trim().length === 6 &&
      showOtp
    ) {
      void verifyOtp(otp);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, showOtp]);

  // ==========================================
  // CLOSE OTP POPUP
  // ==========================================
  function closePopup() {
    setPopupOpen(false);

    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 50);
  }

  return (
    <div className="login-page">

      {/* ======================================
          NAVIGATION
      ====================================== */}
      <header className="nav-wrap">
        <div className="nav-bar">

          <div className="nav-left">
            <div className="nav-logo-mini">
              <img
                src="/img/logo.png"
                alt="Logo"
              />
            </div>

            <div className="nav-title">
              Sri Ambal Nagar Admin
            </div>
          </div>

          <div className="nav-right">

            <Link
              href="/"
              className="nav-link"
            >
              <i className="fas fa-home" />
              <span>Home</span>
            </Link>

            <Link
              href="/about"
              className="nav-link"
            >
              <i className="fas fa-info-circle" />
              <span>About</span>
            </Link>

            <Link
              href="/contact"
              className="nav-link"
            >
              <i className="fas fa-phone" />
              <span>Contact</span>
            </Link>

            <div className="nav-pill">
              <i
                className="fas fa-shield-alt"
                style={{ marginRight: 6 }}
              />
              Admin Login
            </div>

          </div>
        </div>
      </header>

      {/* ======================================
          MAIN LOGIN PAGE
      ====================================== */}
      <main className="page-main">

        {/* LEFT SIDE */}
        <section className="login-left">

          <div className="logo-row">

            <div className="logo-wrap">
              <img
                src="/img/logo.png"
                alt="Sri Ambal Nagar Logo"
              />
            </div>

            <div>
              <div className="brand-text-main">
                Sri Ambal Nagar
              </div>

              <div className="brand-text-sub">
                Admin Portal
              </div>
            </div>

          </div>

          <p className="welcome-line">
            Welcome to the secure administration
            dashboard for{' '}
            <span>
              Sri Ambal Nagar Peoples Welfare Association
            </span>
          </p>

          {/* FEATURES */}
          <div className="feature-grid">

            <div className="feature-item">
              <div
                className="feature-icon"
                style={{ color: '#22c55e' }}
              >
                <i className="fas fa-lock" />
              </div>

              <span>
                2FA Email OTP Protection
              </span>
            </div>

            <div className="feature-item">
              <div
                className="feature-icon"
                style={{ color: '#a855f7' }}
              >
                <i className="fas fa-users" />
              </div>

              <span>
                Complete Member Management
              </span>
            </div>

            <div className="feature-item">
              <div
                className="feature-icon"
                style={{ color: '#38bdf8' }}
              >
                <i className="fas fa-calendar" />
              </div>

              <span>
                Events & Notices
              </span>
            </div>

            <div className="feature-item">
              <div
                className="feature-icon"
                style={{ color: '#f97316' }}
              >
                <i className="fas fa-images" />
              </div>

              <span>
                Gallery Uploads
              </span>
            </div>

          </div>

          <div className="login-left-footer">
            Need access or forgot credentials?
            Please contact the association secretary
            or IT volunteer.
          </div>

        </section>

        {/* RIGHT SIDE */}
        <section className="login-right">

          <h2 className="login-title">
            Secure Login
          </h2>

          <p className="login-sub">
            Enter credentials & verify with OTP
            to access admin dashboard.
          </p>

          {/* LOGIN FORM */}
          <form
            onSubmit={onSubmit}
            autoComplete="off"
          >

            {/* USERNAME */}
            <div className="form-group">

              <label htmlFor="username">
                Username
              </label>

              <div className="input-wrap">

                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  disabled={sending}
                />

                <span className="input-icon">
                  <i className="fas fa-user" />
                </span>

              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrap">

                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={sending}
                />

                <span className="input-icon">
                  <i className="fas fa-lock" />
                </span>

              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrap">

                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={sending}
                />

                <span className="input-icon">
                  <i className="fas fa-envelope" />
                </span>

              </div>
            </div>

            {/* SEND OTP */}
            <button
              type="submit"
              className="login-btn"
              disabled={sending}
            >
              <i className="fas fa-paper-plane" />

              {sending
                ? 'Sending OTP...'
                : 'Send OTP'}
            </button>

          </form>

          {/* ==================================
              OTP SECTION
          ================================== */}
          {showOtp && (
            <div className="otp-box">

              <div className="form-group">

                <label htmlFor="otp">
                  Enter OTP
                </label>

                <div className="input-wrap">

                  <input
                    id="otp"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6),
                      )
                    }
                    disabled={verifying}
                  />

                  <span className="input-icon">
                    <i className="fas fa-key" />
                  </span>

                </div>
              </div>

              {/* VERIFY */}
              <button
                type="button"
                className="login-btn"
                onClick={() => verifyOtp()}
                disabled={
                  verifying ||
                  otp.trim().length !== 6
                }
              >
                <i className="fas fa-check-circle" />

                {verifying
                  ? 'Verifying...'
                  : 'Verify & Login'}
              </button>

              <p
                className="otp-msg"
                style={{
                  color: otpMsgColor,
                }}
              >
                {otpMsg}
              </p>

            </div>
          )}

          {/* ERROR / STATUS MESSAGE */}
          {!showOtp && otpMsg && (
            <p
              className="otp-msg"
              style={{
                color: otpMsgColor,
              }}
            >
              {otpMsg}
            </p>
          )}

          <div className="helper-text">
            Protected by advanced two-factor
            authentication. Only authorized admins
            are allowed to login.
          </div>

        </section>
      </main>

      {/* ======================================
          OTP POPUP
      ====================================== */}
      {popupOpen && (
        <div
          className="otp-popup-backdrop"
          onClick={closePopup}
        >

          <div
            className="otp-popup"
            onClick={(e) =>
              e.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-popup-title"
          >

            <div className="otp-popup-icon">
              <i className="fas fa-envelope-open-text" />
            </div>

            <h3 id="otp-popup-title">
              OTP Sent
            </h3>

            <p>
              A 6-digit verification code was
              sent to{' '}
              <strong>
                {maskEmail(step1Email)}
              </strong>
              . Check your inbox and enter the
              code below. It expires in 5 minutes.
            </p>

            <button
              type="button"
              className="otp-popup-btn"
              onClick={closePopup}
            >
              Enter OTP
            </button>

          </div>
        </div>
      )}

    </div>
  );
}