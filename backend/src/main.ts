import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Origins permitted to call the API.
 *
 * Override in any environment with a comma-separated CORS_ORIGINS value, e.g.
 *   CORS_ORIGINS=https://orchestrai-omg.web.app,https://console.example.com
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://orchestrai-omg.web.app',
  'https://orchestrai-omg.firebaseapp.com',
  'http://localhost:5173',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS);

  app.enableCors({
    // Requests with no Origin header (server-to-server, curl, health probes)
    // are allowed through; browser requests must come from a known origin.
    origin: (origin, callback) => {
      // Deny by returning false rather than throwing: the browser still blocks
      // the response (no CORS headers are sent) but the server answers normally
      // instead of emitting a 500 for every disallowed origin.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-role'],
    credentials: true,
    maxAge: 600,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`OMG Backend API is running on port ${port}`);
  console.log(`CORS allow-list: ${allowedOrigins.join(', ')}`);
}
bootstrap();
