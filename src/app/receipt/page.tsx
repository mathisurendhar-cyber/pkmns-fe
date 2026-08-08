'use client';

import { Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import './receipt.css';

function ReceiptInner() {
  const searchParams = useSearchParams();
  const billAreaRef = useRef<HTMLDivElement>(null);

  const bill = searchParams.get('bill') || '';
  const dt = searchParams.get('dt') || new Date().toLocaleString();
  const name = searchParams.get('name') || '';
  const mobile = searchParams.get('mobile') || '';
  const address = searchParams.get('address') || '';
  const amount = searchParams.get('amount') || '';

  async function downloadReceipt() {
    if (!billAreaRef.current) return;
    const canvas = await html2canvas(billAreaRef.current);
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = `${bill || 'receipt'}.png`;
    link.click();
  }

  return (
    <div className="rcpt-card" id="billArea" ref={billAreaRef}>
      <div className="rcpt-title">OFFICIAL RECEIPT</div>
      <div className="rcpt-org">Ambal Nagar People&apos;s Welfare Association</div>
      <div className="rcpt-bill">
        <span className="bill-label">Receipt No:</span> <span>{bill}</span>
      </div>
      <div className="rcpt-date">Date: {dt}</div>
      <div className="rcpt-sep" />
      <table className="rcpt-table">
        <tbody>
          <tr>
            <th>Name:</th>
            <td>{name}</td>
          </tr>
          <tr>
            <th>Mobile:</th>
            <td>{mobile}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>{address}</td>
          </tr>
          <tr>
            <th>Amount (INR):</th>
            <td>
              <b>{amount}</b>
            </td>
          </tr>
          <tr>
            <th>Paid To (UPI):</th>
            <td>mathisurendhar-2@okicici</td>
          </tr>
        </tbody>
      </table>
      <div className="rcpt-sep" />
      <button type="button" className="btn-download" onClick={downloadReceipt}>
        Download Receipt
      </button>
      <div className="thanks">Thank you for your support!</div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <div className="receipt-page">
      <Suspense fallback={<div className="rcpt-card">Loading...</div>}>
        <ReceiptInner />
      </Suspense>
    </div>
  );
}
