import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { buildCorsOptions, getAllowedOrigins } from './cors.config';

/**
 * Local/Render entrypoint — a long-lived process with app.listen(). The
 * Vercel serverless entrypoint (api/index.ts) shares the same CORS config
 * but never calls listen(); Vercel invokes the exported handler per request
 * instead.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(buildCorsOptions());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`OMG Backend API is running on port ${port}`);
  console.log(`CORS allow-list: ${getAllowedOrigins().join(', ')}`);
}
bootstrap();
