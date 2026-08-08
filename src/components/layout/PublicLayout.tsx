'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ReactNode } from 'react';
import './public-layout.css';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Members' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Login' },
];

export default function PublicLayout({
  children,
  title,
  variant = 'standard',
}: {
  children: ReactNode;
  title?: string;
  variant?: 'standard' | 'home';
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className={`public-root ${variant === 'home' ? 'public-home' : ''}`}>
      <header className={variant === 'home' ? 'home-header' : 'public-header'}>
        <div className="header-container">
          <div className="brand">
            <img src="/img/logo.png" alt="Logo" className="brand-logo" />
            <span className="logo">
              {title || 'Sri Ambal Nagar Peoples Welfare Association'}
            </span>
          </div>
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <nav>
            <ul className={`menu ${open ? 'show' : ''}`}>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={pathname === item.href ? 'active' : ''}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer>
        <p>
          &copy; {new Date().getFullYear()} Sri Ambal Nagar Peoples Welfare
          Association
        </p>
      </footer>
    </div>
  );
}
