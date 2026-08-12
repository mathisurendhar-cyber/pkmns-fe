'use client';

import { ReactNode } from 'react';
import SiteNavbar from './SiteNavbar';
import './public-layout.css';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
  title?: string;
  variant?: 'standard' | 'home';
}) {
  return (
    <div className="public-root">
      <SiteNavbar />
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
