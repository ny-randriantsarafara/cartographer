import type { FastifyInstance } from "fastify";
import type { GetZoneUseCase, ListZonesUseCase } from "../../../application/zone/index.js";
import type { ListPoisUseCase } from "../../../application/poi/index.js";

interface ZoneParams {
  id: string;
}

interface ListZonesQuery {
  cursor?: string;
  limit?: string;
  type?: string;
  lat?: string;
  lng?: string;
}

interface ZonePoisQuery {
  cursor?: string;
  limit?: string;
}

export function createZoneRoutes(
  getZoneUseCase: GetZoneUseCase,
  listZonesUseCase: ListZonesUseCase,
  listPoisUseCase: ListPoisUseCase
) {
  return async function zoneRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: ListZonesQuery }>("/zones", async (request, reply) => {
      const { cursor, limit = "20", type, lat, lng } = request.query;
      const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);

      const hasCoordinates = lat !== undefined && lng !== undefined;
      const containing = hasCoordinates ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

      const result = await listZonesUseCase.execute({
        cursor,
        limit: parsedLimit,
        type,
        containing,
      });

      return reply.send(Array.isArray(result) ? { items: result } : result);
    });

    fastify.get<{ Params: ZoneParams }>("/zones/:id", async (request, reply) => {
      const zone = await getZoneUseCase.execute(request.params.id);

      if (!zone) {
        return reply.notFound("Zone not found");
      }

      return reply.send(zone);
    });

    fastify.get<{ Params: ZoneParams; Querystring: ZonePoisQuery }>(
      "/zones/:id/pois",
      async (request, reply) => {
        const { cursor, limit = "20" } = request.query;
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);

        const zone = await getZoneUseCase.execute(request.params.id);
        if (!zone) {
          return reply.notFound("Zone not found");
        }

        const result = await listPoisUseCase.execute({
          cursor,
          limit: parsedLimit,
          zoneId: request.params.id,
        });

        return reply.send(result);
      }
    );
  };
}
