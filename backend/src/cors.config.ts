/**
 * Origins permitted to call the API — shared between the local/Render
 * entrypoint (main.ts) and the Vercel serverless entrypoint (api/index.ts)
 * so the two never drift apart.
 *
 * Override in any environment with a comma-separated CORS_ORIGINS value, e.g.
 *   CORS_ORIGINS=https://orchestrai-omg.web.app,https://console.example.com
 */
export const DEFAULT_ALLOWED_ORIGINS = [
  'https://orchestrai-omg.web.app',
  'https://orchestrai-omg.firebaseapp.com',
  'http://localhost:5173',
];

export function getAllowedOrigins(): string[] {
  return process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
}

export function buildCorsOptions() {
  const allowedOrigins = getAllowedOrigins();
  return {
    // Requests with no Origin header (server-to-server, curl, health probes)
    // are allowed through; browser requests must come from a known origin.
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Deny by returning false rather than throwing: the browser still blocks
      // the response (no CORS headers are sent) but the server answers normally
      // instead of emitting a 500 for every disallowed origin.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-role'],
    credentials: true,
    maxAge: 600,
  };
}
