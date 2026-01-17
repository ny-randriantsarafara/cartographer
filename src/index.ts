import Fastify from "fastify";
import sensible from "@fastify/sensible";
import { loadEnv } from "./config/env.js";
import { createDatabase, KyselyPoiRepository, KyselyZoneRepository } from "./infrastructure/persistence/index.js";
import { GetPoiUseCase, ListPoisUseCase } from "./application/poi/index.js";
import { GetZoneUseCase, ListZonesUseCase } from "./application/zone/index.js";
import { healthRoutes } from "./infrastructure/http/routes/health-routes.js";
import { createPoiRoutes } from "./infrastructure/http/routes/poi-routes.js";
import { createZoneRoutes } from "./infrastructure/http/routes/zone-routes.js";

async function main() {
  const env = loadEnv();

  const db = createDatabase(env.databaseUrl);

  const poiRepository = new KyselyPoiRepository(db);
  const zoneRepository = new KyselyZoneRepository(db);

  const getPoiUseCase = new GetPoiUseCase(poiRepository);
  const listPoisUseCase = new ListPoisUseCase(poiRepository);
  const getZoneUseCase = new GetZoneUseCase(zoneRepository);
  const listZonesUseCase = new ListZonesUseCase(zoneRepository);

  const fastify = Fastify({ logger: true });

  await fastify.register(sensible);
  await fastify.register(healthRoutes);
  await fastify.register(createPoiRoutes(getPoiUseCase, listPoisUseCase));
  await fastify.register(createZoneRoutes(getZoneUseCase, listZonesUseCase, listPoisUseCase));

  try {
    const address = await fastify.listen({ port: env.port, host: env.host });
    fastify.log.info(`Server listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
