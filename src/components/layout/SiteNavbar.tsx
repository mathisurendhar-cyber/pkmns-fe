'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import './site-navbar.css';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/members', label: 'Members' },
  { href: '/events', label: 'Events' },
  { href: '/service', label: 'Service' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/login', label: 'Login' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState('/img/avatar1.png');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    setUserName(user.name || user.username || null);

    const photo = (user as { avatar?: string }).avatar?.trim();
    if (photo) setAvatar(photo);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="site-navbar">
      <div className="site-navbar-inner">
        <Link href="/" className="site-navbar-brand">
          <span className="site-navbar-logo">
            <img
              src="/img/logo.png"
              alt="Sri Ambal Nagar logo"
              onError={(e) => {
                e.currentTarget.src = '/img/profile-default.png';
              }}
            />
          </span>
          <span className="site-navbar-title">
            <strong>Sri AmbalNagar</strong>
            <small>Makkal Nalvazhu Sangam</small>
          </span>
        </Link>

        {userName && (
          <div className="site-navbar-user">
            <img src={avatar} alt="User avatar" />
            <span>{userName}</span>
          </div>
        )}

        <button
          type="button"
          className="site-navbar-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '×' : '☰'}
        </button>

        <nav className={`site-navbar-nav ${open ? 'is-open' : ''}`}>
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? 'is-active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
