import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/backend-proxy';

type RouteContext = { params: { path: string[] } };

async function handle(req: NextRequest, { params }: RouteContext) {
  const path = params.path.join('/');
  return proxyToBackend(req, `/api/${path}`);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
