import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { loadEnv } from './config';
import { createDatabase } from './infrastructure/persistence';
import { createContainer } from './infrastructure';
import { healthRoutes, createPoiRoutes, createZoneRoutes } from './infrastructure/http/routes';

async function main() {
  const env = loadEnv();

  const db = createDatabase(env.databaseUrl);
  const container = createContainer(db);

  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const serverUrl = process.env.SERVER_URL || `http://localhost:${env.port}`;

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Cartographer API',
        description: 'API for managing POIs and Zones with spatial queries',
        version: '0.1.0',
      },
      servers: [
        {
          url: serverUrl,
          description: isProduction ? 'Production server' : 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'pois', description: 'Point of Interest endpoints' },
        { name: 'zones', description: 'Zone endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  await fastify.register(sensible);
  await fastify.register(healthRoutes);
  await fastify.register(
    createPoiRoutes({
      getPoi: container.useCases.getPoi,
      listPois: container.useCases.listPois,
    }),
  );
  await fastify.register(
    createZoneRoutes({
      getZone: container.useCases.getZone,
      listZones: container.useCases.listZones,
      listPois: container.useCases.listPois,
    }),
  );

  try {
    const address = await fastify.listen({ port: env.port, host: env.host });
    fastify.log.info(`Server listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
