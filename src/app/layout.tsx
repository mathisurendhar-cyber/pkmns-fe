import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AmbalNagar Makkal Nalvazhu Sangam',
  description: 'Community association portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
