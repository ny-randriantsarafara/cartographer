import type { FastifyInstance } from 'fastify';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get<{ Reply: HealthResponse }>(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Health check',
        description: 'Check the health status of the API server',
        response: {
          200: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['ok', 'error'],
                description: 'Server health status',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Current server timestamp',
              },
              uptime: {
                type: 'number',
                description: 'Server uptime in seconds',
              },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    },
  );
}
