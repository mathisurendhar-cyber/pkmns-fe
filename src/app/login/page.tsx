'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { setCurrentUser } from '@/lib/auth';
import './login.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpMsg, setOtpMsg] = useState('');
  const [otpMsgColor, setOtpMsgColor] = useState('green');
  const [step1Email, setStep1Email] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/login-step1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        password: password.trim(),
        email: email.trim(),
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setOtpMsgColor('red');
      setOtpMsg(data.message || 'Login failed');
      return;
    }
    alert('Your OTP is: ' + data.otp);
    setStep1Email(email.trim());
    setShowOtp(true);
    setOtpMsgColor('green');
    setOtpMsg('Enter OTP shown above');
  }

  async function verifyOtp() {
    const res = await fetch('/api/login-step2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: step1Email, otp: otp.trim() }),
    });
    const data = await res.json();
    if (!data.success) {
      setOtpMsgColor('red');
      setOtpMsg(data.message || 'Invalid OTP');
      return;
    }
    setCurrentUser(data.user);
    window.location.href = '/dashboard';
  }

  return (
    <div className="login-page">
      <header className="nav-wrap">
        <div className="nav-bar">
          <div className="nav-left">
            <div className="nav-logo-mini">
              <img src="/img/logo.png" alt="Logo" />
            </div>
            <div className="nav-title">Sri Ambal Nagar Admin</div>
          </div>
          <div className="nav-right">
            <Link href="/" className="nav-link">
              <i className="fas fa-home" />
              <span>Home</span>
            </Link>
            <Link href="/about" className="nav-link">
              <i className="fas fa-info-circle" />
              <span>About</span>
            </Link>
            <Link href="/contact" className="nav-link">
              <i className="fas fa-phone" />
              <span>Contact</span>
            </Link>
            <div className="nav-pill">
              <i className="fas fa-shield-alt" style={{ marginRight: 6 }} />
              Admin Login
            </div>
          </div>
        </div>
      </header>

      <main className="page-main">
        <section className="login-left">
          <div className="logo-row">
            <div className="logo-wrap">
              <img src="/img/logo.png" alt="Sri Ambal Nagar Logo" />
            </div>
            <div>
              <div className="brand-text-main">Sri Ambal Nagar</div>
              <div className="brand-text-sub">Admin Portal</div>
            </div>
          </div>
          <p className="welcome-line">
            Welcome to the secure administration dashboard for{' '}
            <span>Sri Ambal Nagar Peoples Welfare Association</span>
          </p>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#22c55e' }}>
                <i className="fas fa-lock" />
              </div>
              <span>2FA Email OTP Protection</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#a855f7' }}>
                <i className="fas fa-users" />
              </div>
              <span>Complete Member Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#38bdf8' }}>
                <i className="fas fa-calendar" />
              </div>
              <span>Events & Notices</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#f97316' }}>
                <i className="fas fa-images" />
              </div>
              <span>Gallery Uploads</span>
            </div>
          </div>
          <div className="login-left-footer">
            Need access or forgot credentials? Please contact the association
            secretary or IT volunteer.
          </div>
        </section>

        <section className="login-right">
          <h2 className="login-title">Secure Login</h2>
          <p className="login-sub">
            Enter credentials & verify with OTP to access admin dashboard.
          </p>

          <form onSubmit={onSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrap">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span className="input-icon">
                  <i className="fas fa-user" />
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-icon">
                  <i className="fas fa-lock" />
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-icon">
                  <i className="fas fa-envelope" />
                </span>
              </div>
            </div>
            <button type="submit" className="login-btn">
              <i className="fas fa-paper-plane" />
              Send OTP
            </button>
          </form>

          {showOtp && (
            <div className="otp-box">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <div className="input-wrap">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <span className="input-icon">
                    <i className="fas fa-key" />
                  </span>
                </div>
              </div>
              <button type="button" className="login-btn" onClick={verifyOtp}>
                <i className="fas fa-check-circle" />
                Verify & Login
              </button>
              <p className="otp-msg" style={{ color: otpMsgColor }}>
                {otpMsg}
              </p>
            </div>
          )}

          {!showOtp && otpMsg && (
            <p className="otp-msg" style={{ color: otpMsgColor }}>
              {otpMsg}
            </p>
          )}

          <div className="helper-text">
            Protected by advanced two-factor authentication. Only authorized
            admins are allowed to login.
          </div>
        </section>
      </main>
    </div>
  );
}
