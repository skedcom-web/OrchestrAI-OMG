/**
 * Vercel serverless entrypoint for the OMG NestJS backend.
 *
 * Vercel does not run a long-lived process, so this never calls
 * app.listen() (unlike src/main.ts, used for Render/local). Instead the
 * Nest app is built once per warm serverless instance (cached in
 * `cachedHandler`, cleared on cold start) and reused as an Express request
 * handler on every invocation.
 */
import 'reflect-metadata';
import express, { type Express } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { buildCorsOptions } from '../src/cors.config';

let cachedHandler: Express | null = null;

async function bootstrapServer(): Promise<Express> {
  if (cachedHandler) return cachedHandler;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors(buildCorsOptions());
  await app.init();

  cachedHandler = expressApp;
  return expressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrapServer();
  server(req as unknown as express.Request, res as unknown as express.Response);
}
