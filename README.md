# PKMNS Frontend (Next.js)

Ambalnagar community portal UI — Next.js App Router, preserving original page content and behavior.

## Setup

```bash
npm install
npm run dev
```

App: `http://localhost:3000`

Requires backend at `http://localhost:3001` (see `NEXT_PUBLIC_API_URL` in `.env.local`).

API and upload requests are proxied via Next.js rewrites to the NestJS server.
