import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/backend-proxy';

type RouteContext = { params: { path: string[] } };

async function handle(req: NextRequest, { params }: RouteContext) {
  const path = params.path.join('/');
  return proxyToBackend(req, `/uploads/${path}`);
}

export const GET = handle;
export const HEAD = handle;
