export function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    ''
  ).replace(/\/$/, '');
}

function isLocalBackend(base: string) {
  return !base || /localhost|127\.0\.0\.1/.test(base);
}

export type ApiFetchInit = RequestInit & {
  onRetry?: (attempt: number, max: number) => void;
};

let wakePromise: Promise<void> | null = null;

async function wakeBackend() {
  if (typeof window === 'undefined') return;
  if (isLocalBackend(getBackendBaseUrl())) return;
  if (!wakePromise) {
    wakePromise = fetch('/wake-backend', { method: 'POST', cache: 'no-store' })
      .then(() => undefined)
      .catch(() => undefined);
  }
  await wakePromise;
}

function shouldRetry(res: Response) {
  if (res.status === 503) return true;
  const type = res.headers.get('content-type') || '';
  if (type.includes('text/html') && res.headers.get('x-wake-page')) {
    return true;
  }
  return false;
}

export async function apiFetch(
  path: string,
  init: ApiFetchInit = {},
): Promise<Response> {
  const { onRetry, ...rest } = init;
  const max = 24;
  let lastRes: Response | null = null;

  await wakeBackend();

  for (let attempt = 1; attempt <= max; attempt += 1) {
    try {
      const res = await fetch(path, { ...rest, cache: 'no-store' });
      lastRes = res;
      if (!shouldRetry(res)) return res;
    } catch {
      // Container may still be booting.
    }

    onRetry?.(attempt, max);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    if (attempt % 4 === 0) {
      wakePromise = null;
      await wakeBackend();
    }
  }

  if (lastRes) return lastRes;
  throw new Error('Backend did not wake in time');
}

export async function api<T = unknown>(
  path: string,
  init?: ApiFetchInit,
): Promise<T> {
  const res = await apiFetch(path.startsWith('/') ? path : `/${path}`, init);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

export async function apiJson<T = unknown>(
  path: string,
  body?: unknown,
  method = 'POST',
): Promise<T> {
  return api<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
