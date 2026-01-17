import type { FastifyInstance } from 'fastify';
import type { GetPoiUseCase, ListPoisUseCase } from '../../../application';

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

interface PoiRouteDeps {
  getPoi: GetPoiUseCase;
  listPois: ListPoisUseCase;
}

export function createPoiRoutes({ getPoi, listPois }: PoiRouteDeps) {
  return async function poiRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: ListPoisQuery }>(
      '/pois',
      {
        schema: {
          tags: ['pois'],
          summary: 'List POIs',
          description: 'Retrieve a paginated list of Points of Interest with optional filtering and spatial queries',
          querystring: {
            type: 'object',
            properties: {
              cursor: {
                type: 'string',
                description: 'Pagination cursor from previous response',
              },
              limit: {
                type: 'string',
                description: 'Number of items per page (default: 20, max: 100)',
                default: '20',
              },
              category: {
                type: 'string',
                description: 'Filter by POI category',
              },
              lat: {
                type: 'string',
                description: 'Latitude for proximity search (requires lng)',
              },
              lng: {
                type: 'string',
                description: 'Longitude for proximity search (requires lat)',
              },
              radius: {
                type: 'string',
                description: 'Search radius in meters (requires lat and lng)',
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { type: 'object', additionalProperties: true } },
                nextCursor: { type: 'string', nullable: true },
                hasMore: { type: 'boolean' },
              },
            },
          },
        },
      },
      async (request, reply) => {
        const { cursor, limit = '20', category, lat, lng, radius } = request.query;
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);

        const hasCoordinates = lat !== undefined && lng !== undefined;
        const near = hasCoordinates ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
        const radiusQuery = hasCoordinates && radius ? { center: near!, radiusMeters: parseFloat(radius) } : undefined;

        const result = await listPois.execute({
          cursor,
          limit: parsedLimit,
          category,
          near: radiusQuery ? undefined : near,
          radius: radiusQuery,
        });

        return reply.send(result);
      },
    );

    fastify.get<{ Params: PoiParams }>(
      '/pois/:id',
      {
        schema: {
          tags: ['pois'],
          summary: 'Get POI by ID',
          description: 'Retrieve a single Point of Interest by its OpenStreetMap ID',
          params: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'OpenStreetMap ID of the POI',
              },
            },
            required: ['id'],
          },
          response: {
            200: {
              type: 'object',
              additionalProperties: true,
              description: 'POI details',
            },
            404: {
              type: 'object',
              properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      async (request, reply) => {
        const poi = await getPoi.execute(request.params.id);

        if (!poi) {
          return reply.notFound('POI not found');
        }

        return reply.send(poi);
      },
    );
  };
}
