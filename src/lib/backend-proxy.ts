import { NextRequest, NextResponse } from 'next/server';

export function getBackendUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
) {
  const url = `${getBackendUrl()}${backendPath}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'connection') return;
    headers.set(key, value);
  });

  const init: RequestInit = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(url, init);
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return;
      responseHeaders.set(key, value);
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Backend proxy failed:', url, err);
    return NextResponse.json(
      {
        success: false,
        message:
          'Backend unavailable. Set API_URL on Vercel to your SnapDeploy backend URL.',
      },
      { status: 503 },
    );
  }
}
