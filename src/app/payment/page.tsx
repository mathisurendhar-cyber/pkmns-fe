'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import './payment.css';

export default function PaymentPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('100');
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLabel, setQrLabel] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!qrOpen || !canvasRef.current) return;
    const upiId = 'mathisurendhar-2@okicici';
    const upiUrl = `upi://pay?pa=${upiId}&pn=AmbalNagar&am=${amount}&cu=INR`;
    QRCode.toCanvas(canvasRef.current, upiUrl, { width: 160 }, (err) => {
      if (err) console.error(err);
    });
  }, [qrOpen, amount]);

  function openQr() {
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    setQrLabel(`QR – ₹${amount || '100'}`);
    setQrOpen(true);
  }

  function generateReceipt() {
    const bill = 'AMBAL' + Math.floor(100000 + Math.random() * 999999);
    const dt = encodeURIComponent(new Date().toLocaleString('en-IN'));
    const link = `/receipt?name=${encodeURIComponent(name)}&mobile=${encodeURIComponent(mobile)}&address=${encodeURIComponent(address)}&amount=${encodeURIComponent(amount)}&bill=${bill}&dt=${dt}`;
    window.location.href = link;
  }

  return (
    <div className="payment-page">
      <div className="split">
        <section className="left">
          <div className="logo-circle">
            <img src="/img/logo.png" alt="Ambal Nagar Logo" />
          </div>
          <h1>Ambal Nagar Association</h1>
          <p>
            Pay your membership fees securely using UPI QR. Works with GPay,
            PhonePe, Paytm and all major UPI apps.
          </p>
          <ul className="bullet">
            <li>✔ Instant QR based payment</li>
            <li>✔ Auto receipt after payment</li>
            <li>✔ Your details stay private & secure</li>
          </ul>
        </section>

        <section className="right">
          <div className="card">
            <div className="card-header">
              <h2>Membership Payment</h2>
              <span>Fill details & pay via QR</span>
            </div>
            <div className="form-wrap">
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <button className="btn-main" type="button" onClick={openQr}>
                  Pay via QR
                </button>
              </form>
            </div>
            <p className="hint">
              You will be redirected to receipt page after payment.
            </p>
          </div>
        </section>
      </div>

      {qrOpen && (
        <div className="qr-modal active">
          <div className="qr-box">
            <h2>{qrLabel}</h2>
            <div className="qr-code-container">
              <canvas ref={canvasRef} />
            </div>
            <div className="qr-instruction">
              Scan this QR with your UPI payment app to pay.
            </div>
            <button type="button" className="receipt-btn" onClick={generateReceipt}>
              View Receipt
            </button>
            <button
              type="button"
              className="receipt-btn"
              onClick={() => setQrOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
