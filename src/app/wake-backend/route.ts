import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function backendBase() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  ).replace(/\/$/, '');
}

export async function POST() {
  const base = backendBase();
  if (!base) {
    return NextResponse.json(
      { ok: false, message: 'NEXT_PUBLIC_API_URL is not set on Vercel.' },
      { status: 500 },
    );
  }

  try {
    const host = new URL(base).hostname;
    const subdomain = host.split('.')[0];
    if (host.includes('snapdeploy') && subdomain) {
      await fetch(`https://snapdeploy.dev/api/public/wake/${subdomain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Failed to wake backend container');
    console.error(err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return POST();
}
