import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { loadEnv } from "./config/env.js";
import { createDatabase } from "./infrastructure/persistence/index.js";
import { createContainer } from "./infrastructure/container.js";
import { healthRoutes } from "./infrastructure/http/routes/health-routes.js";
import { createPoiRoutes } from "./infrastructure/http/routes/poi-routes.js";
import { createZoneRoutes } from "./infrastructure/http/routes/zone-routes.js";

async function main() {
  const env = loadEnv();

  const db = createDatabase(env.databaseUrl);
  const container = createContainer(db);

  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Cartographer API",
        description: "API for managing POIs and Zones with spatial queries",
        version: "0.1.0",
      },
      servers: [
        {
          url: `http://localhost:${env.port}`,
          description: "Development server",
        },
      ],
      tags: [
        { name: "health", description: "Health check endpoints" },
        { name: "pois", description: "Point of Interest endpoints" },
        { name: "zones", description: "Zone endpoints" },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  await fastify.register(sensible);
  await fastify.register(healthRoutes);
  await fastify.register(createPoiRoutes(container.useCases));
  await fastify.register(createZoneRoutes(container.useCases));

  try {
    const address = await fastify.listen({ port: env.port, host: env.host });
    fastify.log.info(`Server listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
