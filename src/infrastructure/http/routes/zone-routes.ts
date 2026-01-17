import type { FastifyInstance } from 'fastify';
import type { GetZoneUseCase, ListZonesUseCase, ListPoisUseCase } from '../../../application';

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

interface ZoneRouteDeps {
  getZone: GetZoneUseCase;
  listZones: ListZonesUseCase;
  listPois: ListPoisUseCase;
}

export function createZoneRoutes({ getZone, listZones, listPois }: ZoneRouteDeps) {
  return async function zoneRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: ListZonesQuery }>(
      '/zones',
      {
        schema: {
          tags: ['zones'],
          summary: 'List Zones',
          description: 'Retrieve a paginated list of zones with optional filtering and point containment queries',
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
              type: {
                type: 'string',
                description: 'Filter by zone type (e.g., district, region)',
              },
              lat: {
                type: 'string',
                description: 'Latitude for point containment search (requires lng)',
              },
              lng: {
                type: 'string',
                description: 'Longitude for point containment search (requires lat)',
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
        const { cursor, limit = '20', type, lat, lng } = request.query;
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);

        const hasCoordinates = lat !== undefined && lng !== undefined;
        const containing = hasCoordinates ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

        const result = await listZones.execute({
          cursor,
          limit: parsedLimit,
          type,
          containing,
        });

        return reply.send(Array.isArray(result) ? { items: result } : result);
      },
    );

    fastify.get<{ Params: ZoneParams }>(
      '/zones/:id',
      {
        schema: {
          tags: ['zones'],
          summary: 'Get Zone by ID',
          description: 'Retrieve a single zone by its OpenStreetMap ID',
          params: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'OpenStreetMap ID of the zone',
              },
            },
            required: ['id'],
          },
          response: {
            200: {
              type: 'object',
              additionalProperties: true,
              description: 'Zone details',
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
        const zone = await getZone.execute(request.params.id);

        if (!zone) {
          return reply.notFound('Zone not found');
        }

        return reply.send(zone);
      },
    );

    fastify.get<{ Params: ZoneParams; Querystring: ZonePoisQuery }>(
      '/zones/:id/pois',
      {
        schema: {
          tags: ['zones'],
          summary: 'List POIs in Zone',
          description: 'Retrieve a paginated list of Points of Interest within a specific zone',
          params: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'OpenStreetMap ID of the zone',
              },
            },
            required: ['id'],
          },
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
        const { cursor, limit = '20' } = request.query;
        const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);

        const zone = await getZone.execute(request.params.id);
        if (!zone) {
          return reply.notFound('Zone not found');
        }

        const result = await listPois.execute({
          cursor,
          limit: parsedLimit,
          zoneId: request.params.id,
        });

        return reply.send(result);
      },
    );
  };
}
