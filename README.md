# Cartographer

A read-only REST API for querying Points of Interest (POIs) and administrative zones in Madagascar. Built with Fastify and TypeScript using hexagonal architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Development
npm run dev

# Production
npm run build
npm start
```

## Endpoints

### Health
- `GET /health` - Server health check

### POIs
- `GET /pois` - List all POIs
- `GET /pois?category=food` - Filter by category
- `GET /pois?lat=-18.9&lng=47.5` - POIs near a point (ordered by distance)
- `GET /pois?lat=-18.9&lng=47.5&radius=5000` - POIs within radius (meters)
- `GET /pois/:id` - Get single POI

### Zones
- `GET /zones` - List all zones
- `GET /zones?type=district` - Filter by zone type
- `GET /zones?lat=-18.9&lng=47.5` - Zones containing a point
- `GET /zones/:id` - Get single zone
- `GET /zones/:id/pois` - POIs inside a zone

### Pagination

All list endpoints support cursor-based pagination:

```
GET /pois?limit=20
GET /pois?limit=20&cursor=<nextCursor>
```

Response format:
```json
{
  "items": [...],
  "nextCursor": "base64string",
  "hasMore": true
}
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for details on the hexagonal architecture.

## Documentation

- [Architecture](docs/architecture.md) - Hexagonal architecture overview
- [Pagination](docs/pagination.md) - Cursor-based pagination
- [Spatial Queries](docs/spatial-queries.md) - PostGIS spatial queries
