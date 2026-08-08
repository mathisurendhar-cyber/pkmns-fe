'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import {
  AuthUser,
  getCurrentUser,
  isAdminRole,
  logout,
  requireAuth,
} from '@/lib/auth';
import './admin-layout.css';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
  { href: '/next-event', label: 'Events', icon: 'fa-calendar-alt' },
  { href: '/newslist', label: 'News', icon: 'fa-newspaper' },
  { href: '/servicework', label: 'Services', icon: 'fa-tools' },
  { href: '/manage-member', label: 'Members', icon: 'fa-users', admin: true },
  { href: '/add-member', label: 'Add Member', icon: 'fa-user-plus', admin: true },
  {
    href: '/membership-applications',
    label: 'Applications',
    icon: 'fa-clipboard-check',
    admin: true,
  },
  {
    href: '/admin-users',
    label: 'Admin Users',
    icon: 'fa-user-shield',
    admin: true,
  },
  {
    href: '/office-bearers',
    label: 'Office Bearers',
    icon: 'fa-id-badge',
    admin: true,
  },
  { href: '/', label: 'Home', icon: 'fa-home' },
];

export default function AdminLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = requireAuth();
    if (u) setUser(u);
  }, []);

  const admin = isAdminRole(user?.role);

  if (!user) {
    return (
      <div className="admin-loading">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/img/logo.png" alt="Logo" />
          <div>
            <strong>AmbalNagar</strong>
            <span>Admin Portal</span>
          </div>
        </div>
        <nav>
          {LINKS.filter((l) => !l.admin || admin).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fas ${link.icon}`} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1>{title || 'Admin'}</h1>
          <div className="topbar-right">
            <span>{user.name || user.username}</span>
            <button type="button" onClick={() => logout('/')}>
              Logout
            </button>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export function useAdminUser() {
  return getCurrentUser();
}
