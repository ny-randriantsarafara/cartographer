import 'dotenv/config';

export interface Env {
  databaseUrl: string;
  port: number;
  host: string;
}

export function loadEnv(): Env {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    databaseUrl,
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  };
}
