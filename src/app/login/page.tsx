'use client';


import { FormEvent, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { setCurrentUser } from '@/lib/auth';
import './login.css';

function maskEmail(email: string) {
  const parts = email.split('@');

  if (parts.length !== 2) return email;  

  const local = parts[0];
  const domain = parts[1];

  return `${local.slice(0, 1)}***@${domain}`;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const [step1Email, setStep1Email] = useState('');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>(
    'success',
  );

  const otpInputRef = useRef<HTMLInputElement>(null);
  const verifyingRef = useRef(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !email.trim()) {
      setMessageType('error');
      setMessage('Please enter username, password and email.');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      const res = await apiFetch('/api/login-step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          email: email.trim(),
        }),
        onRetry: (attempt, max) => {
          setMessageType('success');

          setMessage(
            `Server is starting (${attempt}/${max}). Please wait...`,
          );
        },
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok || !contentType.includes('application/json')) {
        setMessageType('error');

        setMessage(
          res.status === 503
            ? 'Backend is still starting. Please try again.'
            : `Request failed (${res.status}).`,
        );

        return;
      }

      const data = await res.json();

      if (!data.success) {
        setMessageType('error');
        setMessage(data.message || 'Invalid credentials.');
        return;
      }

      setStep1Email(email.trim());

      setOtp('');
      setShowOtp(true);

      setMessageType('success');
      setMessage(data.message || 'OTP sent to your email.');

      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);

    } catch {
      setMessageType('error');
      setMessage('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp(code?: string) {
    const value = (code ?? otp).trim();

    if (value.length !== 6 || verifyingRef.current) {
      return;
    }

    verifyingRef.current = true;
    setVerifying(true);
    setMessage('');

    try {
      const res = await apiFetch('/api/login-step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: step1Email,
          otp: value,
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok || !contentType.includes('application/json')) {
        setMessageType('error');
        setMessage('Server error. Please try again.');
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setMessageType('error');
        setMessage(data.message || 'Invalid OTP.');
        return;
      }

      setCurrentUser(data.user);

      window.location.href = '/dashboard';
    } catch {
      setMessageType('error');
      setMessage('Network error. Please try again.');
    } finally {
      setVerifying(false);
      verifyingRef.current = false;
    }
  }

  useEffect(() => {
    if (showOtp && otp.length === 6) {
      void verifyOtp(otp);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, showOtp]);

  function backToLogin() {
    setShowOtp(false);
    setOtp('');
    setMessage('');
  }

  return (
    <div className="login-page">

      {/* LEFT ORANGE PANEL */}

      <section className="login-brand">

        <div className="brand-rays" />

        <div className="sun-circle">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="brand-top">

          <div className="brand-logo">
            <img
              src="/img/logo.png"
              alt="Sri Ambal Nagar"
            />
          </div>

          <div className="brand-name">
            Sri Ambal Nagar

            <span>
              Admin Portal
            </span>
          </div>

        </div>


        <div className="brand-content">

          <div className="eyebrow">
            Peoples Welfare Association
          </div>

          <h1>
            Every member,
            <br />
            <em>one secure door in.</em>
          </h1>

          <p>
            Access member records, notices, and the gallery archive
            through a secure administration portal protected by
            email verification.
          </p>

        </div>


        <div className="brand-footer">

          <div>
            <span className="footer-dot" />
            Email OTP verified
          </div>

          <div>
            <span className="footer-dot" />
            Admins only
          </div>

        </div>

      </section>


      {/* RIGHT FORM */}

      <section className="login-form-side">

        <div className="form-wrap">

          {!showOtp ? (

            <>

              <div className="form-heading">

                <div className="heading-line" />

                <span>
                  ADMIN ACCESS
                </span>

              </div>

              <h2>
                Sign in
              </h2>

              <p className="form-description">
                Enter your admin credentials to continue.
                A verification code will be sent to your
                registered email.
              </p>


              <form onSubmit={handleLogin}>

                {/* USERNAME */}

                <div className="field">

                  <label htmlFor="username">
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    placeholder="e.g. secretary_admin"
                    autoComplete="username"
                    value={username}
                    disabled={sending}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                  />

                  <div className="input-line" />

                </div>


                {/* PASSWORD */}

                <div className="field">

                  <label htmlFor="password">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    disabled={sending}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <div className="input-line" />

                </div>


                {/* EMAIL */}

                <div className="field">

                  <label htmlFor="email">
                    Registered email
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    disabled={sending}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                  <div className="input-line" />

                </div>


                {message && (
                  <div
                    className={`login-message ${
                      messageType === 'error'
                        ? 'error'
                        : 'success'
                    }`}
                  >
                    {message}
                  </div>
                )}


                <button
                  type="submit"
                  className="login-submit"
                  disabled={sending}
                >
                  <span>
                    {sending
                      ? 'Sending code...'
                      : 'Send verification code'}
                  </span>

                  {!sending && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

              </form>


              <p className="help-text">
                Locked out or new to the committee? Contact the
                association secretary for access.
              </p>

            </>

          ) : (

            /* OTP SCREEN */

            <>

              <button
                type="button"
                className="back-button"
                onClick={backToLogin}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>

                Back
              </button>


              <div className="form-heading">

                <div className="heading-line" />

                <span>
                  VERIFICATION
                </span>

              </div>


              <h2>
                Check your inbox
              </h2>

              <p className="form-description">
                Enter the 6-digit verification code sent to
                your registered email.
              </p>


              <div className="email-preview">
                {maskEmail(step1Email)}
              </div>


              <div className="otp-container">

                <label>
                  Verification code
                </label>

                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  disabled={verifying}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6),
                    )
                  }
                />

              </div>


              {message && (
                <div
                  className={`login-message ${
                    messageType === 'error'
                      ? 'error'
                      : 'success'
                  }`}
                >
                  {message}
                </div>
              )}


              <button
                type="button"
                className="login-submit"
                disabled={
                  verifying ||
                  otp.length !== 6
                }
                onClick={() => verifyOtp()}
              >
                <span>
                  {verifying
                    ? 'Verifying...'
                    : 'Verify & enter dashboard'}
                </span>

                {!verifying && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}

              </button>


              <div className="otp-note">
                The verification code expires in 5 minutes.
              </div>

            </>

          )}

        </div>


        <div className="form-footer">

          <span>
            © Sri Ambal Nagar
          </span>

          <span>
            Secure Administration
          </span>

        </div>

      </section>

    </div>
  );
}