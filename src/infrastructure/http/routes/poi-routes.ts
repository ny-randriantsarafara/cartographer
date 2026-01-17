import type { FastifyInstance } from "fastify";
import type { UseCases } from "../../container.js";

interface PoiParams {
  id: string;
}

interface ListPoisQuery {
  cursor?: string;
  limit?: string;
  category?: string;
  lat?: string;
  lng?: string;
  radius?: string;
}

export function createPoiRoutes(useCases: UseCases) {
  return async function poiRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: ListPoisQuery }>("/pois", async (request, reply) => {
      const { cursor, limit = "20", category, lat, lng, radius } = request.query;
      const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);

      const hasCoordinates = lat !== undefined && lng !== undefined;
      const near = hasCoordinates ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
      const radiusQuery = hasCoordinates && radius
        ? { center: near!, radiusMeters: parseFloat(radius) }
        : undefined;

      const result = await useCases.listPois.execute({
        cursor,
        limit: parsedLimit,
        category,
        near: radiusQuery ? undefined : near,
        radius: radiusQuery,
      });

      return reply.send(result);
    });

    fastify.get<{ Params: PoiParams }>("/pois/:id", async (request, reply) => {
      const poi = await useCases.getPoi.execute(request.params.id);

      if (!poi) {
        return reply.notFound("POI not found");
      }

      return reply.send(poi);
    });
  };
}
